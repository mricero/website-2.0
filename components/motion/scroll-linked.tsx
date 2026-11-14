"use client"

import * as React from "react"
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react"

import { scrollFx, sim, spring } from "@/lib/motion-config"
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
 *
 * The component writes only a unitless `--py` (pixels at phone scale); the
 * [data-parallax] rule in globals.css turns it into the translate, multiplies
 * it by --parallax-k from 640px up, and applies the scale. That keeps the
 * desktop amplification a media query rather than a width check in render,
 * and lets the reduced-motion override drop the travel with one rule. Like
 * `--p` in ScrollWrite it is a fixed-precision string, because Motion appends
 * "px" to bare numbers on unknown properties and `calc(12px * 1px)` is not a
 * length.
 *
 * Deliberately not sprung: the media is locked to the page, and a lag here
 * would read as the image sliding loose inside its frame.
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

  const half = amount / 2
  const py = useTransform(scrollYProgress, (v) =>
    (half - amount * Math.min(Math.max(v, 0), 1)).toFixed(2)
  )

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div
        data-parallax
        style={{ "--py": py } as React.CSSProperties}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   ScrollDepth
--------------------------------------------------------------------------- */

interface ScrollDepthProps {
  children: React.ReactNode
  className?: string
}

/**
 * The giant decorative hero word, sinking back as the first screen scrolls
 * away: it lifts a share of its own height and swells slightly.
 *
 * What it communicates: depth. The word is the backdrop, the masthead copy is
 * the foreground, and the backdrop moving a little slower and later than the
 * page is what separates the two planes.
 *
 * Progress is page scroll over one viewport height, so the effect completes
 * as the hero leaves. innerHeight is read inside the transform, at scroll
 * time, never during render: the server has no window and a resize after
 * mount should not need a re-render to be honoured.
 *
 * Unlike ParallaxMedia this one IS sprung (spring.scroll). The lag is the
 * point: a background that trails the foreground reads as further away.
 */
export function ScrollDepth({ children, className }: ScrollDepthProps) {
  const { scrollY } = useScroll()

  const raw = useTransform(scrollY, (v) => {
    const h = typeof window === "undefined" ? 0 : window.innerHeight
    return h > 0 ? Math.min(Math.max(v / h, 0), 1) : 0
  })
  const progress = useSpring(raw, spring.scroll)

  // y as a percentage of the element's own height, so the lift scales with
  // the word rather than with the viewport.
  const y = useTransform(
    progress,
    (p) => `${(-scrollFx.megaLift * 100 * p).toFixed(3)}%`
  )
  const scale = useTransform(progress, (p) => 1 + (scrollFx.megaScale - 1) * p)

  return (
    <motion.div data-depth style={{ y, scale }} className={className}>
      {children}
    </motion.div>
  )
}

/* ---------------------------------------------------------------------------
   VelocityMarquee
--------------------------------------------------------------------------- */

interface VelocityMarqueeProps {
  items: readonly string[]
  className?: string
  itemClassName?: string
}

/** Wrap `v` into [min, max). Handles negatives, unlike a bare `%`. */
function wrap(min: number, max: number, v: number) {
  const range = max - min
  return ((((v - min) % range) + range) % range) + min
}

/**
 * A strip of labels drifting sideways, which speeds up with scroll velocity
 * and turns round when the reader scrolls back up.
 *
 * What it communicates: momentum. It is the one element that answers how
 * fast you are moving rather than where you are, so it is used sparingly.
 *
 * Mechanics:
 *  - The list is rendered twice side by side; the track moves left and wraps
 *    by the width of ONE copy, so the seam is never visible. The copy is
 *    aria-hidden: assistive tech reads the list once.
 *  - The width lives in a ref fed by a ResizeObserver, never in state, so a
 *    font swap or resize re-measures without a render.
 *  - Speed is the base drift plus smoothed scroll velocity, capped. The
 *    velocity goes through spring.velocity so a flick eases off instead of
 *    snapping back to the base drift.
 *  - Integration uses real frame time (clamped to sim.maxFrame so a tab
 *    switch cannot leap), so the drift is the same speed at 60Hz and 144Hz.
 *  - The rAF loop runs only while the strip is on screen and the tab is
 *    visible. Off screen it costs nothing, not even an idle frame callback.
 *
 * Reduced motion: globals.css pins the track (transform none) and hides the
 * copy, so the strip renders as the plain wrapped list it is underneath. The
 * effect below also declines to start the loop under that preference, which
 * is a cost saving, not the mechanism; it reads the media query after mount,
 * never during render.
 */
