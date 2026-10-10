import type { NextConfig } from "next"

/**
 * Served from the root of the custom domain https://www.mohnish.co.in (GitHub
 * Pages + public/CNAME), so no prefix is needed. Previously this was the
 * project-site path "/website-2.0"; keeping it after adding the domain made
 * every CSS/JS request 404. Dev stays at "/" — `next dev` runs
 * with NODE_ENV=development — so local URLs are not littered with the repo name.
 *
 * If you later move to a custom domain, or rename the repo to `mricero.github.io`
 * (a user site, which serves from the origin root), set NEXT_PUBLIC_BASE_PATH=""
 * and update `siteConfig.url`.
 */
const basePath =
  process.env.NEXT_PUBLIC_BASE_PATH ??
  ""

const nextConfig: NextConfig = {
  // Pages is a static file host — there is no Node server to render on demand.
  output: "export",

  basePath,
  assetPrefix: basePath || undefined,

  /**
   * next/image's optimiser is a server route. With `output: export` there is
   * nothing to run it, so images must be served as authored. They are still
   * laid out by next/image (width/height/sizes prevent layout shift), just not
   * transcoded or resized — which is why the source PNGs are pre-sized.
   */
  images: { unoptimized: true },

  /**
   * Emit `route/index.html` rather than `route.html`. Pages resolves directory
   * URLs to index.html, so this keeps links working with or without the
   * trailing slash instead of 404ing on one of the two.
   */
  trailingSlash: true,

  /**
   * Next rewrites `_next/*` URLs with the basePath automatically, but it does
   * NOT touch root-relative paths you write yourself — `/projects/x.png`,
   * `/resume.pdf` — and with `images.unoptimized` the image loader passes src
   * through untouched too. Exposing the prefix here lets `assetPath()` in
   * lib/utils.ts fix those up. See the note there.
   */
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
}

export default nextConfig
