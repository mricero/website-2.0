import type { NavItem } from "@/types"

export const siteConfig = {
  name: "Lukalapu Mohnish",
  initials: "LM",
  title: "Mathematics & Computing @ IISc",
  role: "B.Tech, Mathematics & Computing — Indian Institute of Science, Bengaluru",
  description:
    "Undergraduate at IISc Bengaluru building retrieval systems, model-compression research, and real-time data tooling. I care about the parts that are load-bearing: hybrid retrieval that survives a rare token, transformers that fit in 8 GB, telemetry that actually aligns.",
  /** Shorter variant for <meta> tags, where long descriptions get truncated. */
  metaDescription:
    "B.Tech Mathematics & Computing at IISc Bengaluru. Retrieval systems, model compression, computer vision, and real-time data tooling.",
  location: "Bengaluru, India",

  /**
   * Public origin, including the repo path — GitHub Pages serves project sites
   * under /<repo>/, not at the root. Drives metadataBase, canonical URLs, OG
   * tags and the sitemap.
   *
   * Change this together with `basePath` in next.config.ts if you move to a
   * custom domain or a <user>.github.io repo.
   */
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://mricero.github.io/website-2.0",

  socials: {
    github: "https://github.com/mricero",
    linkedin: "https://in.linkedin.com/in/lukalapu-mohnish-bb0095323",
    email: "mailto:mohnishl@iisc.ac.in",
    emailAddress: "mohnishl@iisc.ac.in",
    /** Drop the file at public/resume.pdf. Until then this link 404s. */
    resume: "/resume.pdf",
  },
} as const

export const navItems: NavItem[] = [
  { label: "Work", href: "#work" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
]

/** Surfaced under the hero. Kept short — a wall of tags reads as noise. */
export const focusAreas = [
  "Retrieval & RAG systems",
  "Model compression",
  "Computer vision",
  "Real-time data",
] as const
