export type VenueStatus = "draft" | "pending_review" | "published" | "archived";
export type PhotoKind = "gallery" | "plenary" | "floorplan";
export type PhotoExt = "jpg" | "png" | "webp" | "pdf";

export type VenuePhoto = {
  id: string;
  kind: PhotoKind;
  ext: PhotoExt;
  hasThumb: boolean;
  caption: string;
  alt: string;
};

export type VenueContact = {
  name: string;
  email: string;
  phone: string;
};

export type VenueAdminData = {
  agreementStatus: "none" | "sent" | "signed";
  agreementSignedAt: string;
  commissionRate: number;
  internalNotes: string;
};

// Everything that is safe to show on the public site.
export type PublicVenue = {
  id: string;
  slug: string;
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
  wifiVerified: boolean;
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
  verified: boolean;
  photos: VenuePhoto[];
  updatedAt: string;
};

// Full record, including private fields. Never pass this to public pages.
export type Venue = Omit<PublicVenue, "photos"> & {
  status: VenueStatus;
  photos: VenuePhoto[];
  photoRightsConfirmed: boolean;
  contact: VenueContact;
  admin: VenueAdminData;
  ownerTokenHash: string | null;
  createdAt: string;
  publishedAt: string | null;
  verifiedAt: string | null;
};
