import Link from "next/link"
import { ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export interface Crumb {
  label: string
  /** Omit on the final crumb: the current page is not a link to itself. */
  href?: string
}

/**
 * Standard breadcrumb trail. Rendered as an ordered list inside a labelled
 * <nav>, which is what assistive technology expects; the separators are
 * decorative and hidden.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 font-mono text-xs text-muted-foreground">
        {items.map((crumb, i) => {
          const last = i === items.length - 1
          return (
            <li key={crumb.label} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRightIcon className="size-3 opacity-50" aria-hidden />
              )}
              {crumb.href && !last ? (
                <Link
                  href={crumb.href}
                  className="transition-colors hover:text-foreground"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={cn(last && "text-foreground")}
                  aria-current={last ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

interface PageHeaderProps {
  /**
   * Small mono label above the title.
   *
   * RATIONED, and never a section number. "01 - Skills" and "04 - Contact"
   * enumerate the navigation instead of naming the page, which the <h1>
   * directly below already does. Where an eyebrow survives it carries real
   * information the title does not, such as a project's category and dates on
   * a case study.
   */
  eyebrow?: string
  title: string
  lede?: string
  breadcrumbs?: Crumb[]
  /** Buttons or links, rendered under the lede. */
  actions?: React.ReactNode
  /** A meta strip (counts, dates, categories) under the actions. */
  meta?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

/**
 * The masthead every subpage opens with.
 *
 * Centralised for the obvious reason (five pages that each roll their own
 * header drift apart within a week) and for one less obvious one: the <h1>
 * lives here, so there is exactly one per document by construction rather than
 * by discipline.
 *
 * The entrance is the CSS `.animate-rise` keyframe rather than a scroll
 * reveal. This block is always above the fold and holds the LCP element; an
 * intersection-driven fade would leave the title at opacity:0 in the served
 * HTML until JavaScript ran.
 */
export function PageHeader({
  eyebrow,
  title,
  lede,
  breadcrumbs,
  actions,
  meta,
  className,
  children,
}: PageHeaderProps) {
  return (
    <header className={cn("relative isolate", className)}>
      {/*
        One soft wash in the accent hue, offset to the left. This replaced a
        graph-paper grid: ruled lines drawn only to make a page feel designed
        are decoration pretending to be structure, and the page-wide grain on
        body::before already supplies the texture.
      */}
      <div
        aria-hidden
        className="header-wash pointer-events-none absolute inset-x-0 top-0 -z-10 h-96"
      />

      <div className="mx-auto w-full max-w-6xl px-6 pt-24 pb-12 sm:pb-16">
        {breadcrumbs && (
          <div className="animate-rise mb-7">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}

        {eyebrow && (
          <p
            className="animate-rise label-mono"
            style={{ animationDelay: "0.06s" }}
          >
            {eyebrow}
          </p>
        )}

        <h1
          className={cn("animate-rise text-page-title", eyebrow && "mt-4")}
          style={{ animationDelay: "0.12s" }}
        >
          {title}
        </h1>

        {lede && (
          <p
            className="animate-rise mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            style={{ animationDelay: "0.18s" }}
          >
            {lede}
          </p>
        )}

        {actions && (
          <div
            className="animate-rise mt-8 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "0.24s" }}
          >
            {actions}
          </div>
        )}

        {meta && (
          <div className="animate-rise mt-8" style={{ animationDelay: "0.3s" }}>
            {meta}
          </div>
        )}

        {children}
      </div>
    </header>
  )
}
