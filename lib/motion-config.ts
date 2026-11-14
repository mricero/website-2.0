/**
 * Every motion constant on the site.
 *
 * No component writes a literal duration, easing, spring or stagger; it
 * imports one from here. The CSS side mirrors the easings and durations as
 * custom properties (--ease-*, --dur-*) in app/globals.css, and this file is
 * the source of truth for both: change a value here, change its twin there.
 *
 * Pure data and pure functions only. No React, no DOM, so the build engine's
 * simulation (components/motion/build/sim.ts) can import it and still be run
 * under plain node.
 *
 * Seven laws hold across everything that consumes these values: no dead
 * frames, overlap rather than queue, continuous velocity, interruptible,
 * frame-rate independent, compositor only, and exits faster than entrances.
 * Each stagger below is at most 0.4 of the duration it staggers, which is what
 * "overlap rather than queue" means as a number.
 */

/* ---------------------------------------------------------------------------
   Easing
--------------------------------------------------------------------------- */

export type Bezier = readonly [number, number, number, number]

export const ease = {
  /** House curve. Default for entrances. */
  out: [0.32, 0.72, 0, 1],
  /** Fast start, long settle. Frames drawing, cover wipes, word rises. */
  outExpo: [0.16, 1, 0.3, 1],
  /** A to B on screen. */
  inOut: [0.65, 0, 0.35, 1],
  /** Exits only. */
  in: [0.5, 0, 0.75, 0],
  /** Corner handles popping in. The only curve allowed to overshoot. */
  back: [0.34, 1.56, 0.64, 1],
} as const satisfies Record<string, Bezier>

/**
 * Evaluate a CSS cubic-bezier at progress `t` (0 to 1). Newton iterations
 * with a bisection fallback, the same approach browsers use. Used by the
 * canvas, which has no CSS easing to lean on.
 */
export function bezier([x1, y1, x2, y2]: Bezier, t: number): number {
  if (t <= 0) return 0
  if (t >= 1) return 1
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by
  const sampleX = (u: number) => ((ax * u + bx) * u + cx) * u
  const slopeX = (u: number) => (3 * ax * u + 2 * bx) * u + cx

  let u = t
  for (let i = 0; i < 6; i++) {
    const x = sampleX(u) - t
    const d = slopeX(u)
    if (Math.abs(x) < 1e-5 || Math.abs(d) < 1e-6) break
    u -= x / d
  }
  if (u < 0 || u > 1 || Math.abs(sampleX(u) - t) > 1e-4) {
    let lo = 0
    let hi = 1
    u = t
    for (let i = 0; i < 24; i++) {
      const x = sampleX(u)
      if (Math.abs(x - t) < 1e-5) break
      if (x < t) lo = u
      else hi = u
      u = (lo + hi) / 2
    }
  }
  return ((ay * u + by) * u + cy) * u
}

/* ---------------------------------------------------------------------------
   Duration (seconds; the CSS twins are in milliseconds)
--------------------------------------------------------------------------- */

export const dur = {
  /** Hover colour, press. */
  d1: 0.12,
  /** Frame draw, tag, handle pop. */
  d2: 0.24,
  /** Cover wipe, word rise. */
  d3: 0.42,
  /** Large surfaces, [data-reveal]. */
  d4: 0.7,
  /** Giant word settle. */
  d5: 1.1,
} as const

/* ---------------------------------------------------------------------------
   Springs (Motion's useSpring options)
--------------------------------------------------------------------------- */

export const spring = {
  /** Soft follow. Every scroll-linked value passes through this one. */
  scroll: { stiffness: 90, damping: 26, restDelta: 0.0005 },
  /** Crisp, no overshoot. Indicators, the navbar hide. */
  ui: { stiffness: 420, damping: 34, mass: 1 },
  /** One small overshoot. Magnetic controls, card tilt. */
  magnet: { stiffness: 260, damping: 18, mass: 0.6 },
  /** Lazy. Scroll-velocity effects. */
  velocity: { stiffness: 90, damping: 22, mass: 1 },
} as const

/* ---------------------------------------------------------------------------
   Stagger (seconds)
--------------------------------------------------------------------------- */

export const stagger = {
  /** Between blocks. 0.06 <= 0.4 * dur.d3 */
  block: 0.06,
  /** Between words of a rising heading. 0.018 <= 0.4 * dur.d3 */
  word: 0.018,
  /** Before a page title's first word rises, seconds. */
  titleStart: 0.1,
  /** Before the giant outlined word's first letter rises, seconds. */
  markStart: 0.04,
} as const

