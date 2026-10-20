import "server-only";
import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { getKV } from "@/lib/store";
import { slugify } from "@/lib/format";
import type { PublicVenue, Venue } from "@/lib/types";
import type { VenueFormInput } from "@/lib/validation";

const venueKey = (id: string) => `venue/${id}.json`;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string) {
  return UUID.test(value);
}

export async function listAllVenues(): Promise<Venue[]> {
  const kv = getKV("venues");
  const keys = await kv.list("venue/");
  const venues = await Promise.all(keys.map((k) => kv.getJSON<Venue>(k)));
  return venues
    .filter((v): v is Venue => Boolean(v))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getVenue(id: string): Promise<Venue | null> {
  if (!isUuid(id)) return null;
  return getKV("venues").getJSON<Venue>(venueKey(id));
}

export async function saveVenue(venue: Venue): Promise<Venue> {
  const next = { ...venue, updatedAt: new Date().toISOString() };
  await getKV("venues").setJSON(venueKey(venue.id), next);
  return next;
}

export async function deleteVenue(id: string) {
  const media = getKV("media");
  const keys = await media.list(`${id}/`);
  await Promise.all(keys.map((k) => media.delete(k)));
  await getKV("venues").delete(venueKey(id));
}

async function uniqueSlug(name: string, ignoreId?: string) {
  const base = slugify(name) || "venue";
  const taken = new Set(
    (await listAllVenues()).filter((v) => v.id !== ignoreId).map((v) => v.slug)
  );
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}

export async function slugIsFree(slug: string, ignoreId: string) {
  const all = await listAllVenues();
  return !all.some((v) => v.slug === slug && v.id !== ignoreId);
}

export async function createVenue(name: string, region: string): Promise<Venue> {
  const now = new Date().toISOString();
  const venue: Venue = {
    id: randomUUID(),
    slug: await uniqueSlug(name),
    name,
    region,
    status: "draft",
    summary: "",
    description: "",
    distanceBcnKm: null,
    driveTimeBcnMin: null,
    distanceGiKm: null,
    driveTimeGiMin: null,
    singleRoomsCount: 0,
    totalBedsCount: 0,
    ensuiteBathroomsCount: 0,
    maxPlenaryCapacity: null,
    breakoutSpacesCount: 0,
    wifiDownloadMbps: null,
    wifiUploadMbps: null,
    wifiVerified: false,
    starlink: false,
    avScreen: "",
    avProjector: false,
    avWhiteboards: false,
    acousticPrivacyScore: null,
    archetypes: [],
    privateChef: false,
    fullBuyout: false,
    nearestTrainStation: "",
    transfersNotes: "",
    verified: false,
    photos: [],
    photoRightsConfirmed: false,
    contact: { name: "", email: "", phone: "" },
    admin: {
      agreementStatus: "none",
      agreementSignedAt: "",
      commissionRate: 5,
      internalNotes: "",
    },
    ownerTokenHash: null,
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
    verifiedAt: null,
  };
  await getKV("venues").setJSON(venueKey(venue.id), venue);
  return venue;
}

export function applyVenueForm(venue: Venue, input: VenueFormInput): Venue {
  return {
    ...venue,
    name: input.name,
    region: input.region,
    summary: input.summary,
    description: input.description,
    distanceBcnKm: input.distanceBcnKm,
    driveTimeBcnMin: input.driveTimeBcnMin,
    distanceGiKm: input.distanceGiKm,
    driveTimeGiMin: input.driveTimeGiMin,
    singleRoomsCount: input.singleRoomsCount,
    totalBedsCount: input.totalBedsCount,
    ensuiteBathroomsCount: input.ensuiteBathroomsCount,
    maxPlenaryCapacity: input.maxPlenaryCapacity,
    breakoutSpacesCount: input.breakoutSpacesCount,
    wifiDownloadMbps: input.wifiDownloadMbps,
    wifiUploadMbps: input.wifiUploadMbps,
    starlink: input.starlink,
    avScreen: input.avScreen,
    avProjector: input.avProjector,
    avWhiteboards: input.avWhiteboards,
    acousticPrivacyScore: input.acousticPrivacyScore,
    archetypes: input.archetypes,
    privateChef: input.privateChef,
    fullBuyout: input.fullBuyout,
    nearestTrainStation: input.nearestTrainStation,
    transfersNotes: input.transfersNotes,
    photoRightsConfirmed: input.photoRightsConfirmed,
    contact: {
      name: input.contactName,
      email: input.contactEmail,
      phone: input.contactPhone,
    },
  };
}

export function toPublic(v: Venue): PublicVenue {
  return {
    id: v.id,
    slug: v.slug,
    name: v.name,
    region: v.region,
    summary: v.summary,
    description: v.description,
    distanceBcnKm: v.distanceBcnKm,
    driveTimeBcnMin: v.driveTimeBcnMin,
    distanceGiKm: v.distanceGiKm,
    driveTimeGiMin: v.driveTimeGiMin,
    singleRoomsCount: v.singleRoomsCount,
    totalBedsCount: v.totalBedsCount,
    ensuiteBathroomsCount: v.ensuiteBathroomsCount,
    maxPlenaryCapacity: v.maxPlenaryCapacity,
    breakoutSpacesCount: v.breakoutSpacesCount,
    wifiDownloadMbps: v.wifiDownloadMbps,
    wifiUploadMbps: v.wifiUploadMbps,
    wifiVerified: v.wifiVerified,
    starlink: v.starlink,
    avScreen: v.avScreen,
    avProjector: v.avProjector,
    avWhiteboards: v.avWhiteboards,
    acousticPrivacyScore: v.acousticPrivacyScore,
    archetypes: v.archetypes,
    privateChef: v.privateChef,
    fullBuyout: v.fullBuyout,
    nearestTrainStation: v.nearestTrainStation,
    transfersNotes: v.transfersNotes,
    verified: v.verified,
    photos: v.photos,
    updatedAt: v.updatedAt,
  };
}

// Cached for five minutes and refreshed immediately when an admin saves (tag "venues").
export const getPublishedVenues = unstable_cache(
  async (): Promise<PublicVenue[]> => {
    const all = await listAllVenues();
    return all.filter((v) => v.status === "published").map(toPublic);
  },
  ["published-venues"],
  { tags: ["venues"], revalidate: 300 }
);

export async function getPublishedVenueBySlug(slug: string) {
  const all = await getPublishedVenues();
  return all.find((v) => v.slug === slug) ?? null;
}

export function revalidatePublic() {
  revalidateTag("venues");
  revalidatePath("/", "layout");
}

// Owner invite links: "{venueId}.{secret}". Only a hash of the secret is stored.
function sha256Hex(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function newOwnerToken(venueId: string) {
  const secret = randomBytes(24).toString("base64url");
  return { token: `${venueId}.${secret}`, hash: sha256Hex(secret) };
}

export async function venueForOwnerToken(token: string): Promise<Venue | null> {
  const [id, secret] = token.split(".");
  if (!id || !secret || !isUuid(id)) return null;
  const venue = await getVenue(id);
  if (!venue?.ownerTokenHash) return null;
  const a = Buffer.from(sha256Hex(secret), "hex");
  const b = Buffer.from(venue.ownerTokenHash, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return venue;
}

export function isEditableByOwner(venue: Venue) {
  return venue.status === "draft" || venue.status === "pending_review";
}
