import type { NavItem } from "@/types"

export const siteConfig = {
  name: "Lukalapu Mohnish",
  initials: "LM",
  title: "Mathematics and Computing, IISc Bengaluru",
  role: "B.Tech, Mathematics and Computing, Indian Institute of Science, Bengaluru",
  /**
   * Hero subtext. Twenty words, which is the cap: if the value proposition
   * does not fit in twenty words it is not clear yet, and a hero that
   * overflows the first viewport hides its own call to action.
   */
  tagline:
    "Third year Mathematics and Computing at IISc Bengaluru. Retrieval systems, model compression, robotics simulation, and physics proved in Lean 4.",
  /** The longer statement. Used once, as the scroll-written line on the home page. */
  description:
    "I build retrieval systems that survive a rare token, compress vision transformers until they fit on a laptop, generate synthetic training data in Isaac Sim, and write physics in Lean 4 so the proofs ship with the code.",
  /** Shorter variant for <meta> tags, where long descriptions get truncated. */
  metaDescription:
    "B.Tech Mathematics and Computing at IISc Bengaluru. Retrieval systems, model compression, formally verified physics, and robotics simulation.",
  location: "Bengaluru, India",
  /** Programme span, from the LinkedIn education entry. */
  graduation: "2028",

  /**
   * Public origin, including the repo path. GitHub Pages serves project sites
   * under /<repo>/, not at the root. Drives metadataBase, canonical URLs, OG
   * tags and the sitemap.
   *
   * Change this together with `basePath` in next.config.ts if you move to a
   * custom domain or a <user>.github.io repo.
   */
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://www.mohnish.co.in",

  socials: {
    github: "https://github.com/mricero",
    githubHandle: "@mricero",
    linkedin: "https://in.linkedin.com/in/lukalapu-mohnish-bb0095323",
    linkedinHandle: "Lukalapu Mohnish",
    email: "mailto:mohnishl@iisc.ac.in",
    emailAddress: "mohnishl@iisc.ac.in",
    resume: "/resume.pdf",
  },

  /**
   * Gate for the resume link. public/resume.pdf does not exist yet, and a
   * button that 404s is worse than no button: it costs the reader a click and
   * tells them the site is unmaintained.
   *
   * Drop the PDF at public/resume.pdf, flip this to true, and the hero shows
   * the Resume control instead of the GitHub one. Nothing else needs changing.
   */
  resumeAvailable: false,

  /**
   * Web3Forms access key. Turns the contact form from a mailto: compose into a
   * real submission that emails you.
   *
   * Get one in about a minute at https://web3forms.com: enter the address you
   * want alerts sent to, and the key arrives by email. No account, no
   * dashboard. Free tier is 250 submissions a month.
   *
   * Then put it in `.env.local` (gitignored) and rebuild:
   *
   *     NEXT_PUBLIC_WEB3FORMS_KEY=your-key-here
   *
   * Leave it unset and the form falls back to opening the visitor's mail
   * client, which is what it did before and still works. Nothing breaks; you
   * just do not get the alert.
   *
   * The key IS public once built. That is unavoidable on a static site and it
   * is how Web3Forms is designed to work: the key only authorises delivery to
   * the address it is already bound to, so the worst case is spam into your
   * inbox, which is what the honeypot and their filtering are for.
   */
  contactFormKey: process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "",
} as const

/**
 * The site is a set of routes, not one scrolling page. Each entry below is a
 * real document with its own <title>, its own URL and its own sitemap row.
 *
 * This array is the single source: the desktop bar, the mobile sheet, the
 * footer sitemap and app/sitemap.ts all read from it. Adding a page means one
 * line here plus a folder under app/.
 */
export const navItems: NavItem[] = [
  { label: "Home", href: "/", description: "Overview and what I am working on" },
  {
    label: "Skills",
    href: "/skills",
    description: "Technical depth by area, with the work that proves it",
  },
  {
    label: "Projects",
    href: "/projects",
    description: "Eight builds, five written up as full case studies",
  },
  {
    label: "Career",
    href: "/career",
    description: "Internships, positions, education and results",
  },
  {
    label: "Contact",
    href: "/contact",
    description: "Email, GitHub, LinkedIn, and a message form",
  },
] as const

/**
 * Surfaced under the hero. Four, and kept short: a wall of tags reads as noise.
 * These track the CV's own skill groups rather than being chosen for rhythm.
 */
export const focusAreas = [
  "Retrieval and RAG",
  "Model compression",
  "Robotics simulation",
  "Formal verification",
] as const

/*
 * There was a `stats` array here driving a four-number row on the home page.
 * It is gone, along with components/home/stats.tsx and the count-up animation
 * that fed it.
 *
 * No figure was lost with it. Each one already lives where it can be checked:
 *   75% / 50-to-90 FPS   data/career.ts, the Saturn Labs highlights
 *   210 tests            data/projects.ts, legal-rag metrics
 *   24 configurations    data/projects.ts, vit-compression metrics
 *   AIR 2,823            data/career.ts, achievements
 *
 * Restoring the row means reinstating all three: the array, the component and
 * the CountUp primitive.
 */
