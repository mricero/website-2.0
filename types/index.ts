export type ProjectCategory = "AI/ML" | "Systems" | "Research" | "Web"

export interface ProjectLinks {
  github?: string
  live?: string
  demo?: string
}

export interface Project {
  id: string
  title: string
  category: ProjectCategory
  /** One sentence: what the thing is. */
  shortDescription: string
  /**
   * One sentence: the non-obvious engineering decision inside it.
   * A tech-stack list says "PyTorch"; this says why the work was hard.
   */
  highlight?: string
  techStack: string[]
  /** Optional by design — only two repos ship usable imagery. */
  image?: string
  /** Required whenever `image` is set. */
  imageAlt?: string
  /**
   * How the image should be treated in dark mode.
   * "screenshot" (default) renders as-is. "chart" is for matplotlib output —
   * a white plot on a dark card reads as a glaring slab, so it is inverted and
   * hue-rotated back, which is the standard way to land light plots on a dark
   * surface without regenerating them.
   */
  imageTreatment?: "screenshot" | "chart"
  /** Featured projects get the grid; the rest get a compact row. */
  featured: boolean
  /** Human-readable period, e.g. "2026". Display-only, never parsed. */
  period?: string
  links: ProjectLinks
}

export interface Experience {
  id: string
  role: string
  organization: string
  /** Display-only string, e.g. "Feb 2025 – Present". */
  duration: string
  description: string[]
  skills: string[]
}

export interface NavItem {
  label: string
  href: string
}
