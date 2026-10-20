"use client";

import type { ActionState } from "@/lib/action-state";
import type { EditorValues } from "@/lib/editor";
import { useFormAction } from "@/lib/use-form-action";
import { ARCHETYPES, REGIONS } from "@/lib/venue-options";

type Props = {
  values: EditorValues;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  mode: "admin" | "owner";
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="card p-6">
      <legend className="px-2 font-serif text-xl">{title}</legend>
      <div className="mt-2 grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function VenueEditor({ values, action, mode }: Props) {
  const { state, onSubmit, pending } = useFormAction(action);
  const err = (name: string) =>
    state.fieldErrors?.[name] ? <p className="error-text">{state.fieldErrors[name]}</p> : null;

  const text = (name: keyof EditorValues, label: string, opts: { hint?: string; type?: string } = {}) => (
    <div>
      <label className="label" htmlFor={`f-${name}`}>{label}</label>
      <input
        id={`f-${name}`}
        name={name}
        type={opts.type ?? "text"}
        className="input"
        defaultValue={(values[name] as string) ?? ""}
      />
      {opts.hint && <p className="hint">{opts.hint}</p>}
      {err(name)}
    </div>
  );

  const num = (name: keyof EditorValues, label: string, hint?: string) => (
    <div>
      <label className="label" htmlFor={`f-${name}`}>{label}</label>
      <input
        id={`f-${name}`}
        name={name}
        type="number"
        min={0}
        className="input"
        defaultValue={(values[name] as number | null) ?? ""}
      />
      {hint && <p className="hint">{hint}</p>}
      {err(name)}
    </div>
  );

  const check = (name: keyof EditorValues, label: string) => (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={Boolean(values[name])} />
      {label}
    </label>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Section title="The property">
        {text("name", "Property name")}
        <div>
          <label className="label" htmlFor="f-region">Region</label>
          <select id="f-region" name="region" className="select" defaultValue={values.region}>
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          {err("region")}
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="f-summary">One-sentence summary</label>
          <input id="f-summary" name="summary" className="input" maxLength={300} defaultValue={values.summary} />
          <p className="hint">Shown on the listing card and in search results. Up to 300 characters.</p>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="f-description">Description</label>
          <textarea id="f-description" name="description" rows={7} className="textarea" defaultValue={values.description} />
          <p className="hint">Describe the property, the grounds, the working spaces and the surroundings.</p>
        </div>
        <div className="sm:col-span-2">
          <p className="label">Setting</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {ARCHETYPES.map((a) => (
              <label key={a.value} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="archetypes" value={a.value} defaultChecked={values.archetypes.includes(a.value)} />
                {a.label}
              </label>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Rooms and meeting spaces">
        {num("singleRoomsCount", "Private single rooms", "Bedrooms used by one person alone")}
        {num("totalBedsCount", "Total beds", "All beds, including shared rooms and bunks")}
        {num("ensuiteBathroomsCount", "En-suite bathrooms")}
        {num("maxPlenaryCapacity", "Plenary room seats", "Maximum seating in the main meeting room")}
        {num("breakoutSpacesCount", "Breakout spaces", "Separate indoor or covered outdoor zones")}
      </Section>

      <Section title="Connectivity and equipment">
        {num("wifiDownloadMbps", "Wi-Fi download (Mbps)")}
        {num("wifiUploadMbps", "Wi-Fi upload (Mbps)")}
        {text("avScreen", "Screen in the plenary room", { hint: "For example 85 inch display" })}
        <div>
          <label className="label" htmlFor="f-acoustic">Acoustic privacy (1 to 5)</label>
          <select id="f-acoustic" name="acousticPrivacyScore" className="select" defaultValue={values.acousticPrivacyScore ?? ""}>
            <option value="">Not rated</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <p className="hint">5 means other guests and staff cannot hear a meeting.</p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 sm:col-span-2">
          {check("starlink", "Starlink available")}
          {check("avProjector", "Projector")}
          {check("avWhiteboards", "Mobile whiteboards")}
        </div>
      </Section>

      <Section title="Services and logistics">
        <div className="flex flex-wrap gap-x-6 gap-y-2 sm:col-span-2">
          {check("privateChef", "Private chef on site")}
          {check("fullBuyout", "Whole property available for exclusive use")}
        </div>
        {num("distanceBcnKm", "Distance from Barcelona airport (km)")}
        {num("driveTimeBcnMin", "Drive time from Barcelona airport (minutes)")}
        {num("distanceGiKm", "Distance from Girona airport (km)")}
        {num("driveTimeGiMin", "Drive time from Girona airport (minutes)")}
        {text("nearestTrainStation", "Nearest train station")}
        <div className="sm:col-span-2">
          <label className="label" htmlFor="f-transfers">Transfers and arrival notes</label>
          <textarea id="f-transfers" name="transfersNotes" rows={3} className="textarea" defaultValue={values.transfersNotes} />
        </div>
      </Section>

      <Section title="Private contact (never shown publicly)">
        {text("contactName", "Contact name")}
        {text("contactEmail", "Contact email", { type: "email" })}
        {text("contactPhone", "Contact phone")}
      </Section>

      <div className="card p-6">
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="photoRightsConfirmed" className="mt-1" defaultChecked={values.photoRightsConfirmed} />
          <span>
            I confirm that I own, or have the right to use, the photos and files uploaded for this property, and I
            allow Executive Offsite and Kuma Partners to publish them on executiveoffsite.es.
          </span>
        </label>
      </div>

      {state.error && <p className="error-text" role="alert">{state.error}</p>}
      {state.ok && state.message && <p className="text-sm text-olive" role="status">{state.message}</p>}

      <div className="flex flex-wrap gap-3">
        {mode === "owner" ? (
          <>
            <button type="submit" name="intent" value="save" className="btn btn-ghost" disabled={pending}>
              {pending ? "Saving" : "Save draft"}
            </button>
            <button type="submit" name="intent" value="submit" className="btn btn-primary" disabled={pending}>
              Submit for review
            </button>
          </>
        ) : (
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Saving" : "Save details"}
          </button>
        )}
      </div>
    </form>
  );
}
