import Link from "next/link"
import { ArrowRightIcon, ArrowUpRightIcon, FileTextIcon } from "lucide-react"

import { currentRoles } from "@/data/career"
import { siteConfig } from "@/data/site-config"
import { assetPath, cn } from "@/lib/utils"
import { ScrollFadeOut } from "@/components/motion/scroll-linked"
import { buttonVariants } from "@/components/ui/button"

/**
 * The masthead.
 *
 * Four text elements and no more: availability, name, one twenty-word line,
 * and a pair of controls. Everything that used to be crowded in here (the
 * focus-area strip, the long statement) has moved to sections of its own
 * below, because a hero that overflows the first viewport hides its own call
 * to action.
 *
 * The entrance is the CSS `.animate-rise` keyframe, deliberately NOT a scroll
 * reveal: this block holds the LCP element, and an intersection-driven fade
 * would serve the <h1> at opacity:0 until React hydrated. That measures LCP at
 * hydration time and shows a blank page on a slow connection.
 *
 * The *exit* is scroll-linked, which is the one thing a hero can usefully do
 * with scroll position: recede as the page moves on.
 */
const step = (i: number) => ({ animationDelay: `${i * 0.07}s` })

export function Hero() {
  const showResume = siteConfig.resumeAvailable

  return (
    <section className="relative isolate">
      {/* A single soft wash in the accent hue, offset left so the composition
          is not symmetrical. The page-wide grain lives on body::before. */}
      <div
        aria-hidden
        className="header-wash pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem]"
      />

      <ScrollFadeOut lift={70}>
        {/* pb is deliberately modest. The reading column is short by design, so
            generous bottom padding here does not read as breathing room, it
            reads as a hole between the hero and the numbers under it. */}
        <div className="mx-auto grid w-full max-w-6xl gap-14 px-6 pt-24 pb-14 lg:grid-cols-[1.6fr_1fr] lg:gap-20 lg:pb-16">
          <div>
            <div className="animate-rise" style={step(0)}>
              {/*
                The one status dot on the site. It survives the "no decorative
                dots" rule because it reports actual state: whether this person
                is currently looking for work.
              */}
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-xs text-muted-foreground">
                <span
                  className="size-1.5 rounded-full bg-primary"
                  aria-hidden
                />
                Available for internships
              </span>
            </div>

            <h1
              className="animate-rise text-display mt-7 max-w-[12ch]"
              style={step(1)}
            >
              {siteConfig.name}
            </h1>

            <p
              className="animate-rise mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
              style={step(3)}
            >
              {siteConfig.tagline}
            </p>

            <div
              className="animate-rise mt-9 flex flex-wrap items-center gap-3"
              style={step(4)}
            >
              {/*
                These are links wearing button styling: a route, and either a
                PDF or an external URL. They render as real anchors through
                `buttonVariants` rather than through <Button>, which would
                stamp role="button" onto the element and override the implicit
                link role, so a screen-reader user navigating by links would
                skip them entirely. Styling is identical either way.
              */}
              <Link
                href="/projects"
                className={cn(buttonVariants({ size: "lg" }), "press")}
              >
                View projects
                <ArrowRightIcon data-icon="inline-end" />
              </Link>

              {showResume ? (
                <a
                  href={assetPath(siteConfig.socials.resume)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "press"
                  )}
                >
                  <FileTextIcon data-icon="inline-start" />
                  Resume
                </a>
              ) : (
                <a
                  href={siteConfig.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "press"
                  )}
                >
                  GitHub
                  <ArrowUpRightIcon data-icon="inline-end" />
                </a>
              )}
            </div>
          </div>

          {/*
            A parallel column, not a continuation of the one on the left. It
            exists because the reading column tops out around 65 characters,
            which leaves a wide screen with a third of it empty, and "what is
            he doing right now" is the question that empty third should answer.

            Deliberately early in the animation sequence rather than last: it
            sits above the fold on desktop, and queueing it behind four other
            steps would leave visible space empty for half a second.
          */}
          <aside
            className="animate-rise surface self-start rounded-md p-6 lg:sticky lg:top-24"
            style={step(2)}
            aria-labelledby="hero-now"
          >
            <h2 id="hero-now" className="label-mono">
              Currently
            </h2>

            <ul className="mt-5 space-y-5">
              {currentRoles.map((role) => (
                <li key={role.id}>
                  <p className="text-sm font-medium tracking-tight">
                    {role.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {role.organization}
                  </p>
                  <p className="mt-1.5 font-mono text-xs text-muted-foreground/80">
                    {role.period}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-3 border-t border-border pt-5 font-mono text-xs">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Graduating</dt>
                <dd className="tabular-nums">{siteConfig.graduation}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Based in</dt>
                <dd>{siteConfig.location}</dd>
              </div>
            </dl>

            <Link
              href="/career"
              className="group mt-6 inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              Full timeline
              <ArrowRightIcon
                className="size-3 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </aside>
        </div>
      </ScrollFadeOut>
    </section>
  )
}
