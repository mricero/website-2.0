"use client"

import type { TimelineEntry } from "@/types"
import { cn } from "@/lib/utils"
import { useRevealOnce } from "@/components/motion/reveal"
import { ScrollSpine } from "@/components/motion/scroll-spine"
import { Badge } from "@/components/ui/badge"

/**
 * The timeline is where the two animation systems on this site meet.
 *
 * The trunk (ScrollSpine) is scroll-LINKED: it fills and empties with the
 * scroll position, because a progress line that only ever grew would be lying
 * about where you are once you scrolled back up.
 *
 * Everything hanging off it (node, branch, card) is ONE-SHOT. It plays the
 * first time that entry is reached and is permanently static afterwards, so
 * scrolling up and down does not turn the timeline into a light display.
 *
 * Geometry note: the rail sits at x = 8px, and the node is a 16px circle at
 * left: 0, whose centre therefore lands exactly on it. Changing one of those
 * two numbers without the other is what makes a timeline look subtly broken.
 */

function TimelineItem({
  entry,
  index,
}: {
  entry: TimelineEntry
  index: number
}) {
  const { ref, revealed } = useRevealOnce<HTMLLIElement>()
  const stagger = Math.min(index, 3)

  return (
    <li
      ref={ref}
      className="relative pl-10 sm:pl-16"
      style={{ "--reveal-i": stagger } as React.CSSProperties}
    >
      {/* The node on the trunk. */}
      <span
        data-node
        data-revealed={revealed ? "" : undefined}
        aria-hidden
        className={cn(
          "absolute top-1 left-0 grid size-4 place-items-center rounded-full border-2 bg-background transition-colors duration-500",
          revealed ? "border-primary" : "border-border"
        )}
      >
        <span
          className={cn(
            "size-1.5 rounded-full transition-colors duration-500",
            revealed ? "bg-primary" : "bg-border",
            entry.current && revealed && "animate-node-pulse"
          )}
        />
      </span>

      {/* The branch out to the card. */}
      <span
        data-branch
        data-revealed={revealed ? "" : undefined}
        aria-hidden
        className="absolute top-3 left-4 h-px w-5 bg-border sm:w-10"
      />

      <div
        data-reveal="right"
        data-revealed={revealed ? "" : undefined}
        className="surface surface-hover rounded-md p-6 sm:p-7"
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="font-mono text-xs text-muted-foreground tabular-nums">
            {entry.period}
          </p>
          {entry.current && (
            <Badge
              variant="outline"
              className="border-primary/50 font-mono text-primary"
            >
              Present
            </Badge>
          )}
        </div>

        <h3 className="font-display mt-3 text-xl font-semibold tracking-tight">
          {entry.title}
        </h3>

        <p className="mt-1.5 text-sm text-primary">{entry.organization}</p>
        {entry.location && (
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {entry.location}
          </p>
        )}

        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {entry.summary}
        </p>

        {/*
          Marked with a short hairline rather than a filled dot. A page that
          puts a coloured dot in front of every line of every list reads as
          decorated rather than designed, and a rule is the mark this
          typographic system already uses everywhere else.
        */}
        {/* max-w matches the summary above it. Without the cap these lines run
            the full width of the card, which on a desktop is well past 100
            characters and reads as a wall. */}
        <ul className="mt-5 max-w-2xl space-y-2.5">
          {entry.highlights.map((line) => (
            <li
              key={line}
              className="flex gap-3.5 text-sm leading-relaxed text-muted-foreground"
            >
              <span className="mt-2.5 h-px w-3 shrink-0 bg-border" aria-hidden />
              {line}
            </li>
          ))}
        </ul>

        {entry.skills && entry.skills.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-1.5">
            {entry.skills.map((skill) => (
              <li key={skill}>
                <Badge variant="secondary" className="font-mono">
                  {skill}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ScrollSpine railClassName="left-2">
      <ol className="space-y-10 sm:space-y-12">
        {entries.map((entry, i) => (
          <TimelineItem key={entry.id} entry={entry} index={i} />
        ))}
      </ol>
    </ScrollSpine>
  )
}
