import Link from "next/link"
import { ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { stagger } from "@/lib/motion-config"
import { SplitWords } from "@/components/motion/split-words"
import { Build } from "@/components/motion/build/build"

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
  /**
   * A short outlined word set large behind the title, usually the route's
   * name. Decorative and aria-hidden: the <h1> is the title.
   */
  mark?: string
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
 * The masthead builds piece by piece like the rest of the site: path, eyebrow,
 * mark, title, summary, actions and facts are each their own Build. That is
 * safe above the fold where a scroll fade is not, because a build is a cover
 * over already-painted, server-rendered content rather than an opacity gate:
 * the <h1> (the LCP element) is painted from the first frame, and a CSS
 * failsafe removes the covers if scripts never run.
 */
export function PageHeader({
  eyebrow,
  title,
  mark,
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

      <div className="relative mx-auto w-full max-w-6xl px-6 pt-24 pb-12 sm:pb-16">
        {mark && (
          // The Build is the positioned element itself: its utilities
          // (absolute, hidden) beat the base-layer [data-build] rule.
          <Build
            as="span"
            label="mark"
            aria-hidden
            className="text-mark pointer-events-none absolute top-20 right-6 -z-10 hidden sm:block"
          >
            {mark}
          </Build>
        )}

        {breadcrumbs && (
          <Build label="path" className="mb-7">
            <Breadcrumbs items={breadcrumbs} />
          </Build>
        )}

        {eyebrow && (
          <Build as="p" label="eyebrow" className="label-mono">
            {eyebrow}
          </Build>
        )}

        {/*
          The title sits in a solid slab of the accent and rises word by word
          out of its own line. The split is server-side (SplitWords), so the
          text content of the <h1> is exactly the title and it is painted from
          the first frame; only the words' transforms animate. The Build wraps
          the <h1> rather than replacing it, so the heading keeps its tag.
        */}
        <Build
          label="title"
          className={cn("max-w-4xl", eyebrow && "mt-4")}
          // The slab's box-decoration padding paints past the line box; the
          // cover reaches it so nothing peeks out mid-build.
          style={{ "--cover-bleed": "10px" } as React.CSSProperties}
        >
          <h1 className="text-page-title max-w-4xl">
            <span className="slab">
              <SplitWords text={title} delay={stagger.titleStart} />
            </span>
          </h1>
        </Build>

        {lede && (
          <Build
            as="p"
            label="summary"
            className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            {lede}
          </Build>
        )}

        {actions && (
          <Build
            label="actions"
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            {actions}
          </Build>
        )}

        {meta && (
          <Build label="facts" className="mt-8">
            {meta}
          </Build>
        )}

        {children}
      </div>
    </header>
  )
}
