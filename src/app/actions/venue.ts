"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import {
  adminSettingsSchema,
  fieldErrors,
  formDataToObject,
  venueFormSchema,
} from "@/lib/validation";
import {
  applyVenueForm,
  createVenue,
  deleteVenue,
  getVenue,
  isEditableByOwner,
  newOwnerToken,
  revalidatePublic,
  saveVenue,
  slugIsFree,
  venueForOwnerToken,
} from "@/lib/venues";
import { REGION_VALUES } from "@/lib/venue-options";
import type { ActionState } from "@/lib/action-state";

export async function createVenueAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const region = String(formData.get("region") ?? "");
  if (name.length < 2) return { error: "Enter the venue name", fieldErrors: { name: "Required" } };
  if (!(REGION_VALUES as readonly string[]).includes(region)) {
    return { error: "Choose a region", fieldErrors: { region: "Required" } };
  }
  const venue = await createVenue(name, region);
  redirect(`/admin/venues/${venue.id}`);
}

export async function saveVenueAsAdmin(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const venue = await getVenue(id);
  if (!venue) return { error: "Venue not found" };
  const parsed = venueFormSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields", fieldErrors: fieldErrors(parsed.error) };
  }
  await saveVenue(applyVenueForm(venue, parsed.data));
  revalidatePublic();
  revalidatePath(`/admin/venues/${id}`);
  return { ok: true, message: "Saved" };
}

export async function saveAdminSettings(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const venue = await getVenue(id);
  if (!venue) return { error: "Venue not found" };
  const parsed = adminSettingsSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields", fieldErrors: fieldErrors(parsed.error) };
  }
  const s = parsed.data;
  if (!(await slugIsFree(s.slug, id))) {
    return { error: "That slug is already used", fieldErrors: { slug: "Already used" } };
  }
  const now = new Date().toISOString();
  await saveVenue({
    ...venue,
    slug: s.slug,
    status: s.status,
    publishedAt:
      s.status === "published" && venue.status !== "published" && !venue.publishedAt
        ? now
        : venue.publishedAt,
    verified: s.verified,
    verifiedAt: s.verified && !venue.verified ? now : s.verified ? venue.verifiedAt : null,
    wifiVerified: s.wifiVerified,
    admin: {
      agreementStatus: s.agreementStatus,
      agreementSignedAt: s.agreementSignedAt,
      commissionRate: s.commissionRate,
      internalNotes: s.internalNotes,
    },
  });
  revalidatePublic();
  revalidatePath(`/admin/venues/${id}`);
  revalidatePath("/admin");
  return { ok: true, message: "Settings saved" };
}

export async function generateOwnerLink(
  id: string,
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const venue = await getVenue(id);
  if (!venue) return { error: "Venue not found" };
  const { token, hash } = newOwnerToken(id);
  await saveVenue({ ...venue, ownerTokenHash: hash });
  revalidatePath(`/admin/venues/${id}`);
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return {
    ok: true,
    message: "New link created. Copy it now, it is shown only once. Any earlier link stops working.",
    link: `${proto}://${host}/owner/${token}`,
  };
}

export async function revokeOwnerLink(
  id: string,
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const venue = await getVenue(id);
  if (!venue) return { error: "Venue not found" };
  await saveVenue({ ...venue, ownerTokenHash: null });
  revalidatePath(`/admin/venues/${id}`);
  return { ok: true, message: "Owner link revoked" };
}

export async function deleteVenueAction(id: string) {
  await requireAdmin();
  await deleteVenue(id);
  revalidatePublic();
  redirect("/admin");
}

export async function saveVenueAsOwner(
  token: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const venue = await venueForOwnerToken(token);
  if (!venue) return { error: "This link is no longer valid. Ask us for a new one." };
  if (!isEditableByOwner(venue)) {
    return { error: "This listing is live. Contact us to request changes." };
  }
  const parsed = venueFormSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields", fieldErrors: fieldErrors(parsed.error) };
  }
  const submit = formData.get("intent") === "submit";
  let next = applyVenueForm(venue, parsed.data);

  if (submit) {
    const problems: string[] = [];
    if (!next.photoRightsConfirmed) problems.push("confirm that you hold the rights to your photos");
    if (next.singleRoomsCount < 1) problems.push("enter the number of single rooms");
    if (next.photos.filter((p) => p.kind !== "floorplan").length < 3) {
      problems.push("upload at least three photos");
    }
    if (!next.contact.email) problems.push("add a contact email");
    if (problems.length) {
      await saveVenue(next);
      return { error: `Saved as draft. Before submitting, ${problems.join(", ")}.` };
    }
    next = { ...next, status: "pending_review" };
  }

  await saveVenue(next);
  revalidatePath(`/owner/${token}`);
  revalidatePath("/admin");
  return submit
    ? { ok: true, message: "Submitted for review. We will be in touch." }
    : { ok: true, message: "Saved" };
}
