/**
 * The build engine: one fixed canvas, one rAF loop, every cursor and frame.
 *
 * Division of labour (the reason this works without hurting LCP or a11y):
 *   DOM     real content, server-rendered and opaque, plus one cover span
 *   CSS     the cover's states and the wipe, the failsafe, reduced motion
 *   canvas  everything transient: cursors, frames, handles, name tags
 *
 * This module schedules the states and draws the canvas. It writes
 * `data-build-state` onto <Build> roots through the registry and never
 * touches React. It is started by stage.tsx and is not imported anywhere else.
 *
 * Budget it keeps: no layout reads inside drawing (rects are read when a job
 * starts and on resize, in document space, and only `scrollY` is read per
 * frame); the loop stops after a few idle seconds; nothing runs at all under
 * reduced motion.
 */

import {
  boot as BOOT,
  build as B,
  dur,
  section as SEC,
  sim as S,
  stagger,
} from "@/lib/motion-config"
import { observeOnce } from "@/components/motion/reveal"
import { drawCursor, drawFrame, drawSeed, type Palette, type Rect } from "./draw"
import {
  attachEngine,
  bootEntries,
  setBuildState,
  rearmBoot,
  takeBootRequest,
  type BuildEntry,
} from "./registry"
import {
  createSim,
  drift,
  exit,
  settled,
  spawnAt,
  spawnFlock,
  step,
  travelTo,
  type Cursor,
  type Env,
} from "./sim"

export interface EngineHandle {
  /** Something happened (scroll, resize): make sure the loop is running. */
  wake(): void
  /**
   * Latest scroll position, from Motion's scroll value (already read once per
   * frame by Motion), so the engine never forces a layout to read it again.
   */
  setScroll(y: number): void
  destroy(): void
}

interface Job {
  id: number
  entry: BuildEntry
  /** Seconds, performance clock. */
  start: number
  rect: Rect
  framed: boolean
  cursor: Cursor | null
  transient: boolean
  released: boolean
  label: string
}

interface BootRun {
  start: number
  items: { entry: BuildEntry; rect: Rect }[]
  flock: Cursor[]
  /** Per flock cursor: has it left for its block yet. */
  launched: boolean[]
  /** Per block: have its cursors been let go yet. */
  released: boolean[]
  /** Seconds between one block and the next. */
  step: number
  settledCursors: boolean
  /** Fast-forward start, seconds, or null. */
  ff: number | null
}

const html = () => document.documentElement

function docRect(el: Element, scrollY: number): Rect {
  const r = el.getBoundingClientRect()
  return { x: r.left, y: r.top + scrollY, w: r.width, h: r.height }
}

function inViewport(el: Element): boolean {
  const r = el.getBoundingClientRect()
  return r.bottom > 0 && r.top < window.innerHeight && r.width > 0
}

/**
 * The name tag for a block. An explicit label wins; otherwise the block names
 * itself from its own heading, link or text: lowercase, letters and digits
 * only (so never a dash), at most three words.
 */
function labelFor(entry: BuildEntry): string {
  if (entry.label) return entry.label
  const el = entry.el
  const source =
    el.getAttribute("aria-label") ||
    el.querySelector("h1, h2, h3, h4, dt, label, a, button")?.textContent ||
    el.textContent ||
    ""
  return source
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 3)
    .join(" ")
}

/**
 * True when this block's cover has already started to go: the CSS failsafe
 * fired before the engine arrived. Content the reader can already see is
 * never covered again.
 */
function coverLifted(entry: BuildEntry): boolean {
  const cover = entry.el.querySelector(":scope > [data-build-cover]")
  if (!cover) return false
  const cs = getComputedStyle(cover)
  return cs.visibility === "hidden" || Number(cs.opacity) < 0.99
}

function lerpAngle(from: number, to: number, a: number) {
  return from + Math.atan2(Math.sin(to - from), Math.cos(to - from)) * a
}

