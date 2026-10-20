"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { ARCHETYPES, REGIONS } from "@/lib/venue-options";

type Props = {
  lockRegion?: boolean;
  total: number;
  shown: number;
};

export function FilterBar({ lockRegion = false, total, shown }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [resetKey, setResetKey] = useState(0);

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => {
      router.replace(`${pathname}${next.toString() ? `?${next}` : ""}`, { scroll: false });
    });
  }

  const get = (k: string) => params.get(k) ?? "";
  const hasFilters = ["rooms", "plenary", "region", "setting", "chef", "buyout"].some((k) => params.get(k));

  return (
    <div className="card p-5" aria-busy={pending}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="label" htmlFor="f-rooms">Private single rooms (minimum)</label>
          <input
            id="f-rooms"
            key={`rooms-${resetKey}`}
            type="number"
            min={0}
            className="input"
            defaultValue={get("rooms")}
            onChange={(e) => update("rooms", e.target.value)}
            placeholder="For example 12"
          />
        </div>
        <div>
          <label className="label" htmlFor="f-plenary">Plenary seats (minimum)</label>
          <input
            id="f-plenary"
            key={`plenary-${resetKey}`}
            type="number"
            min={0}
            className="input"
            defaultValue={get("plenary")}
            onChange={(e) => update("plenary", e.target.value)}
          />
        </div>
        {!lockRegion && (
          <div>
            <label className="label" htmlFor="f-region">Region</label>
            <select id="f-region" className="select" value={get("region")} onChange={(e) => update("region", e.target.value)}>
              <option value="">All regions</option>
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="label" htmlFor="f-setting">Setting</label>
          <select id="f-setting" className="select" value={get("setting")} onChange={(e) => update("setting", e.target.value)}>
            <option value="">Any setting</option>
            {ARCHETYPES.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={get("chef") === "1"} onChange={(e) => update("chef", e.target.checked ? "1" : "")} />
          Private chef on site
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={get("buyout") === "1"} onChange={(e) => update("buyout", e.target.checked ? "1" : "")} />
          Full buyout available
        </label>
        <span className="ml-auto text-muted">
          {shown} of {total} venues
        </span>
        {hasFilters && (
          <button
            type="button"
            className="underline"
            onClick={() => {
              setResetKey((k) => k + 1);
              startTransition(() => router.replace(pathname, { scroll: false }));
            }}
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
