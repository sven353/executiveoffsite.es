import type { PublicVenue } from "@/lib/types";
import { ARCHETYPE_VALUES, REGION_VALUES } from "@/lib/venue-options";

export type VenueFilters = {
  rooms: number;
  plenary: number;
  region: string;
  setting: string;
  chef: boolean;
  buyout: boolean;
};

type RawParams = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export function parseFilters(params: RawParams): VenueFilters {
  const region = one(params.region) ?? "";
  const setting = one(params.setting) ?? "";
  return {
    rooms: Math.max(0, Number(one(params.rooms)) || 0),
    plenary: Math.max(0, Number(one(params.plenary)) || 0),
    region: (REGION_VALUES as readonly string[]).includes(region) ? region : "",
    setting: (ARCHETYPE_VALUES as readonly string[]).includes(setting) ? setting : "",
    chef: one(params.chef) === "1",
    buyout: one(params.buyout) === "1",
  };
}

export function filterVenues(venues: PublicVenue[], f: VenueFilters) {
  return venues
    .filter((v) => v.singleRoomsCount >= f.rooms)
    .filter((v) => (f.plenary ? (v.maxPlenaryCapacity ?? 0) >= f.plenary : true))
    .filter((v) => (f.region ? v.region === f.region : true))
    .filter((v) => (f.setting ? v.archetypes.includes(f.setting) : true))
    .filter((v) => (f.chef ? v.privateChef : true))
    .filter((v) => (f.buyout ? v.fullBuyout : true))
    .sort((a, b) => (a.driveTimeBcnMin ?? 9999) - (b.driveTimeBcnMin ?? 9999) || a.name.localeCompare(b.name));
}
