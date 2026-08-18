import { cn } from "@/lib/utils"

interface SectionProps extends React.ComponentProps<"section"> {
  /** Anchor target for the navbar. */
  id: string
  /** Mono eyebrow, e.g. "01". */
  index?: string
  /** Section heading. Always renders as an h2 — the page has exactly one h1. */
  heading?: string
  /** Optional one-line framing under the heading. */
  lede?: string
}

/**
 * Owns vertical rhythm and the section header treatment. Sections never set
 * their own outer padding — routing it through here is what keeps spacing
 * uniform down the page.
 */
export function Section({
  id,
  index,
  heading,
  lede,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      id={id}
      // scroll-mt clears the fixed navbar when an anchor link lands here
      className={cn("scroll-mt-24 border-t border-border/60 py-20 sm:py-28", className)}
      aria-labelledby={heading ? `${id}-heading` : undefined}
      {...props}
    >
      <div className="mx-auto w-full max-w-5xl px-6">
        {heading && (
          <header className="mb-12 sm:mb-16">
            <div className="flex items-baseline gap-3">
              {index && (
                <span
                  className="font-mono text-xs text-primary tabular-nums"
                  aria-hidden
                >
                  {index}
                </span>
              )}
              <h2
                id={`${id}-heading`}
                className="text-2xl font-semibold tracking-tighter sm:text-3xl"
              >
                {heading}
              </h2>
            </div>
            {lede && (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {lede}
              </p>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  )
}
