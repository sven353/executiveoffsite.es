import type { Metadata } from "next";
import { saveVenueAsOwner } from "@/app/actions/venue";
import { PhotoManager } from "@/components/PhotoManager";
import { VenueEditor } from "@/components/VenueEditor";
import { toEditorValues } from "@/lib/editor";
import { SITE } from "@/lib/site";
import { STATUS_LABELS } from "@/lib/venue-options";
import { isEditableByOwner, venueForOwnerToken } from "@/lib/venues";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your listing",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function OwnerPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const venue = await venueForOwnerToken(decodeURIComponent(token));

  if (!venue) {
    return (
      <div className="wrap max-w-xl py-20">
        <h1 className="text-3xl">This link is not valid</h1>
        <p className="mt-4 text-muted">
          The link may have been replaced or switched off. Please ask us for a new one
          {SITE.contactEmail ? ` at ${SITE.contactEmail}` : ""}.
        </p>
      </div>
    );
  }

  const editable = isEditableByOwner(venue);

  return (
    <div className="wrap max-w-3xl py-10">
      <p className="eyebrow">Your listing</p>
      <h1 className="mt-2 text-3xl">{venue.name}</h1>
      <p className="mt-2 text-sm text-muted">
        Status: {STATUS_LABELS[venue.status]}. Keep this page address private, it gives access to your listing.
      </p>

      {!editable ? (
        <div className="card mt-8 p-6">
          <h2 className="font-serif text-xl">This listing is live</h2>
          <p className="mt-2 text-muted">
            To change anything on a published listing, write to us
            {SITE.contactEmail ? ` at ${SITE.contactEmail}` : ""} and we will update it.
          </p>
        </div>
      ) : (
        <>
          <p className="card mt-6 p-4 text-sm">
            Fill in what you can and save as often as you like. When the details and photos are complete, choose
            Submit for review. We check every listing before it goes live.
          </p>
          <div className="mt-8 space-y-8">
            <VenueEditor mode="owner" values={toEditorValues(venue)} action={saveVenueAsOwner.bind(null, decodeURIComponent(token))} />
            <PhotoManager venueId={venue.id} initialPhotos={venue.photos} ownerToken={decodeURIComponent(token)} />
          </div>
        </>
      )}
    </div>
  );
}
