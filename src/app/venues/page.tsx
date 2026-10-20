import type { Metadata } from "next";
import { Suspense } from "react";
import { FilterBar } from "@/components/FilterBar";
import { VenueCard } from "@/components/VenueCard";
import { InquiryDialog } from "@/components/InquiryDialog";
import { filterVenues, parseFilters } from "@/lib/filters";
import { SITE } from "@/lib/site";
import { getPublishedVenues } from "@/lib/venues";

export const metadata: Metadata = {
  title: "Executive offsite venues near Barcelona",
  description:
    "Browse curated masias, wine estates and sanctuaries in Catalonia. Filter by private single rooms, plenary capacity, region and setting.",
  alternates: { canonical: "/venues" },
};

export default async function VenuesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams);
  const all = await getPublishedVenues().catch(() => []);
  const venues = filterVenues(all, filters);

  return (
    <div className="wrap py-12">
      <p className="eyebrow">Directory</p>
      <h1 className="mt-3 text-4xl">Executive offsite venues in Catalonia</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Every venue lists private single rooms separately from total beds. Share the address of this page to send
        your current filters to a colleague.
      </p>

      <div className="mt-8">
        <Suspense fallback={null}>
          <FilterBar total={all.length} shown={venues.length} />
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
          <h2 className="text-2xl">
            {all.length === 0 ? "The first venues are being added" : "No venue matches these filters"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted">
            {all.length === 0
              ? "We review every venue before it is listed. Tell us what you need and we will shortlist for you."
              : "Try fewer rooms or a wider region, or ask us to shortlist for you."}
          </p>
          <div className="mt-6 flex justify-center">
            <InquiryDialog label="Request a shortlist" contactEmail={SITE.contactEmail} />
          </div>
        </div>
      )}
    </div>
  );
}