export function startEngine(canvas: HTMLCanvasElement): EngineHandle {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  /* -----------------------------------------------------------------------
     Reduced motion: no canvas, no cursors, no states in between. Every
     build is simply done. CSS already hides the covers; this keeps the
     attribute honest for anything that reads it.
  ----------------------------------------------------------------------- */
  if (reduced) {
    const detach = attachEngine({
      add: (e) => setBuildState(e, "done"),
      remove: () => {},
      boot: () => {
        takeBootRequest()
        for (const e of bootEntries()) setBuildState(e, "done")
        html().setAttribute("data-boot", "done")
      },
    })
    html().setAttribute("data-build-ready", "")
    return {
      wake() {},
      setScroll() {},
      destroy() {
        detach()
        html().removeAttribute("data-build-ready")
      },
    }
  }

  const ctx = canvas.getContext("2d")
  if (!ctx) {
    // No 2D context: let the CSS failsafe do its job and stay out of the way.
    // No intro can play either, so release it (and the hold on its covers)
    // rather than leave the hero waiting on a boot that will never run.
    if (html().getAttribute("data-boot") === "play") {
      html().setAttribute("data-boot", "skip")
    }
    html().removeAttribute("data-boot-hold")
    return { wake() {}, setScroll() {}, destroy() {} }
  }
  const g = ctx

  const coarse = window.matchMedia("(pointer: coarse)").matches
  const sim = createSim(7)
  const env: Env = {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollY: window.scrollY,
    pointerX: NaN,
    pointerY: NaN,
    centreX: window.innerWidth / 2,
    centreY: window.innerHeight / 2,
    slots: 1,
  }

  let pal: Palette = readPalette()
  /** Recent (time, scrollY) samples for the windowed fling velocity. */
  const samples: { t: number; y: number }[] = []
  /** A boot was requested before any hero block had registered. */
  let bootWaiting = false
  let running = false
  let raf = 0
  let last = 0
  let acc = 0
  let lastActivity = performance.now()
  let destroyed = false
  let ready = false
  let nextJob = 1
  const jobs = new Map<number, Job>()
  const unobserve = new Map<BuildEntry, () => void>()
  /** Document height, refreshed on resize (the ResizeObserver on <html>). */
  let docHeight = document.documentElement.scrollHeight
  let bottomQueued = false
  let bootRun: BootRun | null = null
  let ambientSpawned = false

  function ambientCount() {
    if ((env.width - S.contentWidth) / 2 < B.ambientMinGutter) return 0
    return env.width < 640 || coarse ? B.ambientSmall : B.ambient
  }

  function sampleScroll(y: number) {
    const t = performance.now()
    samples.push({ t, y })
    while (samples.length > 2 && t - samples[1].t > B.velocityWindowMs) {
      samples.shift()
    }
  }

  /** Displacement over at least velocityWindowMs, px/s. */
  function scrollVelocity(): number {
    if (samples.length < 2) return 0
    const last = samples[samples.length - 1]
    // Nothing recent: not scrolling. Without this a single old jump (a route
    // change resetting scroll to 0) would read as a fling indefinitely.
    if (performance.now() - last.t > B.velocityWindowMs) return 0
    const ref = samples[0]
    const dt = Math.max(last.t - ref.t, B.velocityWindowMs)
    return ((last.y - ref.y) / dt) * 1000
  }

  function readPalette(): Palette {
    const cs = getComputedStyle(html())
    const v = (name: string, fallback: string) =>
      cs.getPropertyValue(name).trim() || fallback
    const mono = v("--font-geist-mono", "")
    return {
      fg: v("--foreground", "#222"),
      bg: v("--background", "#fff"),
      build: v("--build", "#0a7db0"),
      buildFg: v("--build-foreground", "#fff"),
      font: mono ? `${mono}, ui-monospace, monospace` : "ui-monospace, monospace",
    }
  }

  let backing = { w: 0, h: 0, dpr: 0 }

  /**
   * Called on window resize and whenever the document's box changes. Only a
   * real viewport or DPR change touches the canvas backing store (assigning
   * canvas.width clears and reallocates it); a taller document (an image
   * loading, a tab opening) only refreshes the rects of builds in flight, and
   * a cursor is re-planned only if its target actually moved. Returns whether
   * anything visible changed, so a mere height change never wakes the loop.
   */
  function resize(): boolean {
    docHeight = document.documentElement.scrollHeight
    env.width = window.innerWidth
    env.height = window.innerHeight
    env.centreX = env.width / 2
    env.centreY = env.height / 2
    const dpr = Math.min(window.devicePixelRatio || 1, B.dprCap)
    let changed = false
    if (
      backing.w !== env.width ||
      backing.h !== env.height ||
      backing.dpr !== dpr
    ) {
      backing = { w: env.width, h: env.height, dpr }
      canvas.width = Math.round(env.width * dpr)
      canvas.height = Math.round(env.height * dpr)
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      changed = true
    }

    // Keep frames attached to their elements through a reflow.
    const y = window.scrollY
    for (const job of jobs.values()) {
      const r = docRect(job.entry.el, y)
      const moved =
        Math.abs(r.x - job.rect.x) > 0.5 || Math.abs(r.y - job.rect.y) > 0.5
      if (moved || r.w !== job.rect.w || r.h !== job.rect.h) changed = true
      job.rect = r
      if (moved && job.cursor && !job.released) {
        travelTo(sim, job.cursor, r.x, r.y, env)
      }
    }
    if (bootRun) {
      for (const item of bootRun.items) item.rect = docRect(item.entry.el, y)
      changed = true
    }
    return changed
  }

  /* -----------------------------------------------------------------------
     Ambient cursors: the few that stay and take section jobs.
  ----------------------------------------------------------------------- */

  function assignSlots() {
    const ambient = sim.cursors.filter((c) => c.ambient && c.mode !== "exit")
    env.slots = Math.max(1, ambient.length)
    ambient.forEach((c, i) => {
      c.slot = i
    })
  }

  function spawnAmbient() {
    if (ambientSpawned) return
    ambientSpawned = true
    const n = ambientCount()
    for (let i = 0; i < n; i++) {
      // Enter from just past the right edge and drift into the gutter.
      const c = spawnAt(
        sim,
        env.width + 16 + i * 6,
        env.height * (0.22 + (0.6 * i) / Math.max(1, n - 1)),
        true
      )
      c.phase = i * 1.7
      drift(c, i)
    }
    assignSlots()
  }

  /* -----------------------------------------------------------------------
     Section jobs (all routes): frame, skeleton, wipe, release.
  ----------------------------------------------------------------------- */

  function framedCount() {
    let n = 0
    for (const j of jobs.values()) if (j.framed && !j.released) n++
    return n
  }

  function pickCursor(target: { x: number; y: number }): {
    cursor: Cursor | null
    transient: boolean
  } {
    const vx = target.x
    const vy = target.y - env.scrollY
    let best: Cursor | null = null
    let bestD: number = B.jobReach
    for (const c of sim.cursors) {
      if (!c.ambient || c.job !== null || c.mode !== "drift") continue
      const d = Math.hypot(c.x - vx, c.y - vy)
      if (d < bestD) {
        best = c
        bestD = d
      }
    }
    if (best) return { cursor: best, transient: false }

    // Enough cursors already in the air: the frame still draws, just
    // without one of its own arriving.
    let flying = 0
    for (const c of sim.cursors) if (!c.ambient && c.mode !== "exit") flying++
    if (flying >= B.maxTransient) return { cursor: null, transient: false }

    // Nobody near: one enters from the nearest viewport edge.
    const edges = [
      { d: vx, x: -14, y: vy },
      { d: env.width - vx, x: env.width + 14, y: vy },
      { d: vy, x: vx, y: -14 },
      { d: env.height - vy, x: vx, y: env.height + 14 },
    ].sort((a, b) => a.d - b.d)
    const e = edges[0]
    return { cursor: spawnAt(sim, e.x, e.y, false), transient: true }
  }

  /*
   * Blocks arriving together (a page header, a row of cards, the navbar on
   * load) are collected for the rest of the task, ordered by where they sit
   * (top to bottom, then left to right), and started a block-stagger apart.
   * Reading order is build order, and a burst becomes a cascade.
   */
  const queue: BuildEntry[] = []
  let flushQueued = false
  let nextSlot = 0

  /*
   * The shared observer fires once a block is above the bottom tenth of the
   * viewport. The last lines of a page (the footer's) can never get that
   * high, and a short page never scrolls at all, so at the very bottom every
   * block still waiting that is on screen builds now.
   */
  function flushAtBottom() {
    if (destroyed) return
    if (window.scrollY + window.innerHeight < docHeight - 2) return
    for (const [entry, off] of unobserve) {
      if (!inViewport(entry.el)) continue
      off()
      unobserve.delete(entry)
      trigger(entry)
    }
  }

  /** Build this block the first time it is seen. */
  function observe(entry: BuildEntry) {
    unobserve.set(
      entry,
      observeOnce(entry.el, () => {
        unobserve.delete(entry)
        trigger(entry)
      })
    )
  }

  function trigger(entry: BuildEntry) {
    if (entry.state === "done") return
    queue.push(entry)
    if (flushQueued) return
    flushQueued = true
    queueMicrotask(flush)
  }

  function flush() {
    flushQueued = false
    if (destroyed) return
    const y = window.scrollY
    const batch = queue
      .splice(0)
      .filter((e) => e.state !== "done")
      .map((entry) => ({ entry, rect: docRect(entry.el, y) }))
      .sort((a, b) => a.rect.y - b.rect.y || a.rect.x - b.rect.x)
    const now = performance.now() / 1000
    const fling = Math.abs(scrollVelocity()) > B.flingVelocity
    for (const { entry, rect } of batch) {
      const start = Math.max(now, nextSlot)
      nextSlot = start + stagger.block
      startJob(entry, rect, start, fling)
    }
    wake()
  }

  function startJob(entry: BuildEntry, rect: Rect, start: number, fling: boolean) {
    const framed = !fling && framedCount() < B.maxConcurrentFrames
    const job: Job = {
      id: nextJob++,
      entry,
      start,
      rect,
      framed,
      cursor: null,
      transient: false,
      released: !framed,
      label: labelFor(entry),
    }
    if (framed) {
      const { cursor, transient } = pickCursor(rect)
      if (cursor) {
        cursor.job = job.id
        travelTo(sim, cursor, rect.x, rect.y, env)
        job.cursor = cursor
        job.transient = transient
      }
    }
    jobs.set(job.id, job)
  }

  function release(job: Job) {
    if (job.released) return
    job.released = true
    if (!job.cursor) return
    if (job.transient) exit(job.cursor)
    else drift(job.cursor, job.cursor.slot)
  }

  function updateJobs(now: number) {
    for (const job of jobs.values()) {
      const t = now - job.start
      const e = job.entry
      if (!job.framed) {
        // Flung past, or too many frames live: wipe straight off, no frame.
        if (t >= 0) setBuildState(e, "resolve")
        if (t >= dur.d3) {
          setBuildState(e, "done")
          jobs.delete(job.id)
        }
        continue
      }
      if (t >= SEC.frameAt) setBuildState(e, "frame")
      if (t >= SEC.skeletonAt) setBuildState(e, "skeleton")
      if (t >= SEC.resolveAt) setBuildState(e, "resolve")
      if (t >= SEC.resolveAt + SEC.releaseDelay) release(job)
      if (t >= SEC.resolveAt + dur.d3) {
        setBuildState(e, "done")
        jobs.delete(job.id)
      }
    }
  }

  function drawJobs(now: number) {
    for (const job of jobs.values()) {
      if (!job.framed) continue
      const t = now - job.start
      const fadeFrom = SEC.resolveAt + SEC.releaseDelay
      const alpha =
        t < fadeFrom ? 1 : Math.max(0, 1 - (t - fadeFrom) / SEC.releaseDur)
      const r = job.rect
      drawFrame(
        g,
        { x: r.x, y: r.y - env.scrollY, w: r.w, h: r.h },
        t - SEC.frameAt,
        dur.d2,
        alpha,
        job.label,
        pal
      )
    }
  }

  /* -----------------------------------------------------------------------
     The boot (home, first view this session).
  ----------------------------------------------------------------------- */

  const skipEvents = ["keydown", "pointerdown", "wheel", "touchstart"] as const

  function onSkip() {
    if (!bootRun || bootRun.ff !== null) return
    bootRun.ff = performance.now() / 1000
    html().setAttribute("data-build-fast", "")
    for (const item of bootRun.items) setBuildState(item.entry, "resolve")
    keepFlock()
    wake()
  }

  function addSkipListeners() {
    // Passive and capturing: they observe the input and never consume it, so
    // the wheel or Tab that skips the boot also scrolls or moves focus.
    for (const t of skipEvents)
      window.addEventListener(t, onSkip, { passive: true, capture: true })
  }
  function removeSkipListeners() {
    for (const t of skipEvents)
      window.removeEventListener(t, onSkip, { capture: true })
  }

  function finishBoot() {
    if (!bootRun) return
    for (const item of bootRun.items) setBuildState(item.entry, "done")
    keepFlock()
    bootRun = null
    html().removeAttribute("data-build-fast")
    html().setAttribute("data-boot", "done")
    removeSkipListeners()
    // Boot blocks that sat the boot out (hidden at this width) now build like
    // any other block whenever they are first seen.
    for (const e of bootEntries()) {
      if (e.state !== "done" && !unobserve.has(e)) observe(e)
    }
  }

  /**
   * A cursor's work is done: it stays on as an ambient cursor while the
   * gutter has room for one, and otherwise flies off the nearest edge.
   */
  function retire(c: Cursor) {
    if (c.ambient || c.mode === "exit" || c.mode === "gone") return
    const ambient = sim.cursors.filter((a) => a.ambient && a.mode === "drift")
    if (ambient.length < ambientCount()) {
      c.ambient = true
      drift(c, ambient.length)
      ambientSpawned = true
      assignSlots()
    } else {
      exit(c)
    }
  }

  /** The end (or a skip): every cursor still on a job is retired. */
  function keepFlock() {
    if (!bootRun || bootRun.settledCursors) return
    bootRun.settledCursors = true
    for (const c of bootRun.flock) retire(c)
    ambientSpawned = true
  }

  /** When block k of the boot frames, skeletons, wipes and lets go. */
  function bootTimes(run: BootRun, k: number) {
    const frameAt = BOOT.framesFrom + k * run.step
    const resolveAt = frameAt + BOOT.resolveLag
    return {
      launchAt: frameAt - BOOT.launchLead,
      frameAt,
      skeletonAt: frameAt + BOOT.skeletonAfter,
      resolveAt,
      releaseAt: resolveAt + SEC.releaseDelay,
      doneAt: resolveAt + dur.d3,
    }
  }

  function runBoot() {
    if (bootRun) {
      takeBootRequest()
      return
    }
    const items = bootEntries()
    if (items.length === 0) {
      // Selective hydration can bring the hero in after the stage: the
      // request arrives before its blocks have registered. Keep it pending
      // and run when the first boot block arrives (see add below).
      bootWaiting = true
      return
    }
    if (!takeBootRequest()) return
    // Outside "play" these blocks build like any other (see add below).
    if (html().getAttribute("data-boot") !== "play") return
    // The failsafe already lifted the hero's covers (scripts arrived after the
    // hold ran out): never re-cover content the reader can already see.
    if (items.some((e) => e.el.getClientRects().length > 0 && coverLifted(e))) {
      for (const e of items) setBuildState(e, "done")
      html().setAttribute("data-boot", "done")
      spawnAmbient()
      return
    }
    try {
      sessionStorage.setItem("boot-seen", "1")
    } catch {
      /* storage blocked: the boot simply plays again next session */
    }

    // Anyone already on stage makes way for the flock.
    for (const c of sim.cursors) exit(c)

    const y = window.scrollY
    // Only blocks rendered at this width: a hidden one (the mobile menu
    // button on a desktop) has a zero box at the page origin, and would spend
    // a turn sending cursors to the top-left corner for nothing. It is handed
    // to the normal observer when the boot ends (see finishBoot).
    const shown = items.filter(
      (entry) => entry.state !== "done" && entry.el.getClientRects().length > 0
    )
    bootRun = {
      // Hydration lag is absorbed by the orbit beat (see boot.minOrbit).
      start:
        performance.now() / 1000 -
        Math.min(performance.now() / 1000, BOOT.orbitUntil - BOOT.minOrbit),
      items: shown.map((entry) => ({ entry, rect: docRect(entry.el, y) })),
      flock: spawnFlock(sim, B.bootCursors, env.centreX, env.centreY),
      launched: new Array(B.bootCursors).fill(false),
      released: new Array(shown.length).fill(false),
      // One block after another: the last block's wipe ends on boot.end, so
      // the blocks share the time between, within sensible bounds.
      step:
        shown.length > 1
          ? Math.min(
              BOOT.perBlockMax,
              Math.max(
                BOOT.perBlockMin,
                (BOOT.end - BOOT.framesFrom - BOOT.resolveLag - dur.d3) /
                  (shown.length - 1)
              )
            )
          : 0,
      settledCursors: false,
      ff: null,
    }
    addSkipListeners()
    wake()
  }

  function updateBoot(now: number) {
    const run = bootRun
    if (!run) return
    const t = now - run.start

    if (run.ff !== null) {
      if (now - run.ff >= BOOT.fastForward) finishBoot()
      return
    }

    const n = run.items.length

    // Dispatch: cursor i belongs to block i % n, one corner each. It stays in
    // the orbit until just before its block, then peels off for it, so the
    // flock thins out as the page fills in, one block at a time.
    run.flock.forEach((c, i) => {
      if (run.launched[i] || n === 0) return
      const k = i % n
      if (t < bootTimes(run, k).launchAt) return
      run.launched[i] = true
      const r = run.items[k].rect
      const corner = Math.floor(i / n) % 4
      const x = corner % 2 === 0 ? r.x : r.x + r.w
      const yy = corner < 2 ? r.y : r.y + r.h
      travelTo(sim, c, x, yy, env, true)
    })

    run.items.forEach((item, k) => {
      const tk = bootTimes(run, k)
      if (t >= tk.frameAt) setBuildState(item.entry, "frame")
      if (t >= tk.skeletonAt) setBuildState(item.entry, "skeleton")
      if (t >= tk.resolveAt) setBuildState(item.entry, "resolve")
      if (t >= tk.doneAt) setBuildState(item.entry, "done")
      if (!run.released[k] && t >= tk.releaseAt) {
        // This block is built: its cursors move on.
        run.released[k] = true
        run.flock.forEach((c, i) => {
          if (i % n === k && run.launched[i]) retire(c)
        })
      }
    })

    if (run.items.every((i) => i.entry.state === "done")) finishBoot()
  }

  function drawBoot(now: number) {
    const run = bootRun
    if (!run) return
    const t = now - run.start
    const ffAlpha =
      run.ff === null ? 1 : Math.max(0, 1 - (now - run.ff) / BOOT.fastForward)

    // The seed square the flock orbits, shrinking as cursors leave it.
    if (run.ff === null) {
      const left = run.launched.filter((l) => !l).length
      drawSeed(
        g,
        env.centreX,
        env.centreY,
        (B.seedSize * left) / Math.max(1, run.launched.length),
        pal
      )
    }

    run.items.forEach((item, k) => {
      const tk = bootTimes(run, k)
      const alpha =
        ffAlpha *
        (t < tk.releaseAt
          ? 1
          : Math.max(0, 1 - (t - tk.releaseAt) / SEC.releaseDur))
      const r = item.rect
      drawFrame(
        g,
        { x: r.x, y: r.y - env.scrollY, w: r.w, h: r.h },
        t - tk.frameAt,
        dur.d2,
        alpha,
        labelFor(item.entry),
        pal
      )
    })
  }

  /* -----------------------------------------------------------------------
     The loop. Fixed physics step, interpolated drawing.
  ----------------------------------------------------------------------- */

  function frame(ms: number) {
    raf = 0
    if (destroyed) return
    const now = ms / 1000
    const dt = Math.min(Math.max(0, now - last), S.maxFrame)
    last = now

    // Read once per frame, live. Motion's value can trail by a frame, and a
    // frame drawn a scroll-step off its element jitters during a fast scroll.
    env.scrollY = window.scrollY
    acc += dt
    while (acc >= S.step) {
      step(sim, S.step, env)
      acc -= S.step
    }

    updateBoot(now)
    updateJobs(now)

    g.clearRect(0, 0, env.width, env.height)
    drawBoot(now)
    drawJobs(now)
    const a = acc / S.step
    for (const c of sim.cursors) {
      drawCursor(
        g,
        c.px + (c.x - c.px) * a,
        c.py + (c.y - c.py) * a,
        lerpAngle(c.pangle, c.angle, a),
        B.cursorSize,
        pal
      )
    }

    const idle =
      jobs.size === 0 &&
      !bootRun &&
      settled(sim) &&
      performance.now() - lastActivity > B.idleAfter * 1000
    if (idle) {
      running = false
      return
    }
    raf = requestAnimationFrame(frame)
  }

  function wake() {
    lastActivity = performance.now()
    if (running || destroyed) return
    running = true
    last = performance.now() / 1000
    acc = 0
    raf = requestAnimationFrame(frame)
  }

  /** Jump every pending animation to its end state. */
  function completeAll() {
    for (const job of jobs.values()) {
      setBuildState(job.entry, "done")
      release(job)
    }
    jobs.clear()
    finishBoot()
  }

  /* -----------------------------------------------------------------------
     Wiring.
  ----------------------------------------------------------------------- */

  const onPointer = (e: PointerEvent) => {
    env.pointerX = e.clientX
    env.pointerY = e.clientY
    wake()
  }
  const onPointerOut = (e: PointerEvent) => {
    if (!e.relatedTarget) {
      env.pointerX = NaN
      env.pointerY = NaN
    }
  }
  const onVisibility = () => {
    // A tab hidden mid-build comes back finished rather than mid-motion.
    if (document.visibilityState === "visible") {
      completeAll()
      wake()
    }
  }
  let resizeQueued = false
  const onResize = () => {
    if (resizeQueued) return
    resizeQueued = true
    requestAnimationFrame(() => {
      resizeQueued = false
      if (destroyed) return
      if (resize()) wake()
      flushAtBottom()
    })
  }
  const ro = new ResizeObserver(onResize)
  const themeWatch = new MutationObserver(() => {
    pal = readPalette()
    wake()
  })

  resize()
  window.addEventListener("pointermove", onPointer, { passive: true })
  document.addEventListener("pointerout", onPointerOut, { passive: true })
  document.addEventListener("visibilitychange", onVisibility)
  window.addEventListener("resize", onResize, { passive: true })
  ro.observe(html())
  themeWatch.observe(html(), { attributes: true, attributeFilter: ["class"] })

  const detach = attachEngine({
    add(entry) {
      if (entry.state === "done") return
      // Boot blocks belong to the boot while it plays. On every other view
      // (another route, a repeat visit) they build like everything else.
      if (entry.boot && html().getAttribute("data-boot") === "play") {
        if (bootWaiting) {
          // The rest of the hero registers in this same commit: start on the
          // next frame, once all of it is here.
          bootWaiting = false
          requestAnimationFrame(() => {
            if (!destroyed) runBoot()
          })
        } else if (bootRun && !bootRun.items.some((i) => i.entry === entry)) {
          // Hydrated in a later commit than the rest of the hero: join the
          // running boot in its order rather than sit covered until it ends.
          // Appended, not re-sorted: the per-block bookkeeping is by index.
          bootRun.items.push({ entry, rect: docRect(entry.el, window.scrollY) })
          bootRun.released.push(false)
        }
        return
      }
      // Present at first hydration, already on screen, and its cover already
      // lifted by the failsafe: leave it uncovered rather than cover content
      // the reader can already see.
      if (!ready && inViewport(entry.el) && coverLifted(entry)) {
        setBuildState(entry, "done")
        return
      }
      observe(entry)
      // A block that lands within the bottom tenth of a page that cannot
      // scroll further (a short page reached by client-side navigation) is
      // caught by the page-bottom check once layout has settled.
      if (!bottomQueued) {
        bottomQueued = true
        requestAnimationFrame(() => {
          bottomQueued = false
          flushAtBottom()
        })
      }
    },
    remove(entry) {
      unobserve.get(entry)?.()
      unobserve.delete(entry)
      // A hero block that unmounts mid-intro leaves the intro.
      if (bootRun) {
        const k = bootRun.items.findIndex((i) => i.entry === entry)
        if (k >= 0) {
          bootRun.items.splice(k, 1)
          bootRun.released.splice(k, 1)
        }
      }
      for (const job of jobs.values()) {
        if (job.entry !== entry) continue
        release(job)
        jobs.delete(job.id)
      }
    },
    boot: runBoot,
  })

  /*
   * Watchdog. The hold is released by boot.holdCapMs at the latest, so "play"
   * with no boot running well after that means something went wrong (a hero
   * that never registered, an exception). Finish it rather than leave covers
   * up with the CSS failsafe already switched off.
   */
  const watchdog = window.setTimeout(
    () => {
      if (destroyed || bootRun) return
      if (html().getAttribute("data-boot") !== "play") return
      for (const e of bootEntries()) setBuildState(e, "done")
      html().setAttribute("data-boot", "done")
      spawnAmbient()
      wake()
    },
    Math.max(0, BOOT.holdCapMs + BOOT.end * 1000 - performance.now())
  )

  // Same task as the replay above: no paint in between, so no flash.
  ready = true
  /*
   * Started after the reveal failsafe fired: content it showed must not blink
   * out now that the failsafe stops matching. Reveals stay static for this
   * page view (see data-failsafe-fired in globals.css).
   */
  if (performance.now() > B.failsafeBootDelayMs) {
    html().setAttribute("data-failsafe-fired", "")
  }
  html().setAttribute("data-build-ready", "")
  if (!bootRun) spawnAmbient()
  flushAtBottom()
  wake()

  return {
    wake,
    setScroll(y) {
      sampleScroll(y)
      if (y + env.height >= docHeight - 2) flushAtBottom()
    },
    destroy() {
      window.clearTimeout(watchdog)
      /*
       * Cancel, do not complete. The stage only unmounts in development
       * (React mounts effects twice there) or on hot reload; completing here
       * marked the hero done and the next engine then rebuilt it over visible
       * text. A running boot is re-armed for the next engine instead, and the
       * blocks reset to pending as they re-register.
       */
      jobs.clear()
      if (bootRun) {
        bootRun = null
        rearmBoot()
        html().removeAttribute("data-build-fast")
      }
      destroyed = true
      if (raf) cancelAnimationFrame(raf)
      detach()
      for (const off of unobserve.values()) off()
      unobserve.clear()
      removeSkipListeners()
      window.removeEventListener("pointermove", onPointer)
      document.removeEventListener("pointerout", onPointerOut)
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("resize", onResize)
      ro.disconnect()
      themeWatch.disconnect()
      html().removeAttribute("data-build-ready")
    },
  }
}
