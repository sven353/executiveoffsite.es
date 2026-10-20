import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { FacilitationSlot } from "@/components/FacilitationSlot";
import { SITE } from "@/lib/site";
import { ARCHETYPES, REGIONS } from "@/lib/venue-options";

const FAQ = [
  {
    q: "What counts as a single room?",
    a: "A private bedroom that one person uses alone. Every listing shows single rooms separately from total beds, so a house that sleeps 25 with bunk beds and shared rooms is not mistaken for one with 14 private rooms.",
  },
  {
    q: "How are venues selected?",
    a: "Venues are added by invitation or after review. Owners submit their details and photos and we review each listing before it goes live. A Verified label appears only after we have checked the key figures, and Wi-Fi speeds are shown as reported by the owner unless we have tested them.",
  },
  {
    q: "Do you take bookings or payments?",
    a: "No. You request availability and we put you in touch with the venue. Contract and payment are agreed directly with the venue. Using the site costs nothing, and venues pay a commission on confirmed corporate bookings that come through it.",
  },
  {
    q: "Which areas are covered?",
    a: "Penedès, Garraf, Montseny, Empordà, Bages and Maresme, all within about 150 km of Barcelona.",
  },
  {
    q: "Can you help run the offsite itself?",
    a: `Yes. ${SITE.operator.name} designs and facilitates executive offsites and leadership alignment sessions. You can ask for it in any request or add it later.`,
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE.name,
            url: SITE.url,
            description: SITE.description,
            inLanguage: "en",
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: SITE.name,
            url: SITE.url,
            parentOrganization: { "@type": "Organization", name: SITE.operator.name, url: SITE.operator.url },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />

      <section className="border-b border-line">
        <div className="wrap py-16 sm:py-24">
          <p className="eyebrow">Offsite venues near Barcelona</p>
          <h1 className="mt-4 max-w-3xl text-4xl sm:text-6xl">
            The curated portfolio of executive offsites in Catalonia
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted">
            Masias, wine estates and boutique sanctuaries within 150 km of Barcelona, filtered by real private
            bedrooms, Wi-Fi speed and plenary space.
          </p>

          <form action="/venues" method="get" className="card mt-10 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
            <div>
              <label className="label" htmlFor="h-rooms">Private single rooms needed</label>
              <input id="h-rooms" name="rooms" type="number" min={0} className="input" placeholder="For example 12" />
            </div>
            <div>
              <label className="label" htmlFor="h-region">Region</label>
              <select id="h-region" name="region" className="select" defaultValue="">
                <option value="">All regions</option>
                {REGIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="h-setting">Setting</label>
              <select id="h-setting" name="setting" className="select" defaultValue="">
                <option value="">Any setting</option>
                {ARCHETYPES.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Show venues</button>
          </form>
        </div>
      </section>

      <section className="wrap py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">The single-room problem</p>
            <h2 className="mt-3 text-3xl">Sleeps 25 rarely means 25 private rooms</h2>
          </div>
          <div className="space-y-4 text-muted">
            <p>
              Rural and wedding listings count every bunk and sofa bed. An executive team needs a private room and
              bathroom for each person, quiet space to work and a connection that holds through a video call.
            </p>
            <p>
              Every venue here lists single rooms separately from total beds, together with en-suite count, plenary
              capacity, Wi-Fi speed and drive time from Barcelona airport.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="wrap grid gap-8 py-14 md:grid-cols-3">
          {[
            ["1", "Filter", "Set the number of private rooms you need, the region and the kind of setting."],
            ["2", "Shortlist", "Read the dossier of each venue, with its plenary space, connectivity and logistics."],
            ["3", "Request availability", "Send one request. We contact the venue and come back to you."],
          ].map(([n, title, text]) => (
            <div key={n}>
              <p className="font-serif text-4xl text-clay">{n}</p>
              <h3 className="mt-2 text-xl">{title}</h3>
              <p className="mt-2 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap py-16">
        <p className="eyebrow">Regions</p>
        <h2 className="mt-3 text-3xl">Choose by landscape and distance</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REGIONS.map((r) => (
            <Link key={r.value} href={`/regions/${r.value}`} className="card block p-5 no-underline transition-shadow hover:shadow-md">
              <h3 className="text-xl">{r.label}</h3>
              <p className="mt-2 text-sm text-muted">{r.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="wrap pb-16">
        <FacilitationSlot />
      </section>

      <section className="wrap pb-8">
        <p className="eyebrow">Questions</p>
        <h2 className="mt-3 text-3xl">Before you start</h2>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="cursor-pointer list-none font-medium">{f.q}</summary>
              <p className="mt-2 max-w-3xl text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
