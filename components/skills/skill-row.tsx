"use client"

import Link from "next/link"

import type { Skill } from "@/types"
import { bandFor, bandStyles } from "@/data/skills"
import { cn } from "@/lib/utils"
import { useRevealOnce } from "@/components/motion/reveal"

interface SkillRowProps {
  skill: Skill
  /** Project id to title, so this component never imports the projects data. */
  projectTitles: Record<string, string>
  /** Timeline entry id to organisation name, for the same reason. */
  roleTitles: Record<string, string>
  /** Stagger position within its category. */
  index: number
}

export function SkillRow({
  skill,
  projectTitles,
  roleTitles,
  index,
}: SkillRowProps) {
  const { ref, revealed } = useRevealOnce<HTMLLIElement>()
  const band = bandFor(skill)
  const style = bandStyles[band]

  /*
   * Two kinds of evidence, and the difference matters. A project links to a
   * case study on this site; a role links to the career page, because Isaac
   * Sim and Lean 4 were done inside an internship and there is no repository
   * to point at. A skill with neither behind it renders bare, which is the
   * honest outcome.
   */
  const evidence = [
    ...(skill.evidence ?? []).map((id) => ({
      key: `p:${id}`,
      label: projectTitles[id],
      href: `/projects/${id}`,
    })),
    ...(skill.roles ?? []).map((id) => ({
      key: `r:${id}`,
      label: roleTitles[id],
      href: "/career",
    })),
  ].filter((item) => Boolean(item.label))

  return (
    <li
      ref={ref}
      data-reveal="up"
      data-revealed={revealed ? "" : undefined}
      style={{ "--reveal-i": index } as React.CSSProperties}
      className="py-5 first:pt-0 last:pb-0"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-sm font-medium tracking-tight">{skill.name}</h3>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 font-mono text-xs",
            style.text
          )}
        >
          <span className={cn("size-1.5 rounded-full", style.dot)} aria-hidden />
          {band}
        </span>
      </div>

      {/*
        The bar is decorative: the band label above already carries the same
        information as text, so exposing a second, redundant progressbar to a
        screen reader would just mean hearing every skill twice.
      */}
      <div aria-hidden className="mt-2.5 h-[3px] w-full overflow-hidden bg-border">
        <div
          data-bar
          data-revealed={revealed ? "" : undefined}
          style={
            {
              "--fill": skill.level / 100,
              "--reveal-i": index,
            } as React.CSSProperties
          }
          className={cn(
            "h-full w-full",
            skill.learning ? "bg-muted-foreground/50" : "bg-primary"
          )}
        />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {skill.description}
      </p>

      {evidence.length > 0 && (
        <p className="mt-3 font-mono text-xs text-muted-foreground/80">
          <span className="text-muted-foreground/60">Seen in</span>{" "}
          {evidence.map((item, i) => (
            <span key={item.key}>
              {i > 0 && ", "}
              <Link
                href={item.href}
                className="underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary/50"
              >
                {item.label}
              </Link>
            </span>
          ))}
        </p>
      )}
    </li>
  )
}
