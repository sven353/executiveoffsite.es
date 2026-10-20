import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, ShieldCheck } from "lucide-react";
import { FacilitationSlot } from "@/components/FacilitationSlot";
import { InquiryDialog } from "@/components/InquiryDialog";
import { JsonLd } from "@/components/JsonLd";
import { formatDrive, formatWifi, mediaUrl } from "@/lib/format";
import { coverUrl, imagePhotos } from "@/lib/photos";
import { SITE } from "@/lib/site";
import { archetypeLabel, regionLabel } from "@/lib/venue-options";
import { getPublishedVenueBySlug } from "@/lib/venues";

export const revalidate = 300;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const v = await getPublishedVenueBySlug(slug).catch(() => null);
  if (!v) return {};
  const title = `${v.name}, executive offsite venue in ${regionLabel(v.region)}`;
  const description =
    v.summary ||
    `${v.name} in ${regionLabel(v.region)}: ${v.singleRoomsCount} private single rooms, plenary space and logistics for executive offsites near Barcelona.`;
  const cover = coverUrl(v.id, v.photos, false);
  return {
    title,
    description,
    alternates: { canonical: `/venues/${v.slug}` },
    openGraph: { title, description, images: cover ? [{ url: cover }] : undefined },
  };
}

function Fact({ label, value, note }: { label: string; value: React.ReactNode; note?: string }) {
  return (
    <div className="border-t border-line pt-3">
      <dt className="text-xs uppercase tracking-[0.12em] text-muted">{label}</dt>
      <dd className="mt-1 text-lg font-medium">{value}</dd>
      {note && <p className="text-xs text-muted">{note}</p>}
    </div>
  );
}

