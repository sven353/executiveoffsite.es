import Link from "next/link";
import { BedDouble, Car, ShieldCheck, Wifi } from "lucide-react";
import type { PublicVenue } from "@/lib/types";
import { formatDrive, formatWifi } from "@/lib/format";
import { coverUrl } from "@/lib/photos";
import { archetypeLabel, regionLabel } from "@/lib/venue-options";

export function VenueCard({ venue }: { venue: PublicVenue }) {
  const img = coverUrl(venue.id, venue.photos);
  const wifi = formatWifi(venue.wifiDownloadMbps, venue.wifiUploadMbps);
  const drive = formatDrive(venue.driveTimeBcnMin);
  const setting = venue.archetypes[0] ? archetypeLabel(venue.archetypes[0]) : null;

  return (
    <Link
      href={`/venues/${venue.slug}`}
      className="card group block overflow-hidden no-underline transition-shadow hover:shadow-md"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-line">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={`${venue.name}, ${regionLabel(venue.region)}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-muted">
            Photos coming soon
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow">{regionLabel(venue.region)}</span>
          {venue.verified && (
            <span className="tag tag-verified inline-flex items-center gap-1">
              <ShieldCheck size={12} /> Verified
            </span>
          )}
        </div>
        <h3 className="mt-2 text-xl">{venue.name}</h3>
        {setting && <p className="mt-1 text-sm text-muted">{setting}</p>}

        <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4 text-sm">
          <div>
            <dt className="flex items-center gap-1 text-xs text-muted"><BedDouble size={13} /> Single rooms</dt>
            <dd className="mt-0.5 font-medium">
              {venue.singleRoomsCount}
              <span className="ml-1 text-xs font-normal text-muted">of {venue.totalBedsCount} beds</span>
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-xs text-muted"><Car size={13} /> From BCN</dt>
            <dd className="mt-0.5 font-medium">{drive ?? "n/a"}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-xs text-muted"><Wifi size={13} /> Wi-Fi</dt>
            <dd className="mt-0.5 font-medium">{wifi ?? "n/a"}</dd>
          </div>
        </dl>
      </div>
    </Link>
  );
}
