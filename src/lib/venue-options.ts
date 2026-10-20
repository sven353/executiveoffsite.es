export const REGIONS = [
  {
    value: "penedes",
    label: "Penedès",
    blurb:
      "Wine and cava country south-west of Barcelona, with estates among the vines and short transfers from the airport.",
  },
  {
    value: "garraf",
    label: "Garraf",
    blurb:
      "The coastal massif between Barcelona and the Penedès, close to the airport with sea and mountain settings.",
  },
  {
    value: "montseny",
    label: "Montseny",
    blurb:
      "A wooded mountain massif north-east of Barcelona, quiet and suited to teams that want real distance from the office.",
  },
  {
    value: "emporda",
    label: "Empordà",
    blurb:
      "Northern Catalonia around Girona and the Costa Brava, with a longer transfer and a strong sense of place.",
  },
  {
    value: "bages",
    label: "Bages",
    blurb: "Central Catalonia around Manresa, with historic estates and a calm inland setting.",
  },
  {
    value: "maresme",
    label: "Maresme",
    blurb:
      "The Mediterranean coastal strip north-east of Barcelona, with hillside properties inland from the sea.",
  },
] as const;

export type RegionValue = (typeof REGIONS)[number]["value"];
export const REGION_VALUES = REGIONS.map((r) => r.value) as [RegionValue, ...RegionValue[]];

export const ARCHETYPES = [
  { value: "wine_estate", label: "Wine estate" },
  { value: "mountain_sanctuary", label: "Mountain sanctuary" },
  { value: "coastal", label: "Coastal / Mediterranean" },
  { value: "historic_castle", label: "Historic castle" },
  { value: "private_masia", label: "Private masia" },
] as const;

export type ArchetypeValue = (typeof ARCHETYPES)[number]["value"];
export const ARCHETYPE_VALUES = ARCHETYPES.map((a) => a.value) as [ArchetypeValue, ...ArchetypeValue[]];

export const PHOTO_KINDS = [
  { value: "gallery", label: "Gallery" },
  { value: "plenary", label: "Plenary or working space" },
  { value: "floorplan", label: "Floorplan" },
] as const;

export const FACILITATION_OPTIONS = [
  { value: "include", label: "Yes, please include facilitation" },
  { value: "maybe_later", label: "Maybe later" },
  { value: "venue_only", label: "Venue only" },
] as const;

export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  published: "Published",
  archived: "Archived",
};

export function regionLabel(value: string) {
  return REGIONS.find((r) => r.value === value)?.label ?? value;
}

export function archetypeLabel(value: string) {
  return ARCHETYPES.find((a) => a.value === value)?.label ?? value;
}