export function VelocityMarquee({
  items,
  className,
  itemClassName,
}: VelocityMarqueeProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const copyRef = React.useRef<HTMLUListElement>(null)
  const widthRef = React.useRef(0)

  const x = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(velocity, spring.velocity)

  React.useEffect(() => {
    const root = rootRef.current
    const copy = copyRef.current
    if (!root || !copy) return

    // Measure one copy. borderBoxSize keeps the fraction; offsetWidth would
    // round it and the wrap would jump by that sub-pixel every cycle.
    const resize = new ResizeObserver(([entry]) => {
      const box = entry.borderBoxSize?.[0]
      widthRef.current = box ? box.inlineSize : entry.contentRect.width
    })
    resize.observe(copy)

    let frame = 0
    let last = 0
    let position = x.get()
    // Leftwards by default; flips with the last non-zero scroll direction and
    // keeps it after the scroll stops, so the strip coasts the way it was sent.
    let direction = 1
    let inView = false

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")

    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, sim.maxFrame) : 0
      last = now

      const v = smoothVelocity.get()
      if (v > 0.5) direction = 1
      else if (v < -0.5) direction = -1

      const speed = Math.min(
        scrollFx.marqueeBase + Math.abs(v) * scrollFx.marqueeGain,
        scrollFx.marqueeMax
      )
      position -= direction * speed * dt

      const w = widthRef.current
      if (w > 0) {
        position = wrap(-w, 0, position)
        x.set(position)
      }

      frame = requestAnimationFrame(tick)
    }

    const start = () => {
      if (frame) return
      // Reset the clock so the first frame after a pause integrates zero time
      // rather than the whole gap.
      last = 0
      frame = requestAnimationFrame(tick)
    }
    const stop = () => {
      if (!frame) return
      cancelAnimationFrame(frame)
      frame = 0
    }
    const sync = () => {
      if (inView && !document.hidden && !reduce.matches) start()
      else stop()
    }

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      sync()
    })
    io.observe(root)

    document.addEventListener("visibilitychange", sync)
    reduce.addEventListener("change", sync)

    return () => {
      stop()
      io.disconnect()
      resize.disconnect()
      document.removeEventListener("visibilitychange", sync)
      reduce.removeEventListener("change", sync)
    }
  }, [x, smoothVelocity])

  const itemClass = cn(
    // The leading hairline is the separator, the same short rule the mobile
    // nav uses to mark a row, so the strip reads as one continuous list.
    "flex shrink-0 items-center gap-4 px-4 font-mono text-xs whitespace-nowrap text-muted-foreground",
    "before:h-px before:w-3 before:bg-border-strong before:content-['']",
    itemClassName
  )

  return (
    <div ref={rootRef} data-marquee className={className}>
      <motion.div data-marquee-track style={{ x }}>
        {/*
         * Each copy is its own flex row. flex-wrap only matters under reduced
         * motion, when the track drops to the container width and this first
         * copy becomes an ordinary wrapping list; with the track at
         * max-content it never wraps.
         */}
        <ul ref={copyRef} className="flex min-w-0 flex-wrap">
          {items.map((item, i) => (
            // Static list that never reorders, and labels may repeat.
            <li key={i} className={itemClass}>
              {item}
            </li>
          ))}
        </ul>
        <ul aria-hidden data-marquee-copy className="flex min-w-0 flex-wrap">
          {items.map((item, i) => (
            <li key={i} className={itemClass}>
              {item}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  )
}
