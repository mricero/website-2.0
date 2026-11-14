/**
 * Canvas drawing for the build effect. Pure functions over a 2D context:
 * no React, no state, no layout reads. Everything here is transient chrome
 * (cursors, selection frames, handles, name tags) that lives only on the
 * canvas, which is also why none of it reaches assistive technology.
 */

import { bezier, ease } from "../../../lib/motion-config"

export interface Palette {
  fg: string
  bg: string
  build: string
  buildFg: string
  font: string
}

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

let glyph: Path2D | null = null
let glyphSize = 0

/**
 * A small dart, tip at the origin, pointing along +x. Rotated to face the
 * cursor's heading; at rest that is up and to the left, like a system pointer.
 */
function cursorGlyph(size: number): Path2D {
  if (glyph && glyphSize === size) return glyph
  const p = new Path2D()
  p.moveTo(0, 0)
  p.lineTo(-size, -size * 0.5)
  p.lineTo(-size * 0.62, 0)
  p.lineTo(-size, size * 0.5)
  p.closePath()
  glyph = p
  glyphSize = size
  return p
}

export function drawCursor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  size: number,
  pal: Palette
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  const g = cursorGlyph(size)
  ctx.lineWidth = 1
  ctx.lineJoin = "round"
  ctx.strokeStyle = pal.bg
  ctx.stroke(g)
  ctx.fillStyle = pal.fg
  ctx.fill(g)
  ctx.restore()
}

/** The small square the boot flock orbits. */
export function drawSeed(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  pal: Palette
) {
  if (size <= 0.2) return
  ctx.save()
  ctx.globalAlpha = 0.9
  ctx.fillStyle = pal.build
  ctx.fillRect(x - size / 2, y - size / 2, size, size)
  ctx.restore()
}

const HANDLE = 5

/**
 * A design-tool selection frame growing from its top-left corner.
 *
 * `t` is seconds since the frame started. It grows over `growDur` on the
 * expo curve, its corner handles pop on the one overshooting curve, and its
 * name tag slides 6px in from the left. `alpha` fades the whole thing.
 */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  r: Rect,
  t: number,
  growDur: number,
  alpha: number,
  label: string,
  pal: Palette
) {
  if (alpha <= 0 || t <= 0) return
  const p = Math.min(1, t / growDur)
  const g = bezier(ease.outExpo, p)
  const w = r.w * g
  const h = r.h * g
  const x = Math.round(r.x) + 0.5
  const y = Math.round(r.y) + 0.5

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.strokeStyle = pal.build
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, w, h)

  // Handles: four corners, popping once on the only overshooting curve.
  const s = HANDLE * bezier(ease.back, p)
  if (s > 0.5) {
    const corners = [
      [x, y],
      [x + w, y],
      [x, y + h],
      [x + w, y + h],
    ]
    for (const [cx, cy] of corners) {
      ctx.fillStyle = pal.bg
      ctx.fillRect(cx - s / 2, cy - s / 2, s, s)
      ctx.strokeRect(cx - s / 2, cy - s / 2, s, s)
    }
  }

  // Name tag on the top edge, sliding 6px in from the left.
  if (label) {
    const tp = bezier(ease.out, p)
    ctx.globalAlpha = alpha * tp
    ctx.font = `500 10px ${pal.font}`
    const tw = Math.ceil(ctx.measureText(label).width) + 10
    const tx = x - 6 * (1 - tp)
    const ty = y - 19
    ctx.fillStyle = pal.build
    ctx.beginPath()
    ctx.roundRect(tx, ty, tw, 15, 2)
    ctx.fill()
    ctx.fillStyle = pal.buildFg
    ctx.textBaseline = "middle"
    ctx.fillText(label, tx + 5, ty + 8)
  }
  ctx.restore()
}
