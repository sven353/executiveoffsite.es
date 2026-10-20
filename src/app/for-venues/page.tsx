import type { Metadata } from "next";
import { VenueApplicationForm } from "@/components/VenueApplicationForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "For masias, estates and sanctuaries",
  description:
    "List your property for executive offsites. No listing fee. A commission applies only to confirmed corporate bookings introduced through the site.",
  alternates: { canonical: "/for-venues" },
};

export default function ForVenuesPage() {
  return (
    <div className="wrap py-12">
      <p className="eyebrow">For venue owners</p>
      <h1 className="mt-3 max-w-3xl text-4xl sm:text-5xl">Corporate groups who respect the property</h1>
      <p className="mt-5 max-w-2xl text-lg text-muted">
        {SITE.name} introduces leadership teams to a small number of reviewed properties in Catalonia. The groups
        are small, they book between Tuesday and Thursday and they come to work.
      </p>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-10">
          <section>
            <h2 className="text-2xl">What it costs</h2>
            <p className="mt-3 text-muted">
              There is no listing fee. When a corporate booking is confirmed through this site, the venue pays{" "}
              {SITE.commissionPercent}% commission to {SITE.operator.name}. The terms are set out in a short listing
              agreement that we send you before the property goes live.
            </p>
          </section>
          <section>
            <h2 className="text-2xl">How a listing is created</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-muted">
              <li>You send the form. We talk with you and review the property.</li>
              <li>We send you a private link where you enter the details and upload your own photos.</li>
              <li>We check the key figures, then publish the listing.</li>
            </ol>
          </section>
          <section>
            <h2 className="text-2xl">What we ask for</h2>
            <p className="mt-3 text-muted">
              The number of private single rooms and en-suite bathrooms, the meeting spaces, your Wi-Fi speed and
              photos you own or have the right to use. Listings are edited only through your private link, and
              nothing goes live without our review.
            </p>
          </section>
        </div>

        <div>
          <h2 className="mb-4 text-2xl">Apply to be listed</h2>
          <VenueApplicationForm contactEmail={SITE.contactEmail} />
        </div>
      </div>
    </div>
  );
}
