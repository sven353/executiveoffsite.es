import { SITE } from "@/lib/site";
import { InquiryDialog } from "@/components/InquiryDialog";

export function FacilitationSlot({
  venue,
}: {
  venue?: { slug: string; name: string };
}) {
  return (
    <section className="card p-8" aria-labelledby="facilitation-title">
      <p className="eyebrow">Facilitation and strategic alignment</p>
      <h2 id="facilitation-title" className="mt-2 text-2xl">
        A venue is only part of the result
      </h2>
      <p className="mt-3 max-w-2xl text-muted">
        The room and the setting create the conditions. What the leadership team decides there depends on how the
        sessions are designed and held. {SITE.operator.name} designs and facilitates executive offsites, from the
        agenda and the hard conversations through to the decisions the team leaves with.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <InquiryDialog
          label={venue ? "Add facilitation to this booking" : "Ask about facilitation"}
          venue={venue}
          defaultFacilitation="include"
          variant="ghost"
          contactEmail={SITE.contactEmail}
        />
        <a href={SITE.operator.url} className="btn btn-ghost border-transparent underline">
          About {SITE.operator.name}
        </a>
      </div>
    </section>
  );
}
