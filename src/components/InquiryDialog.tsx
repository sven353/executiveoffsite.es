"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { submitNetlifyForm } from "@/lib/netlify-form";
import { FACILITATION_OPTIONS } from "@/lib/venue-options";

type Props = {
  label: string;
  venue?: { slug: string; name: string };
  defaultFacilitation?: "include" | "maybe_later" | "venue_only";
  variant?: "primary" | "ghost";
  size?: "sm" | "md";
  contactEmail?: string;
};

type Data = {
  preferredDates: string;
  datesFlexible: boolean;
  groupSize: string;
  singleRoomsRequired: boolean;
  facilitation: string;
  name: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
  botField: string;
};

export function InquiryDialog({
  label,
  venue,
  defaultFacilitation = "maybe_later",
  variant = "primary",
  size = "md",
  contactEmail,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "failed">("idle");
  const [error, setError] = useState("");
  const [data, setData] = useState<Data>({
    preferredDates: "",
    datesFlexible: false,
    groupSize: "",
    singleRoomsRequired: true,
    facilitation: defaultFacilitation,
    name: "",
    company: "",
    role: "",
    email: "",
    phone: "",
    message: "",
    consent: false,
    botField: "",
  });

  const set = <K extends keyof Data>(key: K, value: Data[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  function open() {
    setStep(1);
    setStatus("idle");
    setError("");
    setData((d) => ({ ...d, facilitation: defaultFacilitation }));
    ref.current?.showModal();
  }

  function close() {
    ref.current?.close();
  }

  function next() {
    setError("");
    if (step === 1) {
      const size = Number(data.groupSize);
      if (!size || size < 1) return setError("Enter your group size");
    }
    setStep((s) => s + 1);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!data.name.trim()) return setError("Enter your name");
    if (!/^\S+@\S+\.\S+$/.test(data.email)) return setError("Enter a valid email address");
    if (!data.consent) return setError("Please confirm the privacy consent");

    setStatus("sending");
    const result = await submitNetlifyForm("inquiry", {
      "bot-field": data.botField,
      venue: venue?.name ?? "General shortlist request",
      venueSlug: venue?.slug ?? "",
      preferredDates: data.preferredDates,
      datesFlexible: data.datesFlexible ? "yes" : "no",
      groupSize: data.groupSize,
      singleRoomsRequired: data.singleRoomsRequired ? "yes" : "no",
      facilitation: data.facilitation,
      name: data.name,
      company: data.company,
      role: data.role,
      email: data.email,
      phone: data.phone,
      message: data.message,
      consent: "yes",
    });
    setStatus(result.ok ? "done" : "failed");
  }

  const btn = `btn ${variant === "primary" ? "btn-primary" : "btn-ghost"} ${size === "sm" ? "btn-sm" : ""}`;

  return (
    <>
      <button type="button" className={btn} onClick={open}>
        {label}
      </button>

      <dialog ref={ref} className="modal" aria-labelledby="inquiry-title">
        <div className="flex items-start justify-between border-b border-line px-6 py-4">
          <div>
            <p className="eyebrow">{venue ? "Availability request" : "Shortlist request"}</p>
            <h2 id="inquiry-title" className="mt-1 text-xl">
              {venue ? venue.name : "Tell us about your offsite"}
            </h2>
          </div>
          <button type="button" onClick={close} aria-label="Close" className="p-1 text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>

        {status === "done" ? (
          <div className="px-6 py-8">
            <h3 className="text-xl">Thank you</h3>
            <p className="mt-3 text-muted">
              We have your request and will reply by email, usually within one working day.
            </p>
            <button type="button" className="btn btn-ghost mt-6" onClick={close}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={send} className="px-6 py-5">
            <p className="mb-4 text-xs text-muted">Step {step} of 3</p>

            <input
              type="text"
              name="bot-field"
              value={data.botField}
              onChange={(e) => set("botField", e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="label" htmlFor="q-dates">Preferred dates</label>
                  <input
                    id="q-dates"
                    className="input"
                    value={data.preferredDates}
                    onChange={(e) => set("preferredDates", e.target.value)}
                    placeholder="For example 12 to 14 March, or Tuesday to Thursday in May"
                  />
                  <label className="mt-2 flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={data.datesFlexible}
                      onChange={(e) => set("datesFlexible", e.target.checked)}
                    />
                    Dates are flexible
                  </label>
                </div>
                <div>
                  <label className="label" htmlFor="q-size">Group size</label>
                  <input
                    id="q-size"
                    type="number"
                    min={1}
                    className="input"
                    value={data.groupSize}
                    onChange={(e) => set("groupSize", e.target.value)}
                  />
                </div>
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={data.singleRoomsRequired}
                    onChange={(e) => set("singleRoomsRequired", e.target.checked)}
                  />
                  Everyone needs a private single room
                </label>
              </div>
            )}

            {step === 2 && (
              <fieldset className="space-y-3">
                <legend className="label">Do you want help designing and facilitating the sessions?</legend>
                <p className="hint !mt-0 mb-2">
                  Kuma Partners designs and facilitates executive offsites. Choose what suits you now.
                </p>
                {FACILITATION_OPTIONS.map((o) => (
                  <label key={o.value} className="flex items-center gap-2 border border-line bg-white px-3 py-3 text-sm">
                    <input
                      type="radio"
                      name="facilitation"
                      value={o.value}
                      checked={data.facilitation === o.value}
                      onChange={() => set("facilitation", o.value)}
                    />
                    {o.label}
                  </label>
                ))}
              </fieldset>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="q-name">Name</label>
                    <input id="q-name" className="input" value={data.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />
                  </div>
                  <div>
                    <label className="label" htmlFor="q-role">Role</label>
                    <input id="q-role" className="input" value={data.role} onChange={(e) => set("role", e.target.value)} placeholder="Founder, Chief of Staff, Head of People" />
                  </div>
                  <div>
                    <label className="label" htmlFor="q-company">Company</label>
                    <input id="q-company" className="input" value={data.company} onChange={(e) => set("company", e.target.value)} autoComplete="organization" />
                  </div>
                  <div>
                    <label className="label" htmlFor="q-phone">Phone (optional)</label>
                    <input id="q-phone" className="input" value={data.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" />
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="q-email">Work email</label>
                  <input id="q-email" type="email" className="input" value={data.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
                </div>
                <div>
                  <label className="label" htmlFor="q-message">Anything we should know (optional)</label>
                  <textarea id="q-message" rows={3} className="textarea" value={data.message} onChange={(e) => set("message", e.target.value)} />
                </div>
                <label className="flex items-start gap-2 text-xs text-muted">
                  <input type="checkbox" className="mt-0.5" checked={data.consent} onChange={(e) => set("consent", e.target.checked)} />
                  <span>
                    I agree that my details are used to respond to this request and, if I ask for it, to discuss
                    facilitation. See the <a href="/privacy" className="underline">privacy notice</a>.
                  </span>
                </label>
              </div>
            )}

            {error && <p className="error-text mt-3">{error}</p>}
            {status === "failed" && (
              <p className="error-text mt-3">
                Your request could not be sent.
                {contactEmail ? ` Please email ${contactEmail} instead.` : " Please try again in a moment."}
              </p>
            )}

            <div className="mt-6 flex items-center justify-between">
              {step > 1 ? (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep((s) => s - 1)}>
                  Back
                </button>
              ) : (
                <span />
              )}
              {step < 3 ? (
                <button type="button" className="btn btn-primary" onClick={next}>
                  Continue
                </button>
              ) : (
                <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
                  {status === "sending" ? "Sending" : "Send request"}
                </button>
              )}
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
