"use client"

import * as React from "react"
import { ArrowUpIcon } from "lucide-react"
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react"

import { prefersReducedMotion } from "@/components/motion/reveal"

/**
 * Back to top. Appears after two viewport heights of scrolling — late enough
 * never to compete with the hero, early enough to be there when a case study
 * has genuinely run long.
 *
 * Deliberately a real <button> carrying a label rather than a bare icon: an
 * icon-only control with no accessible name is the single most common failure
 * in a component like this one.
 */
export function BackToTop() {
  const { scrollY } = useScroll()
  const [visible, setVisible] = React.useState(false)

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > window.innerHeight * 2)
  })

  const toTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={toTop}
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.9 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed right-5 bottom-5 z-40 inline-flex size-10 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground shadow-sm backdrop-blur-md transition-colors hover:border-primary/50 hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 sm:right-8 sm:bottom-8"
        >
          <ArrowUpIcon className="size-4" aria-hidden />
          <span className="sr-only">Back to top</span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