/* ---------------------------------------------------------------------------
   Build engine: the cursor simulation
--------------------------------------------------------------------------- */

export const sim = {
  /** Fixed physics step, seconds. Frame-rate independence. */
  step: 1 / 120,
  /** Largest real dt a single frame may integrate. No leap after a tab switch. */
  maxFrame: 1 / 30,
  /**
   * Cursor travel is a minimum-jerk trajectory, re-planned on every new
   * target from the cursor's current position, velocity AND acceleration, so
   * nothing snaps: all three stay continuous through a retarget. (A critically
   * damped spring was tried and rejected: one stiff enough to settle in time
   * starts every move at ~580,000 px/s^2, a 900% one-frame speed jump, and no
   * stiffness fixes that, because a spring's jerk at onset is unbounded.) It is also the speed profile of a
   * human hand pointing at something, which is what these are imitating.
   *
   * Duration scales with distance so a short hop is quick and a long one is
   * not frantic: clamp(minT + d * perPx, minT, maxT). 600px takes 0.387s,
   * inside a 250 to 400ms settle window by construction.
   */
  travelMinT: 0.22,
  travelMaxT: 0.4,
  travelPerPx: 1 / 3600,
  /** Initial acceleration a replan may inherit, px/s^2. Bounds chained retargets. */
  travelMaxA0: 60000,
  /** Softer pull used while drifting: it should wander, not snap. */
  driftOmega: 3.2,
  /** Speed below which a cursor stops facing its velocity. px/s */
  headingMinSpeed: 20,
  /** Time constant for turning to face a new heading, seconds. */
  turnTau: 0.06,
  /** Angle a cursor rests at: up and to the left, like a system pointer. */
  restAngle: (-3 * Math.PI) / 4,
  /** Orbit: tangential speed, px/s, and ring radii, px. */
  orbitSpeed: 180,
  orbitRadius: [18, 60] as const,
  /** Orbit pull frequency, rad/s. Stiff, so the ring holds its shape. */
  orbitOmega: 18,
  /** Sideways launch impulse on scatter, as a fraction of distance per second. */
  scatterImpulse: [0.3, 0.6] as const,
  /** Exit acceleration, px/s^2. */
  exitAccel: 2600,
  /** Ambient drift: figure-eight speed, px/s, and the pointer flee radius, px. */
  driftSpeed: 20,
  fleeRadius: 120,
  fleeAccel: 2200,
  /** The site's content column (max-w-6xl), px. The gutter is what is left. */
  contentWidth: 1152,
  /** Margin outside the viewport at which an exiting cursor is retired. */
  exitMargin: 40,
} as const

/* ---------------------------------------------------------------------------
   Build engine: counts, budgets and thresholds
--------------------------------------------------------------------------- */

export const build = {
  /** Cursors in the boot flock: two per corner pair for ~16 boot blocks. */
  bootCursors: 32,
  /** Cursors that stay after the boot and drift. */
  ambient: 6,
  /** Ambient count under 640px or on a coarse pointer. */
  ambientSmall: 3,
  /**
   * Ambient cursors live in the right gutter, so they only exist when there
   * is one wide enough to hold them (px). Narrower, a build's cursor enters
   * from the nearest edge instead and leaves when it is done, so nothing ever
   * parks on top of content.
   */
  ambientMinGutter: 96,
  /**
   * At most this many frames animate at once. Every block on the site builds,
   * so a page header or a row of cards lands as a burst; the queue in the
   * engine staggers them, and this caps how many are live together.
   */
  maxConcurrentFrames: 14,
  /** At most this many cursors fly in from the edges at once. */
  maxTransient: 12,
  /** A free cursor further than this is not sent; one enters from an edge. */
  jobReach: 600,
  /**
   * Scroll velocity for the fling rule is displacement over at least this
   * window, ms. A per-frame derivative reads one 90px wheel notch as
   * ~9000px/s and would skip the frame for an ordinary scroll.
   */
  velocityWindowMs: 120,
  /** Scroll faster than this (px/s) and a block resolves with no frame. */
  flingVelocity: 2500,
  /** The loop stops after this long with nothing to do. seconds */
  idleAfter: 8,
  /** Canvas device-pixel-ratio cap. */
  dprCap: 2,
  /** Glyph length, px. */
  cursorSize: 11,
  /** The square the boot flock orbits, px. */
  seedSize: 10,
  /**
   * CSS failsafe, ms. Until the stage hydrates, covers remove themselves on a
   * timer: delay, then a fade. Twins: --failsafe-delay, --failsafe-boot-delay
   * and --failsafe-dur in globals.css.
   */
  failsafeDelayMs: 600,
  failsafeBootDelayMs: 2600,
  failsafeDurMs: 300,
} as const

