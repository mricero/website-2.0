import type { MetadataRoute } from "next"

import { siteConfig } from "@/data/site-config"

/**
 * Generated once at build time — `output: export` has no server to produce it
 * on request.
 */
export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ]
}
