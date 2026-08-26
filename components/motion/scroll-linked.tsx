"use client"

import * as React from "react"
import { motion, useScroll, useTransform, type MotionValue } from "motion/react"

import { cn } from "@/lib/utils"

/**
 * Scroll-LINKED motion primitives.
 *
 * The sibling module, reveal.tsx, owns the other half of the system: one-shot
 * entrances that fire once and are static forever after. Everything in *this*
 * file deliberately tracks scroll position in both directions, because for
 * these effects the position is the information rather than a trigger.
 *
 * Three rules hold across the file:
 *
 *  1. Nothing here ever calls window.addEventListener("scroll"). `useScroll`
 *     batches through Motion's frame loop; a raw listener runs on every scroll
 *     event and forces layout each time.
 *  2. Nothing here writes scroll position into React state. Every value below
 *     is a MotionValue applied straight to a style property, so scrolling the
 *     page re-renders exactly zero components.
 *  3. Only `transform` and `opacity` are animated. No top, left, width, height.
 *
 * Reduced motion is handled in globals.css rather than by branching on
 * useReducedMotion() during render: that hook returns false on the server and
 * its real value on the client, so branching on it produces a hydration
 * mismatch for precisely the readers it was meant to help.
 */

/* ---------------------------------------------------------------------------
   ScrollWrite
--------------------------------------------------------------------------- */

interface ScrollWriteProps {
  /** Plain text. Split on whitespace, one span per word. */
  text: string
  className?: string
}

/**
 * A statement that writes itself in as the section crosses the viewport: each
 * word lifts out of the muted colour a beat after the one before it.
 *
 * What it communicates: pace. This is the one line on the home page meant to
 * be *read* rather than scanned, and metering it to the scroll is what stops a
 * reader treating it as another block of grey text.
 *
 * The per-word opacity is computed in CSS (see [data-scrollwrite] in
 * globals.css) from three custom properties: `--p` scroll progress on the
 * container, `--n` the word count, and `--i` the word's index. Doing the
 * arithmetic in CSS keeps this to a single MotionValue no matter how long the
 * sentence is; the alternative is one useTransform per word.
 *
 * `--p` is written as a fixed-precision string rather than a raw number
 * because Motion appends "px" to bare numeric values for unknown properties,
 * and `calc(0.42px * 9)` is not a number.
 */
