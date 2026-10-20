import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Search and AI crawlers are welcome on the public pages.
      { userAgent: "*", allow: "/", disallow: ["/admin", "/owner", "/api"] },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
