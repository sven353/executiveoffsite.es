import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteVenueAction,
  generateOwnerLink,
  revokeOwnerLink,
  saveAdminSettings,
  saveVenueAsAdmin,
} from "@/app/actions/venue";
import { AdminSettingsForm, DeleteVenueForm, OwnerLinkPanel } from "@/components/AdminPanels";
import { PhotoManager } from "@/components/PhotoManager";
import { VenueEditor } from "@/components/VenueEditor";
import { toEditorValues } from "@/lib/editor";
import { requireAdmin } from "@/lib/session";
import { STATUS_LABELS } from "@/lib/venue-options";
import { getVenue } from "@/lib/venues";

export const dynamic = "force-dynamic";

export default async function AdminVenuePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const venue = await getVenue(id);
  if (!venue) notFound();

  return (
    <div className="wrap max-w-4xl py-10">
      <Link href="/admin" className="text-sm">All venues</Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">{venue.name}</h1>
        <div className="flex items-center gap-3">
          <span className="tag">{STATUS_LABELS[venue.status]}</span>
          {venue.status === "published" && (
            <Link href={`/venues/${venue.slug}`} className="text-sm" target="_blank">View public page</Link>
          )}
        </div>
      </div>
      {venue.status === "pending_review" && (
        <p className="card mt-4 p-4 text-sm">
          The owner has submitted this listing for review. Check the details and photos, then set the status to
          Published below.
        </p>
      )}

      <div className="mt-8 space-y-8">
        <AdminSettingsForm
          action={saveAdminSettings.bind(null, venue.id)}
          values={{
            slug: venue.slug,
            status: venue.status,
            verified: venue.verified,
            wifiVerified: venue.wifiVerified,
            agreementStatus: venue.admin.agreementStatus,
            agreementSignedAt: venue.admin.agreementSignedAt,
            commissionRate: venue.admin.commissionRate,
            internalNotes: venue.admin.internalNotes,
          }}
        />

        <OwnerLinkPanel
          hasLink={Boolean(venue.ownerTokenHash)}
          generate={generateOwnerLink.bind(null, venue.id)}
          revoke={revokeOwnerLink.bind(null, venue.id)}
        />

        <VenueEditor mode="admin" values={toEditorValues(venue)} action={saveVenueAsAdmin.bind(null, venue.id)} />

        <PhotoManager venueId={venue.id} initialPhotos={venue.photos} />

        <div className="border-t border-line pt-6">
          <DeleteVenueForm name={venue.name} action={deleteVenueAction.bind(null, venue.id)} />
        </div>
      </div>
    </div>
  );
}
