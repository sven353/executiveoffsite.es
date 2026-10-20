import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FilterBar } from "@/components/FilterBar";
import { InquiryDialog } from "@/components/InquiryDialog";
import { JsonLd } from "@/components/JsonLd";
import { VenueCard } from "@/components/VenueCard";
import { filterVenues, parseFilters } from "@/lib/filters";
import { SITE } from "@/lib/site";
import { REGIONS } from "@/lib/venue-options";
import { getPublishedVenues } from "@/lib/venues";

type Params = Promise<{ region: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { region } = await params;
  const r = REGIONS.find((x) => x.value === region);
  if (!r) return {};
  return {
    title: `Executive offsite venues in ${r.label}`,
    description: `${r.blurb} Curated masias and estates with private single rooms, plenary space and verified connectivity details.`,
    alternates: { canonical: `/regions/${r.value}` },
  };
}

export default async function RegionPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { region } = await params;
  const r = REGIONS.find((x) => x.value === region);
  if (!r) notFound();

  const filters = { ...parseFilters(await searchParams), region: r.value };
  const inRegion = (await getPublishedVenues().catch(() => [])).filter((v) => v.region === r.value);
  const venues = filterVenues(inRegion, filters);

  return (
    <div className="wrap py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: SITE.name, item: SITE.url },
            { "@type": "ListItem", position: 2, name: r.label, item: `${SITE.url}/regions/${r.value}` },
          ],
        }}
      />
      <p className="eyebrow">Region</p>
      <h1 className="mt-3 text-4xl">Executive offsite venues in {r.label}</h1>
      <p className="mt-3 max-w-2xl text-muted">{r.blurb}</p>

      <div className="mt-8">
        <Suspense fallback={null}>
          <FilterBar lockRegion total={inRegion.length} shown={venues.length} />
        </Suspense>
      </div>

      {venues.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((v) => (
            <VenueCard key={v.id} venue={v} />
          ))}
        </div>
      ) : (
        <div className="card mt-8 p-10 text-center">
          <h2 className="text-2xl">No venue listed in {r.label} yet</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted">
            We add venues one at a time after reviewing them. Tell us what you need and we will look.
          </p>
          <div className="mt-6 flex justify-center">
            <InquiryDialog label="Request a shortlist" contactEmail={SITE.contactEmail} />
          </div>
        </div>
      )}
    </div>
  );
}
