"use client"

import * as React from "react"

import { Build } from "@/components/motion/build/build"

/**
 * One-shot entrances.
 *
 * The contract the whole site depends on: an element animates in the first
 * time it enters the viewport and is *static forever after*. Scrolling back up
 * must not replay it, and re-entering must not re-trigger it.
 *
 * That is enforced here rather than in CSS, because the CSS-native
 * `animation-timeline: view()` is scroll-linked: it plays backwards as you
 * scroll up, which is the opposite of what an entrance wants. An
 * IntersectionObserver that unobserves on first hit gives exactly the right
 * semantics, everywhere.
 *
 * `observeOnce` is the shared observer every entrance on the site uses: the
 * build engine, `useRevealOnce` (skill rows and bars, timeline branches and
 * nodes, whose visuals are the `[data-reveal]`, `[data-bar]`, `[data-branch]`
 * and `[data-node]` rules in app/globals.css) and the count-ups. `Reveal`
 * itself is now a Build; see the note above RevealProps.
 */

type RevealCallback = () => void

/**
 * One observer for the entire document rather than one per element. A page
 * like /projects/legal-rag has ~40 revealed elements, and forty observers
 * means forty independent intersection computations per scroll frame.
 */
let sharedObserver: IntersectionObserver | null = null
/*
 * Several callers can watch the same element (a skill row is both a build and
 * a reveal), so each element holds a set of callbacks, not one slot. A single
 * slot let the second caller silently replace the first, and the row's own
 * entrance never fired.
 */
const pending = new WeakMap<Element, Set<RevealCallback>>()

function getObserver(): IntersectionObserver {
  if (sharedObserver) return sharedObserver

  sharedObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const callbacks = pending.get(entry.target)
        // Unobserve *before* invoking, so a callback that triggers layout
        // cannot cause this element to be queued a second time.
        observer.unobserve(entry.target)
        pending.delete(entry.target)
        callbacks?.forEach((callback) => callback())
      }
    },
    {
      // Fire slightly before the element is fully on screen: waiting until it
      // is centred makes the page feel like it lags behind the scroll.
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.08,
    }
  )

  return sharedObserver
}

/**
 * Observe `el` until it first intersects, then never again. Returns a
 * function that withdraws this callback only; the element stays observed
 * while any other caller is still waiting on it.
 */
export function observeOnce(el: Element, callback: RevealCallback): () => void {
  let callbacks = pending.get(el)
  if (!callbacks) {
    callbacks = new Set()
    pending.set(el, callbacks)
    getObserver().observe(el)
  }
  callbacks.add(callback)

  return () => {
    const set = pending.get(el)
    if (!set) return
    set.delete(callback)
    if (set.size === 0) {
      pending.delete(el)
      sharedObserver?.unobserve(el)
    }
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

/*
 * Reveal is a Build now.
 *
 * Every block on the site assembles itself the same way: a cursor arrives, a
 * selection frame grows round the block, a skeleton fills it and an opaque
 * cover wipes off the real content. Routing Reveal through Build is what makes
 * that true of every card, row and panel at once, without touching their
 * call sites. The props stay so those call sites keep compiling: `from` and
 * `index` no longer apply, because the build engine orders blocks by where
 * they sit and staggers them itself.
 *
 * The one-shot contract is unchanged: a block builds the first time it is
 * seen (the same shared observer below) and is static forever after.
 * `useRevealOnce` and `observeOnce` stay for the pieces with their own
 * entrance (skill bars, timeline branches and nodes, count-ups).
 */
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
  /** Kept for call-site compatibility; the build replaces the direction. */
  from?: "up" | "left" | "right" | "scale" | "none"
  /** Kept for call-site compatibility; the engine staggers by position. */
  index?: number
  /** Name tag for the frame. Without one the block names itself. */
  label?: string
  children?: React.ReactNode
}

export function Reveal({
  as = "div",
  from,
  index,
  label,
  children,
  ...props
}: RevealProps) {
  // Accepted and deliberately unused: see the note above RevealProps.
  void from
  void index
  return (
    <Build as={as} label={label} {...props}>
      {children}
    </Build>
  )
}
