"use client"

import * as React from "react"
import Image from "next/image"

import type { ProjectGalleryItem } from "@/types"
import { assetPath, cn } from "@/lib/utils"

/**
 * A picked image plus a thumbnail rail.
 *
 * Not a lightbox. A modal viewer on a portfolio buys a focus trap, an
 * escape-key handler and a scroll lock in exchange for showing an image
 * slightly larger than it already is — so the large panel stays inline and the
 * thumbnails just swap what it holds.
 *
 * The thumbnails are real <button>s inside a labelled group, so the whole thing
 * is keyboard reachable rather than click-only.
 */
export function ProjectGallery({
  items,
  label,
}: {
  items: ProjectGalleryItem[]
  label: string
}) {
  const [active, setActive] = React.useState(0)

  if (items.length === 0) return null
  const current = items[active]

  return (
    <div>
      <figure>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Image
            // Keyed on src so React swaps the element rather than mutating one
            // in place, which is what lets the entrance run on each change.
            key={current.src}
            src={assetPath(current.src)}
            alt={current.alt}
            width={1600}
            height={1000}
            sizes="(min-width: 1024px) 900px, 100vw"
            className={cn(
              "animate-rise w-full object-contain",
              current.treatment === "chart" &&
                "bg-white dark:invert dark:hue-rotate-180"
            )}
          />
        </div>
        <figcaption className="mt-3 text-sm text-muted-foreground">
          {current.caption}
        </figcaption>
      </figure>

      {items.length > 1 && (
        <div
          role="group"
          aria-label={`${label} screenshots`}
          className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6"
        >
          {items.map((item, i) => {
            const isActive = i === active
            return (
              <button
                key={item.src}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={isActive}
                className={cn(
                  "group relative aspect-[16/10] overflow-hidden rounded-lg border transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                  isActive
                    ? "border-primary"
                    : "border-border hover:border-foreground/30"
                )}
              >
                <Image
                  src={assetPath(item.src)}
                  alt=""
                  width={320}
                  height={200}
                  sizes="160px"
                  className={cn(
                    "size-full object-cover object-top transition-opacity",
                    isActive ? "opacity-100" : "opacity-60 group-hover:opacity-90",
                    item.treatment === "chart" &&
                      "bg-white dark:invert dark:hue-rotate-180"
                  )}
                />
                {/* The visible thumbnail is decorative; this is its real name. */}
                <span className="sr-only">{item.caption}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
