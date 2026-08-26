"use client"

import * as React from "react"
import {
  ArrowDownWideNarrowIcon,
  ArrowUpNarrowWideIcon,
  SearchIcon,
} from "lucide-react"

import type { SkillCategory } from "@/types"
import { sortSkills } from "@/data/skills"
import { Reveal } from "@/components/motion/reveal"
import { SkillRow } from "@/components/skills/skill-row"

interface SkillsExplorerProps {
  categories: SkillCategory[]
  projectTitles: Record<string, string>
  roleTitles: Record<string, string>
}

export function SkillsExplorer({
  categories,
  projectTitles,
  roleTitles,
}: SkillsExplorerProps) {
  const [query, setQuery] = React.useState("")
  const [order, setOrder] = React.useState<"desc" | "asc">("desc")

  const needle = query.trim().toLowerCase()

  /**
   * Search matches the name *and* the description, because half of what
   * someone would type — "BM25", "quantisation", "Chroma" — lives in the prose
   * rather than in a skill's title.
   */
  const filtered = React.useMemo(() => {
    return categories
      .map((category) => {
        const skills = needle
          ? category.skills.filter(
              (s) =>
                s.name.toLowerCase().includes(needle) ||
                s.description.toLowerCase().includes(needle)
            )
          : category.skills
        return { ...category, skills: sortSkills(skills, order) }
      })
      .filter((category) => category.skills.length > 0)
  }, [categories, needle, order])

  const total = filtered.reduce((n, c) => n + c.skills.length, 0)

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills…"
            aria-label="Search skills"
            className="h-10 w-full rounded-md border border-border-strong bg-background pr-3 pl-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        <div className="flex items-center gap-3">
          <p
            aria-live="polite"
            className="font-mono text-xs text-muted-foreground tabular-nums"
          >
            {total} {total === 1 ? "skill" : "skills"}
          </p>
          <button
            type="button"
            onClick={() => setOrder((o) => (o === "desc" ? "asc" : "desc"))}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-border-strong px-3 font-mono text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {order === "desc" ? (
              <ArrowDownWideNarrowIcon className="size-3.5" aria-hidden />
            ) : (
              <ArrowUpNarrowWideIcon className="size-3.5" aria-hidden />
            )}
            {order === "desc" ? "Strongest first" : "Learning first"}
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-sm text-muted-foreground">
          Nothing matches “{query}”. Try “retrieval”, “PyTorch” or “entropy”.
        </p>
      ) : (
        /*
         * CSS multi-column rather than a grid. The categories are wildly
         * different lengths (four skills to eight), and a two-column grid would
         * leave one column ending a full screen above the other. Columns flow,
         * so the two sides finish level; `break-inside-avoid` is what stops a
         * category being sliced in half across the gutter.
         */
        <div className="mt-12 lg:columns-2 lg:gap-14">
          {filtered.map((category) => (
            <section
              key={category.id}
              aria-labelledby={`skills-${category.id}`}
              className="mb-14 break-inside-avoid last:mb-0"
            >
              <Reveal className="border-b border-border pb-4">
                <div className="flex items-baseline justify-between gap-4">
                  <h2
                    id={`skills-${category.id}`}
                    className="font-display text-xl font-semibold tracking-tight"
                  >
                    {category.title}
                  </h2>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {category.skills.length}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {category.summary}
                </p>
              </Reveal>

              <ul className="divide-y divide-border/70 pt-5">
                {category.skills.map((skill, i) => (
                  <SkillRow
                    key={skill.name}
                    skill={skill}
                    projectTitles={projectTitles}
                    roleTitles={roleTitles}
                    // Cap the stagger: an eight-item category would otherwise
                    // leave the last row waiting 600ms after the first.
                    index={Math.min(i, 4)}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
