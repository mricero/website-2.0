import Image from "next/image"
import { ArrowUpRightIcon } from "lucide-react"

import { GitHubIcon } from "@/components/icons"

import type { Project } from "@/types"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

/**
 * Only two of the featured repos ship usable imagery, so the image is an
 * enhancement rather than a requirement: without one the card falls back to a
 * typographic panel. Never a broken frame, never a stock photo.
 */
function CardMedia({ project }: { project: Project }) {
  if (project.image) {
    return (
      <Image
        src={project.image}
        alt={project.imageAlt ?? ""}
        width={1280}
        height={720}
        sizes="(min-width: 1024px) 50vw, 100vw"
        className={cn(
          "size-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]",
          project.imageTreatment === "chart" &&
            "bg-white dark:invert dark:hue-rotate-180"
        )}
      />
    )
  }

  const monogram = project.title
    .split(" ")
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")

  return (
    <div className="flex size-full items-center justify-center bg-muted/30">
      <span
        className="font-mono text-5xl font-medium text-border select-none"
        aria-hidden
      >
        {monogram}
      </span>
    </div>
  )
}

export function ProjectCard({
  project,
  className,
}: {
  project: Project
  className?: string
}) {
  const href = project.links.live ?? project.links.demo ?? project.links.github

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors duration-300 hover:border-primary/50 focus-within:border-primary/50",
        className
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border">
        <CardMedia project={project} />
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="outline" className="font-mono">
            {project.category}
          </Badge>
          {project.period && (
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {project.period}
            </span>
          )}
        </div>

        <h3 className="mt-4 text-lg font-medium tracking-tight">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              // The overlay makes the whole card clickable while keeping a single
              // real link in the accessibility tree.
              className="after:absolute after:inset-0 after:content-[''] hover:text-primary focus-visible:text-primary"
            >
              {project.title}
            </a>
          ) : (
            project.title
          )}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {project.shortDescription}
        </p>

        {project.highlight && (
          <p className="mt-4 border-l-2 border-primary/40 pl-4 text-sm leading-relaxed text-muted-foreground/90">
            {project.highlight}
          </p>
        )}

        <ul className="mt-6 flex flex-wrap gap-1.5 pt-0">
          {project.techStack.map((tech) => (
            <li key={tech}>
              <Badge variant="secondary" className="font-mono">
                {tech}
              </Badge>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-center gap-4 pt-4 text-xs">
          {project.links.github && (
            <span className="inline-flex items-center gap-1.5 font-mono text-muted-foreground transition-colors group-hover:text-primary">
              <GitHubIcon className="size-3.5" />
              Source
            </span>
          )}
          {(project.links.live || project.links.demo) && (
            <span className="inline-flex items-center gap-1.5 font-mono text-muted-foreground transition-colors group-hover:text-primary">
              <ArrowUpRightIcon className="size-3.5" aria-hidden />
              Live
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
