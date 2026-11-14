/**
 * The cursor simulation behind the build effect.
 *
 * Pure TypeScript: no React, no DOM, no clock. Everything it needs about the
 * world arrives in `Env` on each step, and every random choice comes from a
 * seeded generator, so a run is reproducible and can be checked under plain
 * node.
 *
 * Positions are viewport pixels. Targets are DOCUMENT pixels, converted with
 * `env.scrollY` on every step, so a cursor holding the corner of a heading
 * stays on that corner while the page scrolls under it.
 *
 * Two properties carry the whole "fluid" feel and are worth protecting:
 *
 *  - A new target never resets anything. Travel is a minimum-jerk path
 *    re-planned from the cursor's current position, velocity and
 *    acceleration, so a cursor sent somewhere else mid-flight curves onto its
 *    new course with all three continuous. That is where the arcs come from.
 *  - Everything runs on a fixed step (1/120 s): travel is evaluated
 *    analytically at the step time, the force-driven modes integrate with
 *    semi-implicit Euler. The motion is identical at 30, 60 and 120 Hz.
 */

import { sim as S } from "../../../lib/motion-config"

export type Mode = "orbit" | "travel" | "drift" | "exit" | "gone"

export interface Cursor {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  /** Current acceleration, kept so a replan can start from it (C2). */
  ax: number
  ay: number
  angle: number
  /** Previous step, for interpolating between physics steps when drawing. */
  px: number
  py: number
  pangle: number
  mode: Mode
  /** Travel target, document space. */
  tx: number
  ty: number
  /** Active travel plan: quintic coefficients per axis, document space. */
  plan: Plan | null
  /** Orbit ring. */
  orbitR: number
  orbitTheta: number
  /** Drift slot: which figure-eight, and how far round it. */
  slot: number
  phase: number
  /** Owned by a section job, if any. */
  job: number | null
  /** Ambient cursors stay after the boot and take section jobs. */
  ambient: boolean
}

export interface Plan {
  /** Sim time the plan started, and its duration, seconds. */
  t0: number
  T: number
  cx: Quintic
  cy: Quintic
}

type Quintic = [number, number, number, number, number, number]

/**
 * Minimum-jerk quintic from (p0, v0, a0) to (p1, 0, 0) over T: the unique
 * fifth-order path that matches all six boundary conditions.
 */
function quintic(
  p0: number,
  v0: number,
  a0: number,
  p1: number,
  T: number
): Quintic {
  const d = p1 - p0
  const T2 = T * T
  const T3 = T2 * T
  return [
    p0,
    v0,
    a0 / 2,
    (20 * d - 12 * v0 * T - 3 * a0 * T2) / (2 * T3),
    (-30 * d + 16 * v0 * T + 3 * a0 * T2) / (2 * T3 * T),
    (12 * d - 6 * v0 * T - a0 * T2) / (2 * T3 * T2),
  ]
}

/** Position, velocity and acceleration of a quintic at time t. */
function evalQuintic(c: Quintic, t: number): [number, number, number] {
  return [
    c[0] + t * (c[1] + t * (c[2] + t * (c[3] + t * (c[4] + t * c[5])))),
    c[1] + t * (2 * c[2] + t * (3 * c[3] + t * (4 * c[4] + t * 5 * c[5]))),
    2 * c[2] + t * (6 * c[3] + t * (12 * c[4] + t * 20 * c[5])),
  ]
}

export interface Env {
  width: number
  height: number
  scrollY: number
  /** Pointer in viewport space, or NaN when there is none. */
  pointerX: number
  pointerY: number
  /** Orbit centre, viewport space. */
  centreX: number
  centreY: number
  /** Number of drift slots in use, for spacing the figure-eights. */
  slots: number
}

export interface Sim {
  cursors: Cursor[]
  time: number
  rand: () => number
  nextId: number
}

