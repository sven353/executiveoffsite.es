import type { Venue } from "@/lib/types";

// The subset of a venue that the edit form needs. Safe to hand to client components.
export type EditorValues = {
  name: string;
  region: string;
  summary: string;
  description: string;
  distanceBcnKm: number | null;
  driveTimeBcnMin: number | null;
  distanceGiKm: number | null;
  driveTimeGiMin: number | null;
  singleRoomsCount: number;
  totalBedsCount: number;
  ensuiteBathroomsCount: number;
  maxPlenaryCapacity: number | null;
  breakoutSpacesCount: number;
  wifiDownloadMbps: number | null;
  wifiUploadMbps: number | null;
  starlink: boolean;
  avScreen: string;
  avProjector: boolean;
  avWhiteboards: boolean;
  acousticPrivacyScore: number | null;
  archetypes: string[];
  privateChef: boolean;
  fullBuyout: boolean;
  nearestTrainStation: string;
  transfersNotes: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  photoRightsConfirmed: boolean;
};

export function toEditorValues(v: Venue): EditorValues {
  return {
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
    contactName: v.contact.name,
    contactEmail: v.contact.email,
    contactPhone: v.contact.phone,
    photoRightsConfirmed: v.photoRightsConfirmed,
  };
}
