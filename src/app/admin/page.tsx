import Link from "next/link";
import { createVenueAction } from "@/app/actions/venue";
import { NewVenueForm } from "@/components/AdminPanels";
import { formatDate } from "@/lib/format";
import { requireAdmin } from "@/lib/session";
import { regionLabel, STATUS_LABELS } from "@/lib/venue-options";
import { listAllVenues } from "@/lib/venues";

export const dynamic = "force-dynamic";

const ORDER = ["pending_review", "draft", "published", "archived"];

export default async function AdminHomePage() {
  await requireAdmin();
  const venues = await listAllVenues();
  const sorted = [...venues].sort(
    (a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status) || a.name.localeCompare(b.name)
  );
  const pending = venues.filter((v) => v.status === "pending_review").length;

  return (
    <div className="wrap py-10">
      <h1 className="text-3xl">Venues</h1>
      <p className="mt-2 text-sm text-muted">
        {venues.length} venues, {venues.filter((v) => v.status === "published").length} published
        {pending > 0 ? `, ${pending} waiting for your review` : ""}.
      </p>

      <div className="mt-6">
        <NewVenueForm action={createVenueAction} />
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-[0.1em] text-muted">
            <tr>
              <th className="px-4 py-3">Venue</th>
              <th className="px-4 py-3">Region</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Single rooms</th>
              <th className="px-4 py-3">Photos</th>
              <th className="px-4 py-3">Agreement</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted">No venues yet. Create the first one above.</td>
              </tr>
            )}
            {sorted.map((v) => (
              <tr key={v.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/admin/venues/${v.id}`}>{v.name}</Link>
                  {v.verified && <span className="tag tag-verified ml-2">Verified</span>}
                </td>
                <td className="px-4 py-3">{regionLabel(v.region)}</td>
                <td className="px-4 py-3">
                  <span className="tag">{STATUS_LABELS[v.status]}</span>
                </td>
                <td className="px-4 py-3">{v.singleRoomsCount}</td>
                <td className="px-4 py-3">{v.photos.length}</td>
                <td className="px-4 py-3">{v.admin.agreementStatus}</td>
                <td className="px-4 py-3 text-muted">{formatDate(v.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-sm text-muted">
        Availability requests and venue applications arrive in your Netlify dashboard under Forms, and by email if
        you add a form notification there.
      </p>
    </div>
  );
}
