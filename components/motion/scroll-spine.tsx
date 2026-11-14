"use client"

import * as React from "react"
import { motion, useScroll, useSpring, useTransform } from "motion/react"

import { spring } from "@/lib/motion-config"
import { cn } from "@/lib/utils"

/**
 * The growing trunk behind the career timeline.
 *
 * This is the one place on the site where a *scroll-linked* animation is the
 * right tool rather than a one-shot reveal. A progress line that tracks scroll
 * position is legible in both directions — it reads as "you are here", not as
 * an entrance that misfired — whereas the cards hanging off it use the one-shot
 * `Reveal` and stay put once they have landed.
 *
 * Those two behaviours together give the tree effect: the trunk draws downward
 * as you scroll, and each branch snaps out once and then stops.
 */

interface ScrollSpineProps {
  children: React.ReactNode
  className?: string
  /**
   * Where the rail sits. Defaults to the left edge of the container; the
   * timeline pairs it with matching left padding on the cards.
   */
  railClassName?: string
}

export function ScrollSpine({
  children,
  className,
  railClassName,
}: ScrollSpineProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    // Start filling once the top of the list is 70% down the viewport, finish
    // when its bottom passes 55%. Ending short of the true bottom means the
    // trunk completes while the last card is still comfortably on screen.
    offset: ["start 70%", "end 55%"],
  })

  // The raw value steps with the scroll wheel. A spring turns it into a line
  // that flows, which is the whole difference between this looking designed
  // and looking like a progress bar.
  const progress = useSpring(scrollYProgress, spring.scroll)

  // The head rides down on a transform, not on `top`. Animating `top` is a
  // layout property, so every frame of scroll re-ran layout for the rail.
  // Instead a full-height layer is translated by a percentage of its OWN
  // height, which is the rail's height, so 100% lands exactly on the bottom.
  const tipY = useTransform(
    progress,
    (v) => `${(Math.min(Math.max(v, 0), 1) * 100).toFixed(3)}%`
  )
  // Fade the glowing head in as it leaves the top and out as it reaches the
  // end, so it never sits parked on the final node.
  const tipOpacity = useTransform(progress, [0, 0.03, 0.94, 1], [0, 1, 1, 0])

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/*
       * overflow-y: clip, because the head's layer is as tall as the rail and
       * translates down by up to its full height. Unclipped, that empty layer
       * would hang below the timeline and lengthen the page. `clip` rather
       * than `hidden` so the x axis stays visible for the dot and its glow,
       * and so no scroll container is created.
       */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-px overflow-y-clip",
          railClassName
        )}
      >
        {/* The dormant rail: always present, so layout never depends on JS. */}
        <div className="absolute inset-0 bg-border" />

        {/*
         * Reduced motion is handled in CSS (see [data-spine-*] in globals.css),
         * NOT by branching on useReducedMotion() here.
         *
         * That hook necessarily returns false during server rendering — there
         * is no media query to read — and its real value on the client. Using
         * it to pick between two different trees therefore guarantees a
         * hydration mismatch for exactly the readers who asked for less motion,
         * and React responds by throwing away and re-rendering the subtree.
         *
         * One tree, always. CSS neutralises it.
         */}
        <motion.div
          data-spine-trunk
          style={{ scaleY: progress }}
          className="absolute inset-0 origin-top bg-gradient-to-b from-primary/40 via-primary to-primary"
        />
        {/*
         * data-spine-tip sits on the moving layer, so the reduced-motion rule
         * removes the layer and the dot together.
         */}
        <motion.div
          data-spine-tip
          style={{ y: tipY, opacity: tipOpacity }}
          className="absolute inset-0"
        >
          <div
            style={{
              boxShadow:
                "0 0 10px 2px color-mix(in oklch, var(--primary) 55%, transparent)",
            }}
            className="absolute top-0 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
          />
        </motion.div>
      </div>

      {children}
    </div>
  )
}
