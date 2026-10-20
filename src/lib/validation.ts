import { z } from "zod";
import { ARCHETYPE_VALUES, REGION_VALUES } from "@/lib/venue-options";

const text = (max: number) => z.string().trim().max(max).default("");

const optInt = (max = 100000) =>
  z.preprocess(
    (v) => (v === "" || v == null ? null : Number(v)),
    z.number().int().min(0).max(max).nullable()
  );

const reqInt = (max = 1000) =>
  z.preprocess(
    (v) => (v === "" || v == null ? 0 : Number(v)),
    z.number().int().min(0).max(max)
  );

const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

export const venueFormSchema = z
  .object({
    name: z.string().trim().min(2, "Name is required").max(120),
    region: z.enum(REGION_VALUES, { message: "Choose a region" }),
    summary: text(300),
    description: text(5000),
    distanceBcnKm: optInt(400),
    driveTimeBcnMin: optInt(600),
    distanceGiKm: optInt(400),
    driveTimeGiMin: optInt(600),
    singleRoomsCount: reqInt(),
    totalBedsCount: reqInt(),
    ensuiteBathroomsCount: reqInt(),
    maxPlenaryCapacity: optInt(1000),
    breakoutSpacesCount: reqInt(100),
    wifiDownloadMbps: optInt(100000),
    wifiUploadMbps: optInt(100000),
    starlink: checkbox,
    avScreen: text(200),
    avProjector: checkbox,
    avWhiteboards: checkbox,
    acousticPrivacyScore: z.preprocess(
      (v) => (v === "" || v == null ? null : Number(v)),
      z.number().int().min(1).max(5).nullable()
    ),
    archetypes: z.array(z.enum(ARCHETYPE_VALUES)).default([]),
    privateChef: checkbox,
    fullBuyout: checkbox,
    nearestTrainStation: text(120),
    transfersNotes: text(1000),
    contactName: text(120),
    contactEmail: z.union([z.literal(""), z.email("Enter a valid email")]).default(""),
    contactPhone: text(40),
    photoRightsConfirmed: checkbox,
  })
  .superRefine((v, ctx) => {
    if (v.totalBedsCount < v.singleRoomsCount) {
      ctx.addIssue({
        code: "custom",
        path: ["totalBedsCount"],
        message: "Total beds cannot be lower than single rooms",
      });
    }
    if (v.ensuiteBathroomsCount > Math.max(v.singleRoomsCount, v.totalBedsCount)) {
      ctx.addIssue({
        code: "custom",
        path: ["ensuiteBathroomsCount"],
        message: "En-suite bathrooms cannot exceed the number of rooms",
      });
    }
  });

export type VenueFormInput = z.infer<typeof venueFormSchema>;

export function formDataToObject(fd: FormData) {
  const obj: Record<string, unknown> = {};
  for (const key of new Set(fd.keys())) {
    const all = fd.getAll(key);
    obj[key] = key === "archetypes" ? all : all[0];
  }
  if (!("archetypes" in obj)) obj.archetypes = [];
  return obj;
}

export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export const adminSettingsSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens")
    .max(80),
  status: z.enum(["draft", "pending_review", "published", "archived"]),
  verified: checkbox,
  wifiVerified: checkbox,
  agreementStatus: z.enum(["none", "sent", "signed"]),
  agreementSignedAt: text(10),
  commissionRate: z.preprocess(
    (v) => (v === "" || v == null ? 5 : Number(v)),
    z.number().min(0).max(100)
  ),
  internalNotes: text(5000),
});
