/* ---------------------------------------------------------------------------
   Projects
--------------------------------------------------------------------------- */

export type ProjectCategory = "AI/ML" | "Systems" | "Research" | "Web"

export interface ProjectLinks {
  github?: string
  live?: string
  demo?: string
}

/** A challenge/solution pair on a project detail page. */
export interface ProjectChallenge {
  challenge: string
  solution: string
}

/** A headline number. Only ever sourced from a repo README — never invented. */
export interface ProjectMetric {
  value: string
  label: string
}

export interface ProjectGalleryItem {
  src: string
  alt: string
  caption: string
  /** See `Project.imageTreatment`. */
  treatment?: ImageTreatment
}

/** A named group inside the stack table, e.g. "Retrieval". */
export interface StackGroup {
  group: string
  items: string[]
}

/**
 * Everything that exists only on `/projects/<id>`. Optional as a whole: the two
 * secondary projects ship a card and a short page, not a full case study.
 */
export interface ProjectDetail {
  /** Body paragraphs under the page header. */
  overview: string[]
  keyFeatures: string[]
  technical: string[]
  challenges?: ProjectChallenge[]
  metrics?: ProjectMetric[]
  /** Monospace pipeline/architecture block, rendered verbatim in a <pre>. */
  architecture?: string
  architectureCaption?: string
  stack?: StackGroup[]
  gallery?: ProjectGalleryItem[]
  future?: string[]
}

/**
 * How an image should be treated in dark mode.
 * "screenshot" (default) renders as-is. "chart" is for matplotlib output — a
 * white plot on a dark card reads as a glaring slab, so it is inverted and
 * hue-rotated back, which is the standard way to land light plots on a dark
 * surface without regenerating them.
 */
export type ImageTreatment = "screenshot" | "chart"

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
  imageTreatment?: ImageTreatment
  /** Featured projects get the grid; the rest get a compact row. */
  featured: boolean
  /** Human-readable period, e.g. "Mar 2026 to Apr 2026". Display-only, never parsed. */
  period?: string
  /** How the work was owned, from the CV: "Project lead", "Project co-lead". */
  role?: string
  /** ISO date. Sort key for chronology — never rendered. */
  date: string
  links: ProjectLinks
  detail?: ProjectDetail
}

/* ---------------------------------------------------------------------------
   Skills
--------------------------------------------------------------------------- */

/**
 * Self-assessed band. `level` drives the bar width and the sort; the band is
 * what actually gets printed, because "78%" invites a question no honest
 * portfolio can answer.
 */
export type SkillBand =
  | "Core"
  | "Advanced"
  | "Proficient"
  | "Working"
  | "Learning"

export interface Skill {
  name: string
  /** 0–100, self-assessed. See the header note in data/skills.ts. */
  level: number
  /** Actively learning — banded as "Learning" regardless of level. */
  learning?: boolean
  description: string
  /** Project ids that demonstrate this skill. Rendered as links to the case study. */
  evidence?: string[]
  /**
   * TimelineEntry ids that demonstrate it instead. Some of the strongest
   * evidence is an internship rather than a repository: Isaac Sim and Lean 4
   * are backed by Saturn Labs and emergence AI, and neither has a case study.
   */
  roles?: string[]
}

export interface SkillCategory {
  id: string
  title: string
  /** Short line under the category title. */
  summary: string
  /** CSS colour for the category accent. Chosen to pass AA in both themes. */
  accent: string
  skills: Skill[]
}

/* ---------------------------------------------------------------------------
   Career
--------------------------------------------------------------------------- */

/**
 * The three tracks the CV itself separates: paid internships, elected and
 * appointed positions, and degrees. Keeping them apart matters because they
 * answer different questions, and folding a mess-committee seat into the same
 * list as a robotics internship flatters neither.
 */
export type TimelineKind = "experience" | "leadership" | "education"

export interface TimelineEntry {
  id: string
  kind: TimelineKind
  /** Display-only, e.g. "Feb 2025 to Present". */
  period: string
  /** ISO start date. Sort key only — never rendered. */
  start: string
  title: string
  organization: string
  location?: string
  summary: string
  highlights: string[]
  skills?: string[]
  /** Renders the "Present" pulse on the timeline node. */
  current?: boolean
}

export interface Achievement {
  id: string
  /** The headline figure, e.g. "AIR 2823". */
  value: string
  label: string
  detail: string
  year: string
}

/** A course from the degree transcript. `area` groups them on the page. */
export interface Course {
  name: string
  area: "Mathematics" | "Computing" | "Machine Learning"
}

/* ---------------------------------------------------------------------------
   Navigation
--------------------------------------------------------------------------- */

export interface NavItem {
  label: string
  href: string
  /** Shown in the mobile sheet and the footer, not the desktop bar. */
  description?: string
}
