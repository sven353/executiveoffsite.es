"use client";

import { useState } from "react";
import { submitNetlifyForm } from "@/lib/netlify-form";
import { REGIONS } from "@/lib/venue-options";

export function VenueApplicationForm({ contactEmail }: { contactEmail?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "failed">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "").trim();

    if (!get("venueName")) return setError("Enter the name of your property");
    if (!get("contactName")) return setError("Enter your name");
    if (!/^\S+@\S+\.\S+$/.test(get("email"))) return setError("Enter a valid email address");
    if (fd.get("consent") !== "on") return setError("Please confirm the privacy consent");

    setStatus("sending");
    const result = await submitNetlifyForm("venue-application", {
      "bot-field": get("bot-field"),
      venueName: get("venueName"),
      region: get("region"),
      singleRooms: get("singleRooms"),
      website: get("website"),
      contactName: get("contactName"),
      email: get("email"),
      phone: get("phone"),
      message: get("message"),
      consent: "yes",
    });
    setStatus(result.ok ? "done" : "failed");
  }

  if (status === "done") {
    return (
      <div className="card p-8">
        <h3 className="text-2xl">Thank you</h3>
        <p className="mt-3 text-muted">
          We have your details. We review every property personally and will be in touch to talk it through.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      <input type="text" name="bot-field" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="a-venue">Property name</label>
          <input id="a-venue" name="venueName" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="a-region">Region</label>
          <select id="a-region" name="region" className="select" defaultValue="">
            <option value="">Choose</option>
            {REGIONS.map((r) => (
              <option key={r.value} value={r.label}>{r.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="a-rooms">Private single rooms</label>
          <input id="a-rooms" name="singleRooms" type="number" min={0} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="a-web">Website or listing link</label>
          <input id="a-web" name="website" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="a-name">Your name</label>
          <input id="a-name" name="contactName" className="input" autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="a-email">Email</label>
          <input id="a-email" name="email" type="email" className="input" autoComplete="email" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="a-phone">Phone (optional)</label>
          <input id="a-phone" name="phone" className="input" autoComplete="tel" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="a-msg">Anything we should know (optional)</label>
        <textarea id="a-msg" name="message" rows={3} className="textarea" />
      </div>
      <label className="flex items-start gap-2 text-xs text-muted">
        <input type="checkbox" name="consent" className="mt-0.5" />
        <span>
          I agree that my details are used to respond to this application. See the{" "}
          <a href="/privacy" className="underline">privacy notice</a>.
        </span>
      </label>
      {error && <p className="error-text">{error}</p>}
      {status === "failed" && (
        <p className="error-text">
          Your application could not be sent.
          {contactEmail ? ` Please email ${contactEmail} instead.` : " Please try again in a moment."}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
        {status === "sending" ? "Sending" : "Send application"}
      </button>
    </form>
  );
}
