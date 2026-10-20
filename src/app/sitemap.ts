import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { REGIONS } from "@/lib/venue-options";
import { getPublishedVenues } from "@/lib/venues";

// Built at request time so new venues appear without a redeploy.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const venues = await getPublishedVenues().catch(() => []);
  const now = new Date();
  return [
    { url: SITE.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/venues`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/for-venues`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    ...REGIONS.map((r) => ({
      url: `${SITE.url}/regions/${r.value}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...venues.map((v) => ({
      url: `${SITE.url}/venues/${v.slug}`,
      lastModified: new Date(v.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
