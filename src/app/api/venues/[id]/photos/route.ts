import { randomUUID } from "node:crypto";
import { getKV } from "@/lib/store";
import { isAdminRequest, sameOrigin } from "@/lib/session";
import {
  getVenue,
  isEditableByOwner,
  revalidatePublic,
  saveVenue,
  venueForOwnerToken,
} from "@/lib/venues";
import type { PhotoExt, PhotoKind, Venue, VenuePhoto } from "@/lib/types";

export const runtime = "nodejs";

const MAX_PHOTOS = 40;
const MAX_FILE = 4_000_000;
const MAX_THUMB = 600_000;
const KINDS: PhotoKind[] = ["gallery", "plenary", "floorplan"];

function json(body: unknown, status = 200) {
  return Response.json(body, { status });
}

async function authorize(req: Request, id: string): Promise<{ venue: Venue } | { error: Response }> {
  if (!sameOrigin(req)) return { error: json({ error: "Forbidden" }, 403) };

  if (isAdminRequest(req)) {
    const venue = await getVenue(id);
    return venue ? { venue } : { error: json({ error: "Venue not found" }, 404) };
  }

  const token = req.headers.get("x-owner-token");
  if (token) {
    const venue = await venueForOwnerToken(token);
    if (!venue || venue.id !== id) return { error: json({ error: "Invalid link" }, 403) };
    if (!isEditableByOwner(venue)) {
      return { error: json({ error: "This listing is live. Contact us to request changes." }, 409) };
    }
    return { venue };
  }

  return { error: json({ error: "Unauthorised" }, 401) };
}

// Identify the real file type from its first bytes instead of trusting the upload.
function sniff(buf: Uint8Array): { ext: PhotoExt; mime: string } | null {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" };
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return { ext: "png", mime: "image/png" };
  }
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) {
    return { ext: "webp", mime: "image/webp" };
  }
  if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) {
    return { ext: "pdf", mime: "application/pdf" };
  }
  return null;
}

function clean(value: unknown, max = 200) {
  return String(value ?? "").trim().slice(0, max);
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const auth = await authorize(req, id);
  if ("error" in auth) return auth.error;
  const { venue } = auth;

  if (venue.photos.length >= MAX_PHOTOS) {
    return json({ error: `A listing can hold up to ${MAX_PHOTOS} files` }, 400);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: "Invalid upload" }, 400);
  }

  const file = form.get("file");
  const thumb = form.get("thumb");
  const kind = clean(form.get("kind"), 20) as PhotoKind;
  if (!(file instanceof File)) return json({ error: "No file" }, 400);
  if (!KINDS.includes(kind)) return json({ error: "Invalid kind" }, 400);
  if (file.size > MAX_FILE) return json({ error: "File is too large (4 MB maximum)" }, 413);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniff(bytes);
  if (!type) return json({ error: "Use JPEG, PNG, WebP or PDF files" }, 415);
  if (type.ext === "pdf" && kind !== "floorplan") {
    return json({ error: "PDF files can only be used as floorplans" }, 415);
  }

  const photoId = randomUUID();
  const media = getKV("media");
  await media.setBinary(`${id}/${photoId}.${type.ext}`, bytes.buffer as ArrayBuffer, type.mime);

  let hasThumb = false;
  if (thumb instanceof File && type.ext !== "pdf" && thumb.size <= MAX_THUMB) {
    const tb = new Uint8Array(await thumb.arrayBuffer());
    if (sniff(tb)?.ext === "jpg") {
      await media.setBinary(`${id}/${photoId}-sm.jpg`, tb.buffer as ArrayBuffer, "image/jpeg");
      hasThumb = true;
    }
  }

  const photo: VenuePhoto = {
    id: photoId,
    kind,
    ext: type.ext,
    hasThumb,
    caption: "",
    alt: clean(form.get("alt")),
  };

  // Re-read right before writing so a concurrent edit is not overwritten.
  const fresh = (await getVenue(id)) ?? venue;
  const saved = await saveVenue({ ...fresh, photos: [...fresh.photos, photo] });
  revalidatePublic();
  return json({ photos: saved.photos });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const auth = await authorize(req, id);
  if ("error" in auth) return auth.error;

  let body: { photos?: Array<{ id: string; kind: string; caption?: string; alt?: string }> };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid body" }, 400);
  }
  if (!Array.isArray(body.photos)) return json({ error: "Invalid body" }, 400);

  const fresh = (await getVenue(id)) ?? auth.venue;
  const byId = new Map(fresh.photos.map((p) => [p.id, p]));
  const ordered: VenuePhoto[] = [];
  for (const item of body.photos) {
    const existing = byId.get(String(item.id));
    if (!existing) continue;
    byId.delete(existing.id);
    const kind = KINDS.includes(item.kind as PhotoKind) ? (item.kind as PhotoKind) : existing.kind;
    ordered.push({
      ...existing,
      kind: existing.ext === "pdf" ? "floorplan" : kind,
      caption: clean(item.caption),
      alt: clean(item.alt),
    });
  }
  ordered.push(...byId.values());

  const saved = await saveVenue({ ...fresh, photos: ordered });
  revalidatePublic();
  return json({ photos: saved.photos });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const auth = await authorize(req, id);
  if ("error" in auth) return auth.error;

  const photoId = new URL(req.url).searchParams.get("photoId") ?? "";
  const fresh = (await getVenue(id)) ?? auth.venue;
  const photo = fresh.photos.find((p) => p.id === photoId);
  if (!photo) return json({ error: "Photo not found" }, 404);

  const media = getKV("media");
  await media.delete(`${id}/${photo.id}.${photo.ext}`);
  if (photo.hasThumb) await media.delete(`${id}/${photo.id}-sm.jpg`);

  const saved = await saveVenue({ ...fresh, photos: fresh.photos.filter((p) => p.id !== photoId) });
  revalidatePublic();
  return json({ photos: saved.photos });
}
