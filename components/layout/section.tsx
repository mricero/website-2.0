import { cn } from "@/lib/utils"
import { Reveal } from "@/components/motion/reveal"

/**
 * The one width constraint on the site. Every page is 6xl with 6-unit gutters;
 * routing that through a component rather than repeating the classes is what
 * stops one page from silently being 4xl.
 */
export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-6", className)} {...props} />
  )
}

interface SectionProps extends Omit<React.ComponentProps<"section">, "title"> {
  /** Anchor target. Optional: not every section needs to be linkable. */
  id?: string
  /**
   * A small mono label above the heading. RATIONED: at most one per three
   * sections on a page. An eyebrow over every heading is the most recognisable
   * rhythm of a generated layout, and a section's position on the page usually
   * categorises it well enough without one.
   *
   * There is deliberately no `index` prop any more. "01", "02 / WORK" and
   * "003 - Capabilities" enumerate rather than name, and a reader who can see
   * the sections can already count them.
   */
  eyebrow?: string
  /** Section heading. Always an h2: the page's h1 belongs to PageHeader. */
  heading?: string
  /** Optional one-line framing under the heading. */
  lede?: string
  /** Draw the top divider. On by default; off for the first section on a page. */
  divider?: boolean
  /** Tighter vertical rhythm, for sections that sit close together. */
  compact?: boolean
  /** Let the section run full-bleed; the child owns its own Container. */
  bleed?: boolean
}

/**
 * Owns vertical rhythm and the section header treatment. Sections never set
 * their own outer padding; routing it through here is what keeps spacing
 * uniform down the page.
 */
export function Section({
  id,
  eyebrow,
  heading,
  lede,
  divider = true,
  compact = false,
  bleed = false,
  className,
  children,
  ...props
}: SectionProps) {
  const body = (
    <>
      {heading && (
        <Reveal as="header" className="mb-12 sm:mb-16">
          {eyebrow && <p className="label-mono mb-4">{eyebrow}</p>}
          <h2
            id={id ? `${id}-heading` : undefined}
            className="text-section-title max-w-3xl"
          >
            {heading}
          </h2>
          {lede && (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {lede}
            </p>
          )}
        </Reveal>
      )}
      {children}
    </>
  )

  return (
    <section
      id={id}
      // scroll-mt clears the fixed navbar when an anchor link lands here
      className={cn(
        "scroll-mt-24",
        divider && "border-t border-border",
        compact ? "py-14 sm:py-16" : "py-20 sm:py-28",
        className
      )}
      aria-labelledby={heading && id ? `${id}-heading` : undefined}
      {...props}
    >
      {bleed ? body : <Container>{body}</Container>}
    </section>
  )
}
