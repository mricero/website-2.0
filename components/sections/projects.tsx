import { ArrowUpRightIcon } from "lucide-react"

import { featuredProjects, otherProjects } from "@/data/projects"
import { siteConfig } from "@/data/site-config"
import { Section } from "@/components/layout/section"
import { Reveal, RevealItem } from "@/components/motion/reveal"
import { ProjectCard } from "@/components/sections/project-card"

export function ProjectsSection() {
  return (
    <Section
      id="projects"
      index="02"
      heading="Projects"
      lede="Five things I built end to end. Each note below is the part that was actually hard, not the part that was long."
    >
      <Reveal stagger>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {featuredProjects.map((project, i) => (
            <RevealItem
              key={project.id}
              // The lead project earns the full width; the rest pair up.
              className={i === 0 ? "lg:col-span-2" : undefined}
            >
              <ProjectCard project={project} className="h-full" />
            </RevealItem>
          ))}
        </div>
      </Reveal>

      {otherProjects.length > 0 && (
        <Reveal stagger className="mt-16">
          <RevealItem>
            <h3 className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
              Also on GitHub
            </h3>
          </RevealItem>

          <ul className="mt-4 divide-y divide-border border-y border-border">
            {otherProjects.map((project) => (
              <RevealItem key={project.id} as="li">
                <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-1 py-4 transition-colors sm:flex-row sm:items-baseline sm:gap-6"
                  >
                    <span className="min-w-48 text-sm font-medium tracking-tight transition-colors group-hover:text-primary">
                      {project.title}
                      <ArrowUpRightIcon
                        className="ml-1 inline size-3 opacity-0 transition-opacity group-hover:opacity-100"
                        aria-hidden
                      />
                    </span>
                    <span className="flex-1 text-sm leading-relaxed text-muted-foreground">
                      {project.shortDescription}
                    </span>
                    <span className="font-mono text-xs whitespace-nowrap text-muted-foreground/70">
                      {project.techStack.slice(0, 2).join(" · ")}
                    </span>
                </a>
              </RevealItem>
            ))}
          </ul>

          <RevealItem>
            <a
              href={siteConfig.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              All repositories
              <ArrowUpRightIcon className="size-3" aria-hidden />
            </a>
          </RevealItem>
        </Reveal>
      )}
    </Section>
  )
}