/**
 * Section assembly on scroll (all routes). Times in seconds from the trigger.
 *
 *   trigger, frame grows and tag slides in, skeleton, cover wipes,
 *   frame fades, done
 *
 * The block does not wait for its cursor to arrive: the frame starts at
 * `frameAt` whether or not anyone is there yet, so nothing ever stalls.
 */
export const section = {
  frameAt: 0.08,
  skeletonAt: 0.14,
  resolveAt: 0.2,
  /** Frame fade starts this long after the wipe starts. */
  releaseDelay: 0.16,
  releaseDur: 0.16,
} as const

/**
 * The home-page boot (once per session). Times in seconds from start.
 * One block at a time, about 7s in all; any input fast-forwards it.
 */
export const boot = {
  orbitUntil: 0.6,
  /**
   * The boot clock is anchored back toward navigation start by however long
   * hydration took, up to (orbitUntil - minOrbit): the reader has already
   * been looking at the covers that long, so the orbit beat absorbs it rather
   * than the whole intro arriving late. The flock always gets at least this
   * much visible orbit, seconds.
   */
  minOrbit: 0.25,
  /** The first block's frame starts drawing, seconds. */
  framesFrom: 0.9,
  /**
   * The whole intro, seconds: the last block's wipe finishes here. The page
   * builds one block at a time, in real time, and is complete within 5 to 10
   * seconds: the blocks share the time between framesFrom and end, each
   * starting as the one before it is finishing.
   */
  end: 7,
  /** Bounds on the time between one block and the next, seconds. */
  perBlockMin: 0.25,
  perBlockMax: 0.6,
  /** From a block's frame starting to its cover starting to wipe, seconds. */
  resolveLag: 0.45,
  /**
   * A block's cursors leave the flock this long before its frame starts, so
   * they arrive at its corners as it begins to draw, seconds.
   */
  launchLead: 0.35,
  /** Fast-forward wipe, seconds. Exits are faster than entrances. Twin: --dur-ff. */
  fastForward: 0.1,
  /** Skeleton fades in this long after a boot frame starts drawing, seconds. */
  skeletonAfter: 0.2,
  /**
   * The hold. On a boot visit the inline script in app/layout.tsx marks
   * <html data-boot-hold> and the hero's covers do not time out while it is
   * set, so a slow first load (an uncached visit to the live site) still gets
   * the whole intro once its scripts arrive, instead of the failsafe
   * uncovering the hero just before the engine starts. Released this long
   * after the window load event, at once if a script fails to load, and
   * unconditionally at holdCapMs; then the ordinary failsafe runs. ms.
   */
  holdGraceMs: 1500,
  holdCapMs: 10000,
} as const

/* ---------------------------------------------------------------------------
   Scroll-linked and micro-interaction constants
--------------------------------------------------------------------------- */

export const scrollFx = {
  /** Giant hero word: share of its own height it lifts, and its end scale. */
  megaLift: 0.18,
  megaScale: 1.06,
  /** Marquee base drift and velocity ceiling, px/s. */
  marqueeBase: 20,
  marqueeMax: 400,
  /** How strongly scroll velocity (px/s) feeds the marquee. */
  marqueeGain: 0.25,
  /**
   * ParallaxMedia travel multiplier from 640px up (28px becomes 44px). The
   * CSS twin is --parallax-k in globals.css, switched by media query so the
   * component never branches on viewport width during render.
   */
  parallaxDesktop: 44 / 28,
} as const

export const micro = {
  /** Magnetic reach and pull, px. */
  magnetReach: 80,
  magnetPull: 6,
  /** Icon leans this much further than its control. */
  magnetIcon: 1.5,
  /** Card tilt, degrees, and image counter-shift, px. */
  tiltDeg: 2.5,
  tiltShift: 6,
  /** Metric count-up, seconds. */
  countUp: 0.7,
} as const
