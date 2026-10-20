import { formatDrive, formatWifi } from "@/lib/format";
import { SITE } from "@/lib/site";
import { REGIONS, regionLabel } from "@/lib/venue-options";
import { getPublishedVenues } from "@/lib/venues";

export const dynamic = "force-dynamic";

// A plain-text summary for AI assistants and search engines (llms.txt convention).
export async function GET() {
  const venues = await getPublishedVenues().catch(() => []);

  const lines: string[] = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    `${SITE.name} (${SITE.domain}) lists reviewed venues for executive offsites within 150 km of Barcelona, Catalonia, Spain. ` +
      `Each venue states private single rooms separately from total beds, en-suite bathrooms, plenary capacity, Wi-Fi speed and drive time from Barcelona airport. ` +
      `The site is operated by ${SITE.operator.name} (${SITE.operator.url}), which also designs and facilitates executive offsites. ` +
      `The site takes no bookings or payments. Visitors request availability and are put in touch with the venue.`,
    "",
    "## Regions",
    ...REGIONS.map((r) => `- [${r.label}](${SITE.url}/regions/${r.value}): ${r.blurb}`),
    "",
    "## Venues",
  ];

  if (venues.length === 0) {
    lines.push("- The first venues are being added.");
  } else {
    for (const v of venues) {
      const facts = [
        `${v.singleRoomsCount} private single rooms (${v.totalBedsCount} beds)`,
        v.maxPlenaryCapacity ? `plenary for ${v.maxPlenaryCapacity}` : null,
        formatDrive(v.driveTimeBcnMin) ? `${formatDrive(v.driveTimeBcnMin)} from Barcelona airport` : null,
        formatWifi(v.wifiDownloadMbps, v.wifiUploadMbps)
          ? `Wi-Fi ${formatWifi(v.wifiDownloadMbps, v.wifiUploadMbps)}${v.wifiVerified ? " (tested)" : " (owner reported)"}`
          : null,
      ].filter(Boolean);
      lines.push(`- [${v.name}](${SITE.url}/venues/${v.slug}) in ${regionLabel(v.region)}: ${facts.join(", ")}`);
    }
  }

  lines.push("", "## Other pages", `- [For venue owners](${SITE.url}/for-venues)`, `- [Privacy notice](${SITE.url}/privacy)`, "");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
