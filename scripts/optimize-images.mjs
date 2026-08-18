/**
 * Pre-size and re-encode the project imagery.
 *
 * A static export cannot use next/image's optimiser (it is a server route), so
 * whatever sits in public/ is exactly what every visitor downloads. The source
 * screenshots are 2560-7170px wide PNGs going into cards that render at most
 * ~1024px — on a throttled mobile connection that alone cost ~20 Lighthouse
 * performance points. This does once, at authoring time, what the optimiser
 * would otherwise have done per request.
 *
 * Originals stay reproducible: they are re-downloadable from the pinned commit
 * SHAs recorded in .research/FINDINGS.md.
 *
 *   node scripts/optimize-images.mjs
 */
import sharp from "sharp"
import fs from "node:fs"
import path from "node:path"

const DIR = "public/projects"
// 1600px covers a 2x display at the widest the card ever renders (~800px).
const MAX_WIDTH = 1600

const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".png"))
if (files.length === 0) {
  console.error(`[optimize-images] no PNGs in ${DIR}`)
  process.exit(1)
}

let before = 0
let after = 0

for (const file of files) {
  const src = path.join(DIR, file)
  const dest = src.replace(/\.png$/, ".webp")

  const input = fs.readFileSync(src)
  const meta = await sharp(input).metadata()

  await sharp(input)
    .resize({ width: Math.min(meta.width, MAX_WIDTH), withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toFile(dest)

  const outSize = fs.statSync(dest).size
  before += input.length
  after += outSize

  fs.unlinkSync(src)

  const w = Math.min(meta.width, MAX_WIDTH)
  console.log(
    `${file.padEnd(30)} ${String(meta.width).padStart(5)}px ${(input.length / 1024).toFixed(0).padStart(5)}KB` +
      `  ->  ${String(w).padStart(5)}px ${(outSize / 1024).toFixed(0).padStart(5)}KB`
  )
}

const pct = (((before - after) / before) * 100).toFixed(1)
console.log(
  `\ntotal ${(before / 1024 / 1024).toFixed(2)}MB -> ${(after / 1024 / 1024).toFixed(2)}MB  (${pct}% smaller)`
)
