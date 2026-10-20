import { getKV } from "@/lib/store";
import { isUuid } from "@/lib/venues";

const FILE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(-sm)?\.(jpg|png|webp|pdf)$/i;

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ venueId: string; file: string }> }
) {
  const { venueId, file } = await ctx.params;
  if (!isUuid(venueId) || !FILE.test(file)) {
    return new Response("Not found", { status: 404 });
  }
  const item = await getKV("media").getBinary(`${venueId}/${file}`);
  if (!item) return new Response("Not found", { status: 404 });

  return new Response(item.data, {
    headers: {
      "Content-Type": item.contentType,
      // File names contain a random id and never change, so they can be cached for good.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    },
  });
}
