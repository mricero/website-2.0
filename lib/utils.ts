import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Prefix a root-relative public asset with the deployment basePath.
 *
 * GitHub Pages serves this project site under /<repo>/, so a bare
 * "/projects/x.png" resolves to mricero.github.io/projects/x.png and 404s.
 * Next handles this for its own `_next/*` bundles, but not for files you
 * reference out of `public/` — and `images.unoptimized` (required for a static
 * export) makes next/image pass `src` straight through as well.
 *
 * Returns the path unchanged when there is no basePath, so local dev and a
 * root-domain deployment both keep working.
 */
export function assetPath(path: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
  if (!base || !path.startsWith("/")) return path
  return `${base}${path}`
}
