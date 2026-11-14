"use client"

import * as React from "react"
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionStyle,
} from "motion/react"

import { micro, spring } from "@/lib/motion-config"
import { prefersReducedMotion } from "@/components/motion/reveal"
import { cn } from "@/lib/utils"

/**
 * Pointer micro-interactions: a control that leans toward the cursor, and a
 * card that tilts under it.
 *
 * Both follow the rules of the scroll-linked primitives. Pointer position
 * never enters React state: it lands in MotionValues that write straight to
 * style, so moving the mouse re-renders nothing. Whether to listen at all
 * (a fine pointer, and no request for reduced motion) is decided inside an
 * effect, never during render, so server and client always render the same
 * tree. The reduced motion rules in globals.css flatten both regardless.
 */

/** True when this device has a mouse or trackpad and motion is welcome. */
function pointerFxAllowed(): boolean {
  return (
    window.matchMedia?.("(pointer: fine)").matches === true &&
    !prefersReducedMotion()
  )
}

/** Append "px", so a CSS variable reads as a length inside calc(). */
const toPx = (v: number) => `${v.toFixed(2)}px`

const clamp = (v: number) => Math.max(-1, Math.min(1, v))

/* ---------------------------------------------------------------------------
   Magnetic
--------------------------------------------------------------------------- */

interface MagneticProps {
  children: React.ReactNode
  className?: string
}

/**
 * Leans its child toward the pointer once it comes within reach.
 *
 * The pull is strongest at the control's edge and fades to nothing at the
 * edge of the reach, so crossing that boundary never produces a jump. Inside
 * the control it scales with distance from the centre, so a pointer resting
 * on the label holds it still. The spring carries velocity through every
 * change of target, which is what makes the release feel thrown rather than
 * reset.
 *
 * --mx and --my mirror the same springs for any `[data-icon]` inside, which
 * globals.css moves half as far again as the control.
 */
export function Magnetic({ children, className }: MagneticProps) {
  const ref = React.useRef<HTMLSpanElement>(null)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, spring.magnet)
  const y = useSpring(rawY, spring.magnet)
  const mx = useTransform(x, toPx)
  const my = useTransform(y, toPx)

  React.useEffect(() => {
    const el = ref.current
    if (!el || !pointerFxAllowed()) return

    const release = () => {
      rawX.set(0)
      rawY.set(0)
    }

    const onMove = (e: PointerEvent) => {
      // One rect read per move is cheap at a handful of instances. The
      // current lean is subtracted so the control never chases itself.
      const r = el.getBoundingClientRect()
      const left = r.left - x.get()
      const top = r.top - y.get()
      const halfW = r.width / 2
      const halfH = r.height / 2
      const dx = e.clientX - (left + halfW)
      const dy = e.clientY - (top + halfH)

      // Distance from the box itself, zero anywhere inside it.
      const outX = Math.max(Math.abs(dx) - halfW, 0)
      const outY = Math.max(Math.abs(dy) - halfH, 0)
      const gap = Math.hypot(outX, outY)

      if (gap >= micro.magnetReach) {
        release()
        return
      }

      const strength = (1 - gap / micro.magnetReach) * micro.magnetPull
      rawX.set(clamp(dx / halfW) * strength)
      rawY.set(clamp(dy / halfH) * strength)
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    // A pointer that leaves the window mid-lean would otherwise strand it.
    document.documentElement.addEventListener("pointerleave", release)

    return () => {
      window.removeEventListener("pointermove", onMove)
      document.documentElement.removeEventListener("pointerleave", release)
      release()
    }
  }, [rawX, rawY, x, y])

  return (
    <motion.span
      ref={ref}
      data-magnetic=""
      className={cn("inline-flex", className)}
      style={{ x, y, "--mx": mx, "--my": my } as MotionStyle}
    >
      {children}
    </motion.span>
  )
}

/* ---------------------------------------------------------------------------
   Tilt
--------------------------------------------------------------------------- */

/**
 * Distance from the viewer, in px, for the tilt's perspective. A geometry
 * value rather than a motion constant: shorter exaggerates the near edge, and
 * at 2.5 degrees anything around a card's own width reads as flat paper.
 */
const TILT_PERSPECTIVE = 1000

interface TiltProps {
  children: React.ReactNode
  className?: string
}

/**
 * Tilts a card a couple of degrees under the pointer, and writes --tilt-x and
 * --tilt-y (px, opposite direction) so media inside can shift against it.
 *
 * This is the outer element on purpose. The card inside keeps its own hover
 * lift on `transform`, and two writers on one transform would fight; nested,
 * they compose.
 */
export function Tilt({ children, className }: TiltProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const enabled = React.useRef(false)

  // Pointer position relative to the centre, -1 to 1 on each axis.
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, spring.magnet)
  const sy = useSpring(py, spring.magnet)

  // Pointer to the right sinks the right edge; pointer below sinks the bottom.
  const rotateY = useTransform(sx, (v) => v * micro.tiltDeg)
  const rotateX = useTransform(sy, (v) => -v * micro.tiltDeg)
  const shiftX = useTransform(sx, (v) => toPx(-v * micro.tiltShift))
  const shiftY = useTransform(sy, (v) => toPx(-v * micro.tiltShift))

  React.useEffect(() => {
    enabled.current = pointerFxAllowed()
  }, [])

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    // A touch on a hybrid laptop still reports a fine primary pointer.
    if (!enabled.current || !el || e.pointerType === "touch") return
    const r = el.getBoundingClientRect()
    px.set(clamp(((e.clientX - r.left) / r.width) * 2 - 1))
    py.set(clamp(((e.clientY - r.top) / r.height) * 2 - 1))
  }

  const onPointerLeave = () => {
    px.set(0)
    py.set(0)
  }

  return (
    <motion.div
      ref={ref}
      data-tilt=""
      className={className}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={
        {
          transformPerspective: TILT_PERSPECTIVE,
          rotateX,
          rotateY,
          "--tilt-x": shiftX,
          "--tilt-y": shiftY,
        } as MotionStyle
      }
    >
      {children}
    </motion.div>
  )
}
