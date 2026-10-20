import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy notice",
  alternates: { canonical: "/privacy" },
};

// TEMPLATE: fill in the bracketed items and have the text reviewed before launch.
export default function PrivacyPage() {
  return (
    <div className="wrap max-w-3xl py-12">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-3 text-4xl">Privacy notice</h1>

      <div className="mt-8 space-y-8 text-muted">
        <section>
          <h2 className="text-2xl text-ink">Who is responsible</h2>
          <p className="mt-2">
            {SITE.name} ({SITE.domain}) is operated by {SITE.operator.name}, [legal entity name, tax ID and registered
            address]. You can reach us at [privacy contact email].
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-ink">What we collect and why</h2>
          <p className="mt-2">
            When you send an availability or shortlist request we collect your name, company, role, email, phone
            number, group size, preferred dates and any message you write. We use these details to answer your request,
            to contact venues on your behalf and, if you ask for it, to discuss facilitation of your offsite. The legal
            basis is your consent and the steps needed to respond to your request.
          </p>
          <p className="mt-2">
            When a venue owner applies or is listed we collect the contact details of the owner, the property
            information and the photos they provide, to create and maintain the listing.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-ink">Who receives your data</h2>
          <p className="mt-2">
            Requests are processed through Netlify, which hosts this site and receives form submissions on our behalf.
            With your request we may share the relevant details with the venue you ask about. [List any other tools that
            receive data, for example the CRM or email provider.] We do not sell personal data.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-ink">How long we keep it</h2>
          <p className="mt-2">
            We keep requests for [retention period] after our last contact, unless you ask us to delete them sooner.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-ink">Your rights</h2>
          <p className="mt-2">
            You can ask to access, correct or delete your data, to restrict or object to its use, and to withdraw your
            consent at any time. Write to the address above. You may also complain to the Agencia Española de Protección
            de Datos (aepd.es).
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-ink">Cookies</h2>
          <p className="mt-2">
            The public pages of this site do not set tracking cookies. If we add analytics later, this notice will be
            updated first.
          </p>
        </section>
      </div>
    </div>
  );
}
