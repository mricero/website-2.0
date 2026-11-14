"use client"

import * as React from "react"

import { bezier, ease, micro } from "@/lib/motion-config"
import { observeOnce, prefersReducedMotion } from "@/components/motion/reveal"
import { cn } from "@/lib/utils"

/**
 * A plain number, optionally with thousands commas, decimals and one trailing
 * unit. Anchored, so "v0.9.0", "5 m" or "IISc" never match and stay static:
 * counting a version string from zero would be a lie about what it measures.
 */
const COUNTABLE = /^(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?([%x+k])?$/

interface Parsed {
  target: number
  decimals: number
  commas: boolean
  suffix: string
}

function parse(value: string): Parsed | null {
  const m = COUNTABLE.exec(value)
  if (!m) return null
  const [, whole, fraction = "", suffix = ""] = m
  return {
    target: Number(`${whole.replace(/,/g, "")}.${fraction || "0"}`),
    decimals: fraction.length,
    commas: whole.includes(","),
    suffix,
  }
}

function format(n: number, { decimals, commas, suffix }: Parsed): string {
  let text = n.toFixed(decimals)
  if (commas) {
    const [int, frac] = text.split(".")
    text = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (frac ? `.${frac}` : "")
  }
  return text + suffix
}

interface CountUpProps {
  value: string
  className?: string
}

/**
 * A metric that counts up from zero the first time it is seen.
 *
 * The final value is what the server renders, so a reader without
 * JavaScript, a crawler, and the first paint all get the real number. The
 * count is written to `textContent` in requestAnimationFrame, never through
 * React state, so it re-renders nothing.
 *
 * The width cannot shift: an invisible copy of the final value sits in the
 * same grid cell as the live text and sizes it. Both are aria-hidden, and a
 * visually hidden copy carries the value for assistive technology, so a
 * screen reader hears one number, the real one, once.
 *
 * A metric already on screen when the page hydrates is left alone. Resetting
 * a number the reader may already have read, just to count it back up, is
 * worse than not animating it.
 */
export function CountUp({ value, className }: CountUpProps) {
  const ref = React.useRef<HTMLSpanElement>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    // Writing textContent detaches React's own text node, so from here on
    // this effect owns the span's text, including after a change of value.
    el.textContent = value

    const parsed = parse(value)
    if (
      !parsed ||
      prefersReducedMotion() ||
      typeof IntersectionObserver === "undefined"
    ) {
      return
    }

    const r = el.getBoundingClientRect()
    if (r.top < window.innerHeight && r.bottom > 0) return

    // Off screen, so nobody sees the reset.
    el.textContent = format(0, parsed)

    let frame = 0
    const stop = observeOnce(el, () => {
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min((now - start) / 1000 / micro.countUp, 1)
        el.textContent = format(parsed.target * bezier(ease.outExpo, t), parsed)
        if (t < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    })

    return () => {
      stop()
      cancelAnimationFrame(frame)
      el.textContent = value
    }
  }, [value])

  return (
    <span className={cn("inline-grid tabular-nums", className)}>
      <span className="sr-only">{value}</span>
      <span aria-hidden className="invisible col-start-1 row-start-1">
        {value}
      </span>
      <span ref={ref} aria-hidden className="col-start-1 row-start-1">
        {value}
      </span>
    </span>
  )
}
