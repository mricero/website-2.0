import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import type { Project } from "@/types"
import { assetPath, cn } from "@/lib/utils"
import { GitHubIcon } from "@/components/icons"
import { ParallaxMedia } from "@/components/motion/scroll-linked"
import { Badge } from "@/components/ui/badge"

/**
 * Four of the eight projects ship imagery, so the image is an
 * enhancement rather than a requirement: without one the card falls back to a
 * typographic panel. Never a broken frame, never a stock photo.
 *
 * Where there IS an image it drifts slightly against the scroll, which makes
 * the frame read as a window rather than as a rectangle with a picture printed
 * on it. The monogram fallback gets no parallax: there is nothing behind it to
 * be a window onto.
 */
function CardMedia({
  project,
  priority,
}: {
  project: Project
  priority: boolean
}) {
  if (project.image) {
    return (
      <ParallaxMedia className="size-full" amount={24}>
        <Image
          src={assetPath(project.image)}
          alt={project.imageAlt ?? ""}
          width={1280}
          height={720}
          sizes="(min-width: 1024px) 50vw, 100vw"
          /*
           * The top cards are above the fold, and one of their images is the
           * LCP element on /projects. Lazy-loading the LCP image defers the
           * request until layout has run, which is the single most common way
           * a card grid loses a second of LCP for no reason.
           */
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          className={cn(
            "size-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]",
            project.imageTreatment === "chart" &&
              "bg-white dark:invert dark:hue-rotate-180"
          )}
        />
      </ParallaxMedia>
    )
  }

  const monogram = project.title
    .split(" ")
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")

  return (
    <div className="flex size-full items-center justify-center bg-muted/50">
      <span
        className="font-display text-6xl font-semibold text-border transition-colors duration-500 select-none group-hover:text-muted-foreground/40"
        aria-hidden
      >
        {monogram}
      </span>
    </div>
  )
}

interface ProjectCardProps {
  project: Project
  className?: string
  /** Show the media panel. Off for dense list layouts. */
  media?: boolean
  /** Set on the cards that render above the fold. See CardMedia. */
  priority?: boolean
  /**
   * The lead card, spanning both grid columns, and every card in the home
   * page's sticky stack.
   *
   * It switches to a horizontal layout at lg rather than just getting wider.
   * A 16/10 media panel across a 1140px card is over 700px tall: for the four
   * projects with no screenshot that is an enormous empty rectangle with a
   * monogram floating in it, and even for the two with one it pushes the
   * writing off the screen. Side by side, the panel takes its height from the
   * text instead.
   */
  wide?: boolean
}

export function ProjectCard({
  project,
  className,
  media = true,
  priority = false,
  wide = false,
}: ProjectCardProps) {
  // Cards lead to the case study on this site, not straight out to GitHub. The
  // write-up is the thing worth reading; the repo is one click further.
  const href = `/projects/${project.id}`
  const visibleTech = project.techStack.slice(0, 5)
  const overflow = project.techStack.length - visibleTech.length

  /*
   * Four of the eight projects have no screenshot. In the grid that is fine:
   * every card needs the same silhouette, so the monogram fills a 16/10 slot
   * and the row stays even.
   *
   * On a `wide` card it is not fine. The panel is 44% of a 1140px card and
   * takes its height from the text beside it, so an absent image becomes a
   * 400px empty rectangle with two letters floating in it. A card that simply
   * runs full width instead reads as a deliberate second layout rather than
   * as a missing asset.
   */
  const showMedia = media && (project.image ? true : !wide)
  const split = wide && showMedia

  return (
    <article
      className={cn(
        "surface surface-hover group relative flex flex-col overflow-hidden rounded-md",
        "focus-within:border-primary/50",
        split && "lg:flex-row",
        className
      )}
    >
      {showMedia && (
        <div
          className={cn(
            "relative aspect-[16/10] w-full overflow-hidden border-b border-border",
            // aspect-auto hands height control to the flex row, so the panel
            // matches the text column rather than dictating the card's size.
            split && "lg:aspect-auto lg:w-[44%] lg:border-r lg:border-b-0"
          )}
        >
          <CardMedia project={project} priority={priority} />
        </div>
      )}

      <div
        className={cn(
          "flex flex-1 flex-col p-6 sm:p-8",
          split && "lg:min-w-0 lg:justify-center",
          // Without the media column the text has the whole card, so it needs
          // its own reading measure rather than running to 1100px.
          wide && !split && "lg:p-10"
        )}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <Badge variant="outline" className="font-mono">
            {project.category}
          </Badge>
          {project.period && (
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {project.period}
            </span>
          )}
          {/* From the CV. Worth stating: "project lead" on four of these is a
              different claim from "I have eight repositories". */}
          {project.role && (
            <span className="font-mono text-xs text-muted-foreground/70">
              {project.role}
            </span>
          )}
        </div>

        <h3 className="font-display mt-5 text-xl font-semibold tracking-tight sm:text-2xl">
          <Link
            href={href}
            // The overlay makes the whole card clickable while keeping a single
            // real link in the accessibility tree.
            className="after:absolute after:inset-0 after:content-[''] hover:text-primary focus-visible:text-primary"
          >
            {project.title}
          </Link>
        </h3>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {project.shortDescription}
        </p>

        {project.highlight && (
          <p className="mt-5 max-w-2xl border-l-2 border-primary/50 pl-4 text-sm leading-relaxed text-foreground/75">
            {project.highlight}
          </p>
        )}

        <ul className="mt-6 flex flex-wrap gap-1.5">
          {visibleTech.map((tech) => (
            <li key={tech}>
              <Badge variant="secondary" className="font-mono">
                {tech}
              </Badge>
            </li>
          ))}
          {overflow > 0 && (
            <li>
              <Badge variant="ghost" className="font-mono text-muted-foreground">
                +{overflow}
              </Badge>
            </li>
          )}
        </ul>

        <div className="mt-auto flex items-center justify-between gap-4 pt-8 text-xs">
          <span className="inline-flex items-center gap-1.5 font-mono text-muted-foreground transition-colors group-hover:text-primary">
            Read case study
            <ArrowRightIcon
              className="size-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>

          {project.links.github && (
            /*
             * Sits above the card overlay (`relative` plus z-10) so it stays a
             * separate, clickable destination rather than being swallowed by
             * the pseudo-element covering the card.
             */
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 inline-flex items-center gap-1.5 font-mono text-muted-foreground transition-colors hover:text-foreground"
            >
              <GitHubIcon className="size-3.5" />
              <span className="sr-only">{project.title} source on GitHub</span>
              <span aria-hidden>Source</span>
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