export function ScrollWrite({ text, className }: ScrollWriteProps) {
  const ref = React.useRef<HTMLParagraphElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    // Begin as the line enters the lower third, finish while it is still
    // comfortably on screen. Ending at "end 60%" rather than "end start"
    // means the last word lands before the reader has scrolled past it.
    offset: ["start 85%", "end 60%"],
  })

  const progress = useTransform(scrollYProgress, (v) => v.toFixed(4))

  const words = React.useMemo(() => text.split(/\s+/).filter(Boolean), [text])

  return (
    <motion.p
      ref={ref}
      data-scrollwrite
      style={
        {
          "--p": progress,
          "--n": words.length,
        } as React.CSSProperties
      }
      className={className}
    >
      {words.map((word, i) => (
        <span
          // Words repeat inside a sentence, so the index is the only stable
          // key here. The list never reorders, which is what makes that safe.
          key={i}
          style={{ "--i": i } as React.CSSProperties}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </motion.p>
  )
}

/* ---------------------------------------------------------------------------
   StickyStack
--------------------------------------------------------------------------- */

interface StickyStackProps {
  children: React.ReactNode
  className?: string
}

/**
 * Cards that pin at the top of the viewport and stack over one another as you
 * scroll, each dimming and shrinking slightly as the next arrives.
 *
 * What it communicates: sequence. The lead projects are ordered, and a plain
 * grid says nothing about that. Physically laying one over the next says
 * "there is a first one, and here is what came after it".
 *
 * The pinning itself is CSS `position: sticky` on each child, not a JS pin.
 * Children stay in normal flow, so the container's height is the sum of the
 * cards and the browser does the sticking on the compositor. Only the scale
 * and the dim are driven from JavaScript.
 */
export function StickyStack({ children, className }: StickyStackProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const items = React.Children.toArray(children)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  return (
    <div ref={ref} className={cn("relative", className)}>
      {items.map((child, i) => (
        <StackItem
          key={i}
          index={i}
          count={items.length}
          progress={scrollYProgress}
          // The last card has nothing arriving over it, so it never recedes.
          last={i === items.length - 1}
        >
          {child}
        </StackItem>
      ))}
    </div>
  )
}

interface StackItemProps {
  children: React.ReactNode
  index: number
  count: number
  progress: MotionValue<number>
  last: boolean
}

function StackItem({ children, index, count, progress, last }: StackItemProps) {
  // Each card owns the slice of the container's scroll during which the *next*
  // card travels up over it. Outside that slice the transforms are clamped at
  // their endpoints, which is what useTransform does by default.
  const from = index / count
  const to = (index + 1) / count

  const scale = useTransform(progress, [from, to], [1, 0.94])
  const scrim = useTransform(progress, [from, to], [0, 0.72])

  return (
    <motion.div
      data-stack-item
      style={last ? undefined : { scale }}
      className={cn(index > 0 && "mt-6")}
    >
      <div className="relative">
        {children}

        {/*
         * The receding card dims under an opaque scrim in the page colour,
         * NOT by having its own opacity animated.
         *
         * Animating opacity on the wrapper makes the entire subtree
         * translucent, which in a stack means the card underneath shows
         * straight through the card on top: two case studies rendered over
         * each other, both unreadable. Opacity is the obvious way to write
         * this and it is the wrong one. A scrim keeps every card fully opaque
         * and still reads as "this one is behind now".
         */}
        {!last && (
          <motion.div
            aria-hidden
            style={{ opacity: scrim }}
            className="pointer-events-none absolute inset-0 rounded-md bg-background"
          />
        )}
      </div>
    </motion.div>
  )
}

/* ---------------------------------------------------------------------------
   ScrollFadeOut
--------------------------------------------------------------------------- */

interface ScrollFadeOutProps {
  children: React.ReactNode
  className?: string
  /** Pixels of upward drift at full progress. */
  lift?: number
}

/**
 * Content that recedes as it leaves the top of the viewport: a small upward
 * drift plus a fade.
 *
 * What it communicates: a handoff. Used on the hero, it stops the masthead
 * competing with the section that has just arrived, and gives the top of the
 * page some depth without anything moving while the reader is still looking
 * at it.
 *
 * Kept deliberately shallow. A hero that flies apart on the first wheel click
 * is a different, worse effect.
 */
export function ScrollFadeOut({
  children,
  className,
  lift = 60,
}: ScrollFadeOutProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  // Nothing happens for the first fifth of the travel, so a reader who nudges
  // the wheel does not immediately see the page start dissolving.
  const y = useTransform(scrollYProgress, [0, 1], [0, -lift])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.9], [1, 1, 0])

  return (
    <motion.div ref={ref} style={{ y, opacity }} className={className}>
      {children}
    </motion.div>
  )
}

/* ---------------------------------------------------------------------------
   ParallaxMedia
--------------------------------------------------------------------------- */

interface ParallaxMediaProps {
  children: React.ReactNode
  className?: string
  /** Total travel in pixels, split either side of centre. */
  amount?: number
}

/**
 * An image that drifts against the scroll inside its frame.
 *
 * What it communicates: that the frame is a window rather than a rectangle
 * with a picture printed on it. Small amounts only; this is the effect that
 * most often gets overdone.
 *
 * The child is scaled slightly so the travel never exposes an edge, which
 * means the wrapper has to clip.
 */
export function ParallaxMedia({
  children,
  className,
  amount = 28,
}: ParallaxMediaProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [amount / 2, -amount / 2])

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div style={{ y }} className="h-full w-full scale-[1.08]">
        {children}
      </motion.div>
    </div>
  )
}
