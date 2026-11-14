/**
 * The meeting point between <Build> elements and the stage engine.
 *
 * Module-level rather than React context on purpose: nothing about a build
 * should ever re-render a component. A <Build> registers its element here in
 * an effect; the engine, whenever it attaches, is told about every entry that
 * already exists and every one that arrives later. Either side can mount
 * first.
 *
 * State lives on the DOM as `data-build-state`, written straight to the
 * attribute. CSS reacts to it; React never sees it.
 */

export type BuildState = "pending" | "frame" | "skeleton" | "resolve" | "done"

export interface BuildEntry {
  el: HTMLElement
  label: string
  /** Part of the home-page boot rather than a scroll-triggered section. */
  boot: boolean
  /** Order within the boot. */
  order: number
  state: BuildState
}

export interface BuildListener {
  add(entry: BuildEntry): void
  remove(entry: BuildEntry): void
  boot(): void
}

const entries = new Set<BuildEntry>()
let listener: BuildListener | null = null
let bootRequested = false

export function registerBuild(
  el: HTMLElement,
  opts: { label: string; boot?: boolean; order?: number }
): () => void {
  const entry: BuildEntry = {
    el,
    label: opts.label,
    boot: Boolean(opts.boot),
    order: opts.order ?? 0,
    state: "pending",
  }
  // The DOM must agree with the entry. A block already built stays built (the
  // one-shot contract survives a re-registration of the same node); any
  // half-finished state from an earlier registration (React's development
  // double-mount) is cleared so the block builds again from the start.
  if (el.getAttribute("data-build-state") === "done") entry.state = "done"
  else el.removeAttribute("data-build-state")
  entries.add(entry)
  listener?.add(entry)
  return () => {
    entries.delete(entry)
    listener?.remove(entry)
  }
}

const rank: Record<BuildState, number> = {
  pending: 0,
  frame: 1,
  skeleton: 2,
  resolve: 3,
  done: 4,
}

/**
 * Write a state. States only ever advance (and `done` is terminal): the
 * one-shot contract. Callers may simply assert every state whose time has
 * come, every frame, and only a real step forward touches the DOM.
 */
export function setBuildState(entry: BuildEntry, state: BuildState) {
  if (rank[state] <= rank[entry.state]) return
  entry.state = state
  entry.el.setAttribute("data-build-state", state)
}

export function bootEntries(): BuildEntry[] {
  return [...entries].filter((e) => e.boot).sort((a, b) => a.order - b.order)
}

/** Called by the home-page <Boot> once its hero is mounted. */
export function requestBoot() {
  bootRequested = true
  listener?.boot()
}

/**
 * An engine was torn down mid-boot (React's development double-mount): the
 * next engine to attach plays the boot again from the start.
 */
export function rearmBoot() {
  bootRequested = true
}

/** The engine took the boot request. */
export function takeBootRequest(): boolean {
  const was = bootRequested
  bootRequested = false
  return was
}

/** Called by the engine when it is ready. Replays everything it missed. */
export function attachEngine(l: BuildListener): () => void {
  listener = l
  for (const e of entries) l.add(e)
  if (bootRequested) l.boot()
  return () => {
    if (listener === l) listener = null
  }
}
