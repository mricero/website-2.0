"use client"

import * as React from "react"

import { requestBoot } from "@/components/motion/build/registry"

/**
 * Starts the home-page boot, or makes sure it never replays.
 *
 * The decision itself was made before first paint by the inline script in
 * app/layout.tsx, which wrote `data-boot` onto <html>: "play" on the first
 * view of / in a browser session (and not under reduced motion), "skip"
 * otherwise. This only acts on it:
 *
 *   play  ask the engine to run the boot over the hero's <Build boot> blocks
 *   done  the boot already ran and the reader has navigated back home: switch
 *         to "skip" before paint, so the hero gets the plain word rise
 *         instead of sitting static or replaying the boot
 *
 * A layout effect, so the switch lands before the browser paints the
 * remounted hero. Renders nothing.
 */
export function Boot() {
  React.useLayoutEffect(() => {
    const root = document.documentElement
    const mode = root.getAttribute("data-boot")
    if (mode === "play") requestBoot()
    else if (mode === "done") root.setAttribute("data-boot", "skip")
  }, [])

  return null
}
