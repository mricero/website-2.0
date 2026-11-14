"use client"

import * as React from "react"
import { useMotionValueEvent, useScroll } from "motion/react"

import { startEngine, type EngineHandle } from "@/components/motion/build/engine"

/**
 * The build stage: one fixed, pointer-transparent canvas for the whole site,
 * mounted once in app/layout.tsx after everything else, so every <Build> on
 * the first page has registered by the time the engine attaches.
 *
 * Server-rendered as an empty canvas and nothing more. The engine starts in
 * an effect, which is also where it decides about reduced motion, so the
 * server and the first client render are identical.
 *
 * Scroll reaches the engine through Motion's scroll value, never a scroll
 * listener of our own. It wakes the loop and feeds the windowed velocity
 * behind the fling rule; the engine reads the live position for drawing.
 */
export function BuildStage() {
  const ref = React.useRef<HTMLCanvasElement>(null)
  const engine = React.useRef<EngineHandle | null>(null)

  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (y) => {
    engine.current?.setScroll(y)
    engine.current?.wake()
  })

  React.useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const handle = startEngine(canvas)
    engine.current = handle
    return () => {
      handle.destroy()
      engine.current = null
    }
  }, [])

  return (
    <canvas
      ref={ref}
      data-build-stage=""
      aria-hidden
      className="pointer-events-none fixed inset-0 h-full w-full"
      style={{ zIndex: "var(--z-build)" }}
    />
  )
}
