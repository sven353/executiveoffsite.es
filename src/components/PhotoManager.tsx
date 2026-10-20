"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, FileText, Trash2, Upload } from "lucide-react";
import { mediaUrl } from "@/lib/format";
import type { PhotoKind, VenuePhoto } from "@/lib/types";
import { PHOTO_KINDS } from "@/lib/venue-options";

type Props = {
  venueId: string;
  initialPhotos: VenuePhoto[];
  ownerToken?: string;
};

// Shrinks a photo in the browser before upload so pages load fast and storage stays small.
async function toJpeg(file: File, maxSide: number, quality: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not process image"))), "image/jpeg", quality)
  );
}

export function PhotoManager({ venueId, initialPhotos, ownerToken }: Props) {
  const [photos, setPhotos] = useState<VenuePhoto[]>(initialPhotos);
  const [uploadKind, setUploadKind] = useState<PhotoKind>("gallery");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const endpoint = `/api/venues/${venueId}/photos`;
  const headers: Record<string, string> = ownerToken ? { "x-owner-token": ownerToken } : {};

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (dirty) await save(photos);
    setError("");
    setMessage("");
    const list = Array.from(files);

    // One at a time: each upload updates the venue record, so parallel uploads could overwrite each other.
    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      setBusy(`Uploading ${i + 1} of ${list.length}`);
      try {
        const body = new FormData();
        body.set("kind", uploadKind);

        if (file.type === "application/pdf") {
          if (uploadKind !== "floorplan") throw new Error("PDF files can only be added as floorplans");
          if (file.size > 3_900_000) throw new Error(`${file.name} is larger than 4 MB`);
          body.set("file", file);
        } else {
          const side = uploadKind === "floorplan" ? 2400 : 2000;
          let quality = 0.85;
          let full = await toJpeg(file, side, quality);
          while (full.size > 3_500_000 && quality > 0.5) {
            quality -= 0.1;
            full = await toJpeg(file, side, quality);
          }
          const thumb = await toJpeg(file, 800, 0.8);
          body.set("file", new File([full], "photo.jpg", { type: "image/jpeg" }));
          body.set("thumb", new File([thumb], "thumb.jpg", { type: "image/jpeg" }));
          body.set("alt", file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
        }

        const res = await fetch(endpoint, { method: "POST", body, headers });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Upload failed");
        setPhotos(json.photos);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
        break;
      }
    }
    setBusy("");
    if (input.current) input.current.value = "";
  }

  async function save(next: VenuePhoto[]) {
    setBusy("Saving");
    setError("");
    setMessage("");
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          photos: next.map((p) => ({ id: p.id, kind: p.kind, caption: p.caption, alt: p.alt })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      setPhotos(json.photos);
      setDirty(false);
      setMessage("Photo details saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
    setBusy("");
  }

  async function remove(id: string) {
    if (!confirm("Delete this file?")) return;
    setBusy("Deleting");
    setError("");
    try {
      const res = await fetch(`${endpoint}?photoId=${id}`, { method: "DELETE", headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Delete failed");
      setPhotos(json.photos);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
    setBusy("");
  }

  function edit(id: string, patch: Partial<VenuePhoto>) {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    setDirty(true);
  }

  function move(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= photos.length) return;
    const next = [...photos];
    [next[index], next[j]] = [next[j], next[index]];
    setPhotos(next);
    setDirty(true);
  }

  return (
    <section className="card p-6">
      <h2 className="font-serif text-xl">Photos and floorplans</h2>
      <p className="mt-1 text-sm text-muted">
        Upload your own photos. They are resized automatically. The first gallery photo is the cover. Add at least
        three photos of the property, and photos of the actual working room under Plenary.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="label" htmlFor="upload-kind">Add as</label>
          <select
            id="upload-kind"
            className="select"
            value={uploadKind}
            onChange={(e) => setUploadKind(e.target.value as PhotoKind)}
          >
            {PHOTO_KINDS.map((k) => (
              <option key={k.value} value={k.value}>{k.label}</option>
            ))}
          </select>
        </div>
        <label className={`btn btn-primary ${busy ? "pointer-events-none opacity-60" : "cursor-pointer"}`}>
          <Upload size={16} /> Choose files
          <input
            ref={input}
            type="file"
            multiple
            accept={uploadKind === "floorplan" ? "image/*,application/pdf" : "image/*"}
            className="hidden"
            onChange={(e) => upload(e.target.files)}
          />
        </label>
        {busy && <p className="text-sm text-muted" role="status">{busy}</p>}
      </div>

      {error && <p className="error-text mt-3" role="alert">{error}</p>}
      {message && <p className="mt-3 text-sm text-olive" role="status">{message}</p>}

      {photos.length > 0 && (
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {photos.map((p, i) => (
            <li key={p.id} className="grid gap-3 py-4 sm:grid-cols-[96px_1fr_auto] sm:items-start">
              <div className="flex h-20 w-24 items-center justify-center overflow-hidden bg-line">
                {p.ext === "pdf" ? (
                  <a href={mediaUrl(venueId, p.id, p.ext)} target="_blank" rel="noopener" aria-label="Open PDF">
                    <FileText />
                  </a>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(venueId, p.id, p.ext, p.hasThumb)} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <select
                  className="select"
                  value={p.kind}
                  disabled={p.ext === "pdf"}
                  onChange={(e) => edit(p.id, { kind: e.target.value as PhotoKind })}
                  aria-label="Type"
                >
                  {PHOTO_KINDS.map((k) => (
                    <option key={k.value} value={k.value}>{k.label}</option>
                  ))}
                </select>
                <input
                  className="input"
                  value={p.alt}
                  maxLength={200}
                  placeholder="Describe the photo (alt text)"
                  onChange={(e) => edit(p.id, { alt: e.target.value })}
                  aria-label="Alt text"
                />
                <input
                  className="input sm:col-span-2"
                  value={p.caption}
                  maxLength={200}
                  placeholder="Caption (optional)"
                  onChange={(e) => edit(p.id, { caption: e.target.value })}
                  aria-label="Caption"
                />
              </div>
              <div className="flex gap-1">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                  <ArrowUp size={14} />
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => move(i, 1)} disabled={i === photos.length - 1} aria-label="Move down">
                  <ArrowDown size={14} />
                </button>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(p.id)} aria-label="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {dirty && (
        <div className="mt-4">
          <button type="button" className="btn btn-primary" onClick={() => save(photos)} disabled={Boolean(busy)}>
            Save order and descriptions
          </button>
        </div>
      )}
    </section>
  );
}