/** mulberry32: small, fast, good enough for scattering cursors. */
function seeded(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createSim(seed = 1): Sim {
  return { cursors: [], time: 0, rand: seeded(seed), nextId: 1 }
}

function make(sim: Sim, x: number, y: number, ambient: boolean): Cursor {
  const c: Cursor = {
    id: sim.nextId++,
    x,
    y,
    vx: 0,
    vy: 0,
    ax: 0,
    ay: 0,
    angle: S.restAngle,
    px: x,
    py: y,
    pangle: S.restAngle,
    mode: "drift",
    tx: 0,
    ty: 0,
    plan: null,
    orbitR: 0,
    orbitTheta: 0,
    slot: 0,
    phase: 0,
    job: null,
    ambient,
  }
  sim.cursors.push(c)
  return c
}

/**
 * Spawn a flock already in orbit round (cx, cy), each cursor given its
 * tangential velocity up front so the very first frame is in motion.
 */
export function spawnFlock(sim: Sim, count: number, cx: number, cy: number) {
  const [rMin, rMax] = S.orbitRadius
  const out: Cursor[] = []
  for (let i = 0; i < count; i++) {
    const r = rMin + (rMax - rMin) * sim.rand()
    const theta = sim.rand() * Math.PI * 2
    const c = make(sim, cx + r * Math.cos(theta), cy + r * Math.sin(theta), false)
    c.mode = "orbit"
    c.orbitR = r
    c.orbitTheta = theta
    c.vx = -Math.sin(theta) * S.orbitSpeed
    c.vy = Math.cos(theta) * S.orbitSpeed
    c.angle = c.pangle = Math.atan2(c.vy, c.vx)
    out.push(c)
  }
  return out
}

/** Spawn one cursor at a viewport point, drifting until told otherwise. */
export function spawnAt(sim: Sim, x: number, y: number, ambient: boolean) {
  return make(sim, x, y, ambient)
}

/**
 * Send a cursor to a document-space point, planning a minimum-jerk path from
 * wherever it is and however it is moving. Nothing is reset, so the new path
 * leaves tangent to the old one.
 *
 * `scatter` (the boot's launch) adds a sideways kick proportional to the
 * distance, random sign, so a flock launched together fans out along arcs
 * instead of lines. It is a launch impulse by design: the one place velocity
 * is allowed to change within a step.
 */
export function travelTo(
  sim: Sim,
  c: Cursor,
  docX: number,
  docY: number,
  env: Env,
  scatter = false
) {
  const x0 = c.x
  const y0 = c.y + env.scrollY
  const dx = docX - x0
  const dy = docY - y0
  const dist = Math.hypot(dx, dy)

  if (scatter && dist >= 1) {
    const [kMin, kMax] = S.scatterImpulse
    const k = (kMin + (kMax - kMin) * sim.rand()) * (sim.rand() < 0.5 ? -1 : 1)
    // Perpendicular to the line of travel, "fraction of distance per second".
    c.vx += -dy * k
    c.vy += dx * k
  }

  // Inherit acceleration, bounded, so a chain of quick retargets cannot
  // compound into a wild swing.
  let ax = c.ax
  let ay = c.ay
  const a = Math.hypot(ax, ay)
  if (a > S.travelMaxA0) {
    ax *= S.travelMaxA0 / a
    ay *= S.travelMaxA0 / a
  }

  const T = Math.min(
    S.travelMaxT,
    Math.max(S.travelMinT, S.travelMinT + dist * S.travelPerPx)
  )
  c.mode = "travel"
  c.tx = docX
  c.ty = docY
  c.plan = {
    t0: sim.time,
    T,
    cx: quintic(x0, c.vx, ax, docX, T),
    cy: quintic(y0, c.vy, ay, docY, T),
  }
}

export function drift(c: Cursor, slot: number) {
  c.mode = "drift"
  c.job = null
  c.plan = null
  c.slot = slot
}

export function exit(c: Cursor) {
  c.mode = "exit"
  c.job = null
  c.plan = null
}

/** Where drift slot `slot` sits right now: a figure-eight in the right gutter. */
function driftPoint(c: Cursor, env: Env) {
  const gutter = Math.max(24, (env.width - S.contentWidth) / 2)
  const cx = env.width - gutter / 2
  const amp = Math.max(4, Math.min(40, gutter / 2 - 8))
  const span = Math.max(1, env.slots - 1)
  const cy = env.height * (0.22 + (0.6 * c.slot) / span)
  return {
    x: cx + amp * Math.sin(c.phase),
    y: cy + 25 * Math.sin(2 * c.phase),
  }
}

function spring(c: Cursor, x: number, y: number, omega: number) {
  return {
    ax: -2 * omega * c.vx - omega * omega * (c.x - x),
    ay: -2 * omega * c.vy - omega * omega * (c.y - y),
  }
}

function shortest(a: number) {
  return Math.atan2(Math.sin(a), Math.cos(a))
}

/** Face the direction of travel; at rest, point up and to the left. */
function turn(c: Cursor, h: number) {
  const speed = Math.hypot(c.vx, c.vy)
  const heading =
    speed > S.headingMinSpeed ? Math.atan2(c.vy, c.vx) : S.restAngle
  c.angle += shortest(heading - c.angle) * (1 - Math.exp(-h / S.turnTau))
}

/** Advance every cursor by one fixed step `h` (seconds). */
export function step(sim: Sim, h: number, env: Env) {
  sim.time += h
  let anyGone = false

  for (const c of sim.cursors) {
    c.px = c.x
    c.py = c.y
    c.pangle = c.angle

    let ax = 0
    let ay = 0

    switch (c.mode) {
      case "orbit": {
        // Chase a point running round the ring. A stiff spring on a moving
        // target gives a flock that holds its shape but never moves rigidly.
        c.orbitTheta += (S.orbitSpeed * h) / c.orbitR
        const wobble = 1 + 0.15 * Math.sin(sim.time * 2.1 + c.id)
        const tx = env.centreX + c.orbitR * wobble * Math.cos(c.orbitTheta)
        const ty = env.centreY + c.orbitR * wobble * Math.sin(c.orbitTheta)
        ;({ ax, ay } = spring(c, tx, ty, S.orbitOmega))
        break
      }
      case "travel": {
        // Analytic, not integrated: evaluate the plan at this step's time.
        // After T the cursor holds the target corner, which scrolls with the
        // page because the plan is in document space.
        const p = c.plan
        const t = p ? sim.time - p.t0 : Infinity
        if (p && t < p.T) {
          const [x, vx, accX] = evalQuintic(p.cx, t)
          const [y, vy, accY] = evalQuintic(p.cy, t)
          c.x = x
          c.y = y - env.scrollY
          c.vx = vx
          c.vy = vy
          c.ax = accX
          c.ay = accY
        } else {
          c.x = c.tx
          c.y = c.ty - env.scrollY
          c.vx = c.vy = c.ax = c.ay = 0
        }
        turn(c, h)
        continue
      }
      case "drift": {
        c.phase += (S.driftSpeed / 45) * h
        const p = driftPoint(c, env)
        ;({ ax, ay } = spring(c, p.x, p.y, S.driftOmega))
        if (!Number.isNaN(env.pointerX)) {
          const dx = c.x - env.pointerX
          const dy = c.y - env.pointerY
          const d = Math.hypot(dx, dy)
          if (d > 0.5 && d < S.fleeRadius) {
            const push = S.fleeAccel * (1 - d / S.fleeRadius)
            ax += (dx / d) * push
            ay += (dy / d) * push
          }
        }
        break
      }
      case "exit": {
        // Accelerate away from the middle of the viewport, toward the
        // nearest edge.
        const dx = c.x - env.width / 2
        const dy = c.y - env.height / 2
        const d = Math.hypot(dx, dy) || 1
        ax = (dx / d) * S.exitAccel
        ay = (dy / d) * S.exitAccel
        break
      }
      case "gone":
        anyGone = true
        continue
    }

    // Semi-implicit Euler: velocity first, then position with the new velocity.
    c.ax = ax
    c.ay = ay
    c.vx += ax * h
    c.vy += ay * h
    c.x += c.vx * h
    c.y += c.vy * h

    turn(c, h)

    if (c.mode === "exit") {
      const m = S.exitMargin
      if (c.x < -m || c.y < -m || c.x > env.width + m || c.y > env.height + m) {
        c.mode = "gone"
        anyGone = true
      }
    }
  }

  // Retire the gone, so the array never grows across a long session.
  if (anyGone) sim.cursors = sim.cursors.filter((c) => c.mode !== "gone")
}

/**
 * True when every cursor is merely drifting: nothing travelling, orbiting or
 * leaving. Drift itself never stops (it is a slow loop), so the stage decides
 * idleness from this plus time since the last input, not from speed.
 */
export function settled(sim: Sim): boolean {
  return sim.cursors.every((c) => c.mode === "drift")
}
