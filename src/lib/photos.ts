import type { VenuePhoto } from "@/lib/types";
import { mediaUrl } from "@/lib/format";

export function imagePhotos(photos: VenuePhoto[]) {
  return photos.filter((p) => p.ext !== "pdf" && p.kind !== "floorplan");
}

export function coverPhoto(photos: VenuePhoto[]) {
  const images = imagePhotos(photos);
  return images.find((p) => p.kind === "gallery") ?? images[0] ?? null;
}

export function coverUrl(venueId: string, photos: VenuePhoto[], thumb = true) {
  const cover = coverPhoto(photos);
  if (!cover) return null;
  return mediaUrl(venueId, cover.id, cover.ext, thumb && cover.hasThumb);
}
