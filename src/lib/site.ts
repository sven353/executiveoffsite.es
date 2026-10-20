export const SITE = {
  name: "Executive Offsite",
  domain: "executiveoffsite.es",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://executiveoffsite.es").replace(/\/$/, ""),
  tagline: "The curated portfolio of executive offsites in Catalonia",
  description:
    "A curated directory of offsite-ready masias, wine estates and boutique sanctuaries within 150 km of Barcelona. Filter by real private bedrooms, Wi-Fi speed and plenary space.",
  operator: {
    name: "Kuma Partners",
    url: "https://kuma.partners",
  },
  commissionPercent: 5,
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
} as const;
