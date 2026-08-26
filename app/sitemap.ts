import type { MetadataRoute } from "next"

import { projects } from "@/data/projects"
import { navItems, siteConfig } from "@/data/site-config"

/**
 * Generated once at build time — `output: export` has no server to produce it
 * on request.
 *
 * Derived from navItems and the project list rather than hand-written, so a new
 * page or a new case study appears here without anyone remembering to add it.
 */
export const dynamic = "force-static"

/** Joins without producing a double slash when href is "/". */
function url(href: string) {
  return href === "/" ? siteConfig.url : `${siteConfig.url}${href}`
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const pages: MetadataRoute.Sitemap = navItems.map((item) => ({
    url: url(item.href),
    lastModified: now,
    changeFrequency: "monthly",
    // The home page outranks the section indexes, which outrank case studies.
    priority: item.href === "/" ? 1 : 0.8,
  }))

  const caseStudies: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${siteConfig.url}/projects/${project.id}`,
    lastModified: new Date(project.date),
    changeFrequency: "yearly",
    priority: project.featured ? 0.7 : 0.5,
  }))

  return [...pages, ...caseStudies]
}
