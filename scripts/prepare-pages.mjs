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
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const expected = `${basePath}/_next/`
if (!html.includes(`"${expected}`)) {
  console.error(
    `[prepare-pages] index.html does not reference ${expected} — basePath did ` +
      `not apply. Check next.config.ts; deploying this would 404 every asset.`
  )
  process.exit(1)
}

console.log("[prepare-pages] basePath verified")

// Keep the custom domain: gh-pages replaces the whole branch, so a CNAME that
// is not in out/ gets deleted and Pages falls back to mricero.github.io.
if (!fs.existsSync(path.join(OUT, "CNAME"))) {
  console.error("[prepare-pages] out/CNAME is missing — deploying would drop the custom domain.")
  process.exit(1)
}

/* ---------------------------------------------------------------------------
 * RSC prefetch payload aliases.
 *
 * `next build` writes the segment-cache payloads as nested directories:
 *
 *     out/projects/__next.projects/__PAGE__.txt
 *     out/projects/kurt/__next.projects/$d$slug/__PAGE__.txt
 *
 * The client asks for them dot-joined, as a single filename:
 *
 *     /projects/__next.projects.__PAGE__.txt
 *     /projects/kurt/__next.projects.$d$slug.__PAGE__.txt
 *
 * On a server that rewrites, the difference never surfaces. On a plain file
 * host like Pages it does: every <Link> prefetch 404s. Navigation still works,
 * because Next falls back to fetching the page on click — you just lose the
 * prefetch entirely, and get a console full of 404s.
 *
 * So write both spellings. The nested originals stay untouched, in case a
 * later Next version starts requesting those instead.
 * ------------------------------------------------------------------------- */

/** Every file underneath `dir`, as paths relative to it. */
function walk(dir, prefix = "") {
  const found = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) found.push(...walk(path.join(dir, entry.name), rel))
    else found.push(rel)
  }
  return found
}

let aliases = 0

/** Find every `__next.*` payload directory and flatten what is inside it. */
function flattenPayloads(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue

    const full = path.join(dir, entry.name)

    if (entry.name.startsWith("__next.")) {
      for (const rel of walk(full)) {
        // "__next.projects" + "$d$slug/__PAGE__.txt"
        //   -> "__next.projects.$d$slug.__PAGE__.txt"
        const flat = `${entry.name}.${rel.split("/").join(".")}`
        const target = path.join(dir, flat)
        if (!fs.existsSync(target)) {
          fs.copyFileSync(path.join(full, rel), target)
          aliases++
        }
      }
      // Payload directories never nest inside one another.
      continue
    }

    // Skip the bundle directory: thousands of files, no payloads.
    if (entry.name === "_next") continue

    flattenPayloads(full)
  }
}

flattenPayloads(OUT)
console.log(`[prepare-pages] wrote ${aliases} RSC prefetch aliases`)
console.log("[prepare-pages] output ready to publish")
