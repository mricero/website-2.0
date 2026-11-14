"use client"

import * as React from "react"

import { registerBuild } from "@/components/motion/build/registry"
import { cn } from "@/lib/utils"

type BuildTag =
  | "div"
  | "header"
  | "section"
  | "aside"
  | "li"
  | "article"
  | "figure"
  | "p"
  | "span"
  | "nav"

export interface BuildProps extends React.HTMLAttributes<HTMLElement> {
  /** Element to render as. Pass "li" inside a list, as with Reveal. */
  as?: BuildTag
  /**
   * The name tag drawn on the selection frame: a section id or a name that
   * already exists in data/, never new copy, never a dash. Optional: without
   * one the engine names the block from its own heading or text.
   */
  label?: string
  /** Part of the home-page boot rather than built on scroll. */
  boot?: boolean
  /** Position in the boot sequence. */
  order?: number
  children?: React.ReactNode
}

/**
 * A block that assembles itself the first time it is seen: a cursor draws a
 * selection frame round it, a skeleton fills the frame, and an opaque cover
 * wipes off the real content underneath.
 *
 * The content is server-rendered and fully opaque from the first byte. The
 * only thing this adds to the markup is one empty, aria-hidden cover span,
 * which CSS controls entirely (see "Build covers" in globals.css). With
 * JavaScript off the <noscript> rule in app/layout.tsx removes it; with
 * JavaScript slow the CSS failsafe removes it; under reduced motion it never
 * shows. State is written to `data-build-state` by the engine, straight onto
 * the DOM, so a build never re-renders anything.
 *
 * Everything on the site builds this way, cards and rows included (Reveal is
 * now a Build too). The engine queues blocks that arrive together and starts
 * them in reading order a stagger apart, so a section and the rows inside it
 * cascade: the section's frame first, then each row within it.
 */
export function Build({
  as: Tag = "div",
  label = "",
  boot = false,
  order = 0,
  className,
  children,
  ...props
}: BuildProps) {
  const ref = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    return registerBuild(el, { label, boot, order })
  }, [label, boot, order])

  return (
    <Tag
      ref={ref as React.Ref<never>}
      data-build=""
      data-build-boot={boot ? "" : undefined}
      className={cn(className)}
      {...props}
    >
      {children}
      <span data-build-cover="" aria-hidden />
    </Tag>
  )
}

/**
 * For a component that owns its root element and its ref already (a list row
 * with its own reveal hook): register that element as a build. The element
 * must carry `data-build=""` and render <BuildCover /> as its last child.
 */
export function useBuild(
  ref: React.RefObject<HTMLElement | null>,
  label = ""
) {
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    return registerBuild(el, { label })
  }, [ref, label])
}

/** The cover span, for components that use useBuild. */
export function BuildCover() {
  return <span data-build-cover="" aria-hidden />
}
