import fs from "node:fs"
import path from "node:path"

const OUT = "out"

if (!fs.existsSync(OUT)) {
  console.error(`[prepare-pages] ${OUT}/ not found — run \`next build\` first.`)
  process.exit(1)
}

/**
 * Without this file GitHub Pages runs the output through Jekyll, and Jekyll
 * silently drops every directory whose name starts with an underscore. Next
 * puts all its JS and CSS in `_next/`, so the site deploys "successfully" and
 * then renders as unstyled HTML with no interactivity. This one empty file is
 * the whole fix, and its absence is the single most common Pages failure.
 */
fs.writeFileSync(path.join(OUT, ".nojekyll"), "")
console.log("[prepare-pages] wrote out/.nojekyll")

// Sanity: the export is useless if the asset directory did not survive.
const nextDir = path.join(OUT, "_next")
if (!fs.existsSync(nextDir)) {
  console.error("[prepare-pages] out/_next is missing — the export is broken.")
  process.exit(1)
}

const index = path.join(OUT, "index.html")
if (!fs.existsSync(index)) {
  console.error("[prepare-pages] out/index.html is missing — nothing to serve.")
  process.exit(1)
}

// Assets must be requested under the repo path, or every one of them 404s.
const html = fs.readFileSync(index, "utf8")
const expected = "/website-2.0/_next/"
if (!html.includes(expected)) {
  console.error(
    `[prepare-pages] index.html does not reference ${expected} — basePath did ` +
      `not apply. Check next.config.ts; deploying this would 404 every asset.`
  )
  process.exit(1)
}

console.log("[prepare-pages] basePath verified, output ready to publish")
