"use client"

import * as React from "react"
import { motion, MotionConfig } from "motion/react"

import type { Project, ProjectCategory } from "@/types"
import { spring } from "@/lib/motion-config"
import { cn } from "@/lib/utils"
import { Build } from "@/components/motion/build/build"
import { Reveal } from "@/components/motion/reveal"
import { ProjectCard } from "@/components/projects/project-card"

type Filter = ProjectCategory | "All"

interface ProjectsExplorerProps {
  projects: Project[]
  categories: ProjectCategory[]
}

export function ProjectsExplorer({
  projects,
  categories,
}: ProjectsExplorerProps) {
  const [filter, setFilter] = React.useState<Filter>("All")

  // Counts come from the full list, not the filtered one, so a chip never
  // reads "0" the moment you select it.
  const counts = React.useMemo(() => {
    const map = new Map<Filter, number>([["All", projects.length]])
    for (const p of projects) map.set(p.category, (map.get(p.category) ?? 0) + 1)
    return map
  }, [projects])

  const visible = React.useMemo(
    () =>
      filter === "All" ? projects : projects.filter((p) => p.category === filter),
    [projects, filter]
  )

  const filters: Filter[] = ["All", ...categories]

  return (
    <div>
      {/*
        The cards below are <h3>s. Without this the document jumps straight
        from the page <h1> to an h3, which breaks heading navigation for anyone
        moving through the page by outline. There is nothing to *show* here —
        the page title already says it — so the heading is for the outline only.
      */}
      <h2 className="sr-only">All projects</h2>

      <Build
        label="filter"
        className="flex flex-wrap items-center justify-between gap-4"
      >
        {/*
          Toggle buttons rather than links: the filter is view state, not a
          location, and a static export has no server to resolve ?category= on.
          aria-pressed is what tells a screen reader which one is on.
        */}
        {/*
          reducedMotion="user" lets Motion itself drop the pill's slide for
          readers who asked for less motion; nothing here reads the media
          query during render.
        */}
        <MotionConfig reducedMotion="user">
          <div
            role="group"
            aria-label="Filter projects by category"
            className="flex flex-wrap gap-2"
          >
            {filters.map((name) => {
              const active = filter === name
              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(name)}
                  className={cn(
                    "relative isolate inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                    active
                      ? "border-transparent text-primary"
                      : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  )}
                >
                  {/*
                    One pill shared by every button through layoutId, so a
                    change of filter slides it across rather than switching
                    one chip off and another on. It covers the button's own
                    border (-inset-px), which goes transparent while active.
                    The radius is in style, not a class, so Motion can
                    correct it while the pill stretches between widths.
                  */}
                  {active && (
                    <motion.span
                      layoutId="filter-active"
                      aria-hidden
                      transition={{ type: "spring", ...spring.ui }}
                      style={{ borderRadius: 9999 }}
                      className="absolute -inset-px -z-10 border border-primary/60 bg-primary/10"
                    />
                  )}
                  {name}
                  <span
                    className={cn(
                      "tabular-nums",
                      active ? "text-primary/70" : "text-muted-foreground/60"
                    )}
                  >
                    {counts.get(name) ?? 0}
                  </span>
                </button>
              )
            })}
          </div>
        </MotionConfig>

        {/*
          aria-live so a screen-reader user hears the result count change; the
          filter buttons themselves say nothing about what happened to the list
          below them.
        */}
        <p
          aria-live="polite"
          className="font-mono text-xs text-muted-foreground tabular-nums"
        >
          {visible.length} {visible.length === 1 ? "project" : "projects"}
        </p>
      </Build>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {visible.map((project, i) => (
          <Reveal
            key={project.id}
            index={i % 4}
            className={cn(
              "flex",
              // The lead card earns the full width; the rest pair up. Only when
              // nothing is filtered, or a two-result view would render one
              // stretched card above a lonely half-width one.
              filter === "All" && i === 0 && "lg:col-span-2"
            )}
          >
            {/* The first two cards are above the fold on a desktop viewport. */}
            <ProjectCard
              project={project}
              className="w-full"
              priority={i < 2}
              wide={filter === "All" && i === 0}
            />
          </Reveal>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="mt-12 text-center text-sm text-muted-foreground">
          Nothing in that category yet.
        </p>
      )}
    </div>
  )
}
