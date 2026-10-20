"use client";

import { useState } from "react";
import type { ActionState } from "@/lib/action-state";
import { useFormAction } from "@/lib/use-form-action";
import { REGIONS, STATUS_LABELS } from "@/lib/venue-options";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export function LoginForm({ action }: { action: Action }) {
  const { state, onSubmit, pending } = useFormAction(action);
  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      <div>
        <label className="label" htmlFor="password">Admin password</label>
        <input id="password" name="password" type="password" className="input" autoComplete="current-password" autoFocus />
      </div>
      {state.error && <p className="error-text" role="alert">{state.error}</p>}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Checking" : "Sign in"}
      </button>
    </form>
  );
}

export function NewVenueForm({ action }: { action: Action }) {
  const { state, onSubmit, pending } = useFormAction(action);
  return (
    <form onSubmit={onSubmit} className="card grid gap-4 p-5 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
      <div>
        <label className="label" htmlFor="new-name">New venue name</label>
        <input id="new-name" name="name" className="input" />
        {state.fieldErrors?.name && <p className="error-text">{state.fieldErrors.name}</p>}
      </div>
      <div>
        <label className="label" htmlFor="new-region">Region</label>
        <select id="new-region" name="region" className="select" defaultValue="penedes">
          {REGIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Creating" : "Create venue"}
      </button>
      {state.error && <p className="error-text sm:col-span-3">{state.error}</p>}
    </form>
  );
}

type SettingsValues = {
  slug: string;
  status: string;
  verified: boolean;
  wifiVerified: boolean;
  agreementStatus: string;
  agreementSignedAt: string;
  commissionRate: number;
  internalNotes: string;
};

export function AdminSettingsForm({ values, action }: { values: SettingsValues; action: Action }) {
  const { state, onSubmit, pending } = useFormAction(action);
  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      <h2 className="font-serif text-xl">Review and publishing</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="s-status">Status</label>
          <select id="s-status" name="status" className="select" defaultValue={values.status}>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <p className="hint">Only Published listings appear on the site.</p>
        </div>
        <div>
          <label className="label" htmlFor="s-slug">Address slug</label>
          <input id="s-slug" name="slug" className="input" defaultValue={values.slug} />
          {state.fieldErrors?.slug && <p className="error-text">{state.fieldErrors.slug}</p>}
          <p className="hint">Changing it changes the public address of the page.</p>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="verified" defaultChecked={values.verified} />
            Verified: we have checked the single rooms, plenary space and photos
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="wifiVerified" defaultChecked={values.wifiVerified} />
            Wi-Fi speed tested by us (otherwise shown as reported by the owner)
          </label>
        </div>
      </div>

      <div className="grid gap-4 border-t border-line pt-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="s-agreement">Listing agreement</label>
          <select id="s-agreement" name="agreementStatus" className="select" defaultValue={values.agreementStatus}>
            <option value="none">Not sent</option>
            <option value="sent">Sent</option>
            <option value="signed">Signed</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="s-signed">Signed on</label>
          <input id="s-signed" name="agreementSignedAt" type="date" className="input" defaultValue={values.agreementSignedAt} />
        </div>
        <div>
          <label className="label" htmlFor="s-rate">Commission (%)</label>
          <input id="s-rate" name="commissionRate" type="number" step="0.5" min={0} max={100} className="input" defaultValue={values.commissionRate} />
        </div>
        <div className="sm:col-span-3">
          <label className="label" htmlFor="s-notes">Internal notes (never public)</label>
          <textarea id="s-notes" name="internalNotes" rows={3} className="textarea" defaultValue={values.internalNotes} />
        </div>
      </div>

      {state.error && <p className="error-text" role="alert">{state.error}</p>}
      {state.ok && state.message && <p className="text-sm text-olive" role="status">{state.message}</p>}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Saving" : "Save settings"}
      </button>
    </form>
  );
}

export function OwnerLinkPanel({
  hasLink,
  generate,
  revoke,
}: {
  hasLink: boolean;
  generate: Action;
  revoke: Action;
}) {
  const gen = useFormAction(generate);
  const rev = useFormAction(revoke);
  const [copied, setCopied] = useState(false);
  const link = gen.state.link;

  return (
    <section className="card space-y-4 p-6">
      <h2 className="font-serif text-xl">Owner access</h2>
      <p className="text-sm text-muted">
        Send the owner a private link. With it they can fill in the details and upload photos for this venue
        without an account, until you publish it. {hasLink ? "A link is currently active." : "No link has been created yet."}
      </p>

      <div className="flex flex-wrap gap-3">
        <form onSubmit={gen.onSubmit}>
          <button type="submit" className="btn btn-primary btn-sm" disabled={gen.pending}>
            {hasLink ? "Create a new link" : "Create owner link"}
          </button>
        </form>
        {hasLink && (
          <form onSubmit={rev.onSubmit}>
            <button type="submit" className="btn btn-danger btn-sm" disabled={rev.pending}>
              Revoke link
            </button>
          </form>
        )}
      </div>

      {link && (
        <div>
          <label className="label" htmlFor="owner-link">Owner link</label>
          <div className="flex gap-2">
            <input id="owner-link" readOnly className="input" value={link} onFocus={(e) => e.currentTarget.select()} />
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={async () => {
                await navigator.clipboard.writeText(link);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
      {gen.state.message && <p className="text-sm text-olive" role="status">{gen.state.message}</p>}
      {gen.state.error && <p className="error-text">{gen.state.error}</p>}
      {rev.state.message && <p className="text-sm text-olive" role="status">{rev.state.message}</p>}
    </section>
  );
}

export function DeleteVenueForm({ action, name }: { action: () => Promise<void>; name: string }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Delete ${name} and all its photos? This cannot be undone.`)) e.preventDefault();
      }}
    >
      <button type="submit" className="btn btn-danger btn-sm">Delete venue</button>
    </form>
  );
}
