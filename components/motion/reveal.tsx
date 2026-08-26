"use client"

import * as React from "react"

/**
 * One-shot scroll reveals.
 *
 * The contract the whole site depends on: an element animates in the first
 * time it enters the viewport and is *static forever after*. Scrolling back up
 * must not replay it, and re-entering must not re-trigger it.
 *
 * That is enforced here rather than in CSS, because the CSS-native
 * `animation-timeline: view()` is scroll-*linked* — it plays backwards as you
 * scroll up, which is the opposite of what an entrance wants. It is also still
 * Chromium-and-Safari-only. An IntersectionObserver that unobserves on first
 * hit gives exactly the right semantics, everywhere.
 *
 * Everything visual lives in the `[data-reveal]` rules in app/globals.css;
 * this file only decides *when* to stamp `data-revealed`.
 */

type RevealCallback = () => void

/**
 * One observer for the entire document rather than one per element. A page
 * like /projects/legal-rag has ~40 revealed elements, and forty observers
 * means forty independent intersection computations per scroll frame.
 */
let sharedObserver: IntersectionObserver | null = null
const pending = new WeakMap<Element, RevealCallback>()

function getObserver(): IntersectionObserver {
  if (sharedObserver) return sharedObserver

  sharedObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const callback = pending.get(entry.target)
        // Unobserve *before* invoking, so a callback that triggers layout
        // cannot cause this element to be queued a second time.
        observer.unobserve(entry.target)
        pending.delete(entry.target)
        callback?.()
      }
    },
    {
      // Fire slightly before the element is fully on screen — waiting until it
      // is centred makes the page feel like it lags behind the scroll.
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.08,
    }
  )

  return sharedObserver
}

/** Observe `el` until it first intersects, then never again. */
export function observeOnce(el: Element, callback: RevealCallback): () => void {
  pending.set(el, callback)
  getObserver().observe(el)

  return () => {
    pending.delete(el)
    sharedObserver?.unobserve(el)
  }
}

/** True when the user has asked their OS to stop moving things. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  )
}

/**
 * Attach to any element to learn when it has first been seen.
 *
 * Returns `revealed: true` immediately under reduced motion, so nothing
 * downstream has to special-case it — and the CSS in globals.css neutralises
 * the transforms as well, making this belt and braces.
 */
export function useRevealOnce<T extends Element = HTMLDivElement>() {
  const ref = React.useRef<T | null>(null)
  const [revealed, setRevealed] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    /*
     * Two cases skip the observer: the reader prefers reduced motion, or the
     * browser has no IntersectionObserver at all — in which case nothing would
     * ever stamp `data-revealed` and the page would stay blank below the fold.
     *
     * Scheduled on the next frame rather than called inline. A synchronous
     * setState in an effect body forces a second render pass before paint, and
     * every revealed element on the page would pay for it.
     */
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setRevealed(true))
      return () => cancelAnimationFrame(frame)
    }

    return observeOnce(el, () => setRevealed(true))
  }, [])

  return { ref, revealed }
}

type RevealTag =
  | "div"
  | "li"
  | "section"
  | "article"
  | "header"
  | "aside"
  | "figure"
  | "p"

export interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The element to render as. Defaults to a div.
   *
   * Pass "li" inside a <ul>/<ol>: a wrapper div between the list and its items
   * breaks list semantics outright — axe flags both `list` and `listitem`, and
   * screen readers stop announcing the group as a list at all. The animation
   * has to live *on* the <li>, not around it.
   */
  as?: RevealTag
  /** Entrance direction. "up" is the default and the right answer most of the time. */
  from?: "up" | "left" | "right" | "scale" | "none"
  /**
   * Position within a staggered group; multiplied by 75ms to produce the delay.
   * Pass the map index. There is no auto-numbering, because a component that
   * silently reorders its children's timing is impossible to debug.
   */
  index?: number
  children?: React.ReactNode
}

export function Reveal({
  as: Tag = "div",
  from = "up",
  index = 0,
  className,
  style,
  children,
  ...props
}: RevealProps) {
  const { ref, revealed } = useRevealOnce<HTMLElement>()

  return (
    <Tag
      // One generic ref across eight possible tags; the cast is the price of
      // not writing eight near-identical components.
      ref={ref as React.Ref<never>}
      data-reveal={from}
      data-revealed={revealed ? "" : undefined}
      className={className}
      style={
        index ? ({ "--reveal-i": index, ...style } as React.CSSProperties) : style
      }
      {...props}
    >
      {children}
    </Tag>
  )
}