export default async function VenuePage({ params }: { params: Params }) {
  const { slug } = await params;
  const v = await getPublishedVenueBySlug(slug).catch(() => null);
  if (!v) notFound();

  const images = imagePhotos(v.photos);
  const plenary = images.filter((p) => p.kind === "plenary");
  const gallery = images.filter((p) => p.kind !== "plenary");
  const floorplans = v.photos.filter((p) => p.kind === "floorplan");
  const wifi = formatWifi(v.wifiDownloadMbps, v.wifiUploadMbps);
  const av = [
    v.avScreen && `Screen: ${v.avScreen}`,
    v.avProjector && "Projector",
    v.avWhiteboards && "Mobile whiteboards",
  ].filter(Boolean) as string[];

  const amenities = [
    wifi && "Wi-Fi",
    v.starlink && "Starlink",
    v.privateChef && "Private chef",
    v.fullBuyout && "Exclusive use of the property",
    v.avProjector && "Projector",
    v.avWhiteboards && "Whiteboards",
  ].filter(Boolean) as string[];

  const cover = coverUrl(v.id, v.photos, false);

  return (
    <article>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "LodgingBusiness",
            name: v.name,
            url: `${SITE.url}/venues/${v.slug}`,
            description: v.summary || v.description.slice(0, 300),
            image: cover ? `${SITE.url}${cover}` : undefined,
            address: { "@type": "PostalAddress", addressRegion: "Catalonia", addressCountry: "ES" },
            numberOfRooms: v.singleRoomsCount || undefined,
            amenityFeature: amenities.map((name) => ({
              "@type": "LocationFeatureSpecification",
              name,
              value: true,
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: SITE.name, item: SITE.url },
              { "@type": "ListItem", position: 2, name: "Venues", item: `${SITE.url}/venues` },
              { "@type": "ListItem", position: 3, name: v.name, item: `${SITE.url}/venues/${v.slug}` },
            ],
          },
        ]}
      />

      <div className="wrap pt-10">
        <nav className="text-sm text-muted" aria-label="Breadcrumb">
          <Link href="/venues">Venues</Link>
          <span className="mx-2">/</span>
          <Link href={`/regions/${v.region}`}>{regionLabel(v.region)}</Link>
        </nav>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="eyebrow">{regionLabel(v.region)}</span>
              {v.archetypes.map((a) => (
                <span key={a} className="tag">{archetypeLabel(a)}</span>
              ))}
              {v.verified && (
                <span className="tag tag-verified inline-flex items-center gap-1">
                  <ShieldCheck size={12} /> Verified
                </span>
              )}
            </div>
            <h1 className="mt-3 text-4xl sm:text-5xl">{v.name}</h1>
            {v.summary && <p className="mt-4 text-lg text-muted">{v.summary}</p>}
          </div>
          <div className="flex flex-wrap gap-3">
            <InquiryDialog label="Check availability for this venue" venue={{ slug: v.slug, name: v.name }} contactEmail={SITE.contactEmail} />
            <InquiryDialog
              label="Add Kuma facilitation"
              venue={{ slug: v.slug, name: v.name }}
              defaultFacilitation="include"
              variant="ghost"
              contactEmail={SITE.contactEmail}
            />
          </div>
        </div>
      </div>

      {gallery[0] && (
        <div className="wrap mt-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mediaUrl(v.id, gallery[0].id, gallery[0].ext)}
            alt={gallery[0].alt || `${v.name}, ${regionLabel(v.region)}`}
            className="aspect-[16/8] w-full object-cover"
          />
        </div>
      )}

      <section className="wrap mt-10" aria-labelledby="facts-title">
        <h2 id="facts-title" className="sr-only">Key facts</h2>
        <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          <Fact label="Private single rooms" value={v.singleRoomsCount} note={`${v.totalBedsCount} beds in total`} />
          <Fact label="En-suite bathrooms" value={v.ensuiteBathroomsCount} />
          <Fact label="Plenary capacity" value={v.maxPlenaryCapacity ? `${v.maxPlenaryCapacity} seats` : "On request"} />
          <Fact label="Breakout spaces" value={v.breakoutSpacesCount} />
          <Fact
            label="Drive from Barcelona airport"
            value={formatDrive(v.driveTimeBcnMin) ?? "On request"}
            note={v.distanceBcnKm != null ? `${v.distanceBcnKm} km` : undefined}
          />
          {(v.driveTimeGiMin != null || v.distanceGiKm != null) && (
            <Fact
              label="Drive from Girona"
              value={formatDrive(v.driveTimeGiMin) ?? "On request"}
              note={v.distanceGiKm != null ? `${v.distanceGiKm} km` : undefined}
            />
          )}
          <Fact
            label="Wi-Fi (down / up)"
            value={wifi ?? "On request"}
            note={wifi ? (v.wifiVerified ? "Speed tested by us" : "Reported by the owner") : undefined}
          />
          {v.starlink && <Fact label="Satellite backup" value="Starlink available" />}
          {v.acousticPrivacyScore != null && (
            <Fact label="Acoustic privacy" value={`${v.acousticPrivacyScore} out of 5`} />
          )}
          <Fact label="Private chef" value={v.privateChef ? "Available on site" : "Not on site"} />
          <Fact label="Exclusive use" value={v.fullBuyout ? "Full buyout available" : "Shared with other guests"} />
          {v.nearestTrainStation && <Fact label="Nearest train station" value={v.nearestTrainStation} />}
        </dl>
      </section>

      {(plenary.length > 0 || av.length > 0) && (
        <section className="wrap mt-16" aria-labelledby="plenary-title">
          <p className="eyebrow">Where the work happens</p>
          <h2 id="plenary-title" className="mt-2 text-3xl">Plenary and working spaces</h2>
          {av.length > 0 && <p className="mt-3 text-muted">{av.join(" · ")}</p>}
          {plenary.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {plenary.map((p) => (
                <figure key={p.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mediaUrl(v.id, p.id, p.ext)}
                    alt={p.alt || `Plenary space at ${v.name}`}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  {p.caption && <figcaption className="mt-2 text-sm text-muted">{p.caption}</figcaption>}
                </figure>
              ))}
            </div>
          )}
        </section>
      )}

      {v.description && (
        <section className="wrap mt-16 grid gap-8 lg:grid-cols-[1fr_2fr]">
          <h2 className="text-3xl">About the property</h2>
          <div className="prose-body max-w-2xl text-muted">{v.description}</div>
        </section>
      )}

      {(v.transfersNotes || floorplans.length > 0) && (
        <section className="wrap mt-16 grid gap-8 lg:grid-cols-[1fr_2fr]">
          <h2 className="text-3xl">Logistics</h2>
          <div className="max-w-2xl space-y-4 text-muted">
            {v.transfersNotes && <p className="prose-body">{v.transfersNotes}</p>}
            {floorplans.length > 0 && (
              <ul className="space-y-2">
                {floorplans.map((f, i) => (
                  <li key={f.id}>
                    <a
                      href={mediaUrl(v.id, f.id, f.ext)}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-2 text-ink"
                    >
                      <FileText size={16} /> {f.caption || `Floorplan ${floorplans.length > 1 ? i + 1 : ""}`}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {gallery.length > 1 && (
        <section className="wrap mt-16" aria-labelledby="gallery-title">
          <h2 id="gallery-title" className="text-3xl">Gallery</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.slice(1).map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.id}
                src={mediaUrl(v.id, p.id, p.ext, p.hasThumb)}
                alt={p.alt || `${v.name}, ${regionLabel(v.region)}`}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            ))}
          </div>
        </section>
      )}

      <div className="wrap mt-16">
        <FacilitationSlot venue={{ slug: v.slug, name: v.name }} />
      </div>
    </article>
  );
}
