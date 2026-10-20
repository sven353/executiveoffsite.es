export function mediaUrl(venueId: string, photoId: string, ext: string, thumb = false) {
  return `/media/${venueId}/${photoId}${thumb ? "-sm" : ""}.${thumb ? "jpg" : ext}`;
}

export function formatDrive(min: number | null | undefined) {
  if (min == null) return null;
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function formatWifi(down: number | null, up: number | null) {
  if (down == null) return null;
  return up != null ? `${down} / ${up} Mbps` : `${down} Mbps`;
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}
