import Link from "next/link"
import { ArrowRightIcon, ArrowUpRightIcon, FileTextIcon } from "lucide-react"

import { currentRoles, experience } from "@/data/career"
import { projects } from "@/data/projects"
import { siteConfig } from "@/data/site-config"
import { assetPath, cn } from "@/lib/utils"
import { stagger } from "@/lib/motion-config"
import { Boot } from "@/components/motion/build/boot"
import { Build } from "@/components/motion/build/build"
import { Magnetic } from "@/components/motion/magnetic"
import { ScrollDepth, ScrollFadeOut } from "@/components/motion/scroll-linked"
import { SplitWords } from "@/components/motion/split-words"
import { buttonVariants } from "@/components/ui/button"

/**
 * The masthead.
 *
 * Eight blocks, each a <Build boot>: availability, the giant outlined word,
 * the name slab, one line, each of the two controls, the facts, and the
 * "Currently" panel. On the first view of the home page in a session the
 * build engine assembles them in that order (cursors orbit, scatter to the
 * corners, draw frames, and the covers wipe off); on every other view each
 * rises and builds on its own when seen, like every other block on the site.
 *
 * None of that touches the content's own visibility. Every block is
 * server-rendered and opaque; the boot only lifts covers that sit on top of
 * it, and a CSS failsafe removes those by itself if the script never runs.
 * That is what keeps the <h1> the LCP element it always was.
 *
 * The *exit* is scroll-linked: the hero recedes as the page moves on, and the
 * giant word lags it for depth.
 */
const step = (i: number) => ({ animationDelay: `${i * stagger.block}s` })

/*
 * The decorative word is the given name, derived rather than typed so it can
 * never drift from the real one in data/site-config.ts.
 */
const markWord = siteConfig.name.split(" ").at(-1) ?? siteConfig.name

/*
 * Counts derived from data/ at build time. Nothing here is typed in. No
 * case-study count: every project carries a `detail` block, so the derived
 * number would contradict the copy elsewhere that says five are written up
 * in full, and a figure that disagrees with the site is worse than none.
 */
const facts = [
  { label: "projects", value: projects.length },
  { label: "internships", value: experience.length },
]

export function Hero() {
  const showResume = siteConfig.resumeAvailable

  return (
    <section className="relative isolate">
      {/* A single soft wash in the accent hue, offset left so the composition
          is not symmetrical. The page-wide grain lives on body::before. */}
      <div
        aria-hidden
        data-boot-wash=""
        className="header-wash pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem]"
      />

      <Boot />

      <ScrollFadeOut lift={70}>
        <div className="mx-auto grid w-full max-w-6xl gap-14 px-6 pt-24 pb-14 lg:grid-cols-[1.6fr_1fr] lg:gap-16 lg:pb-16">
          <div className="min-w-0">
            {/*
              The one status dot on the site. It survives the "no decorative
              dots" rule because it reports actual state: whether this person
              is currently looking for work.
            */}
            <Build
              boot
              order={0}
              label="status"
              className="animate-rise w-fit"
              style={step(0)}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-xs text-muted-foreground">
                <span
                  className="size-1.5 rounded-full bg-primary"
                  aria-hidden
                />
                Available for internships
              </span>
            </Build>

            {/*
              The giant outlined word. aria-hidden: it repeats the name the
              <h1> already carries, and a screen reader should hear it once.
            */}
            {/* w-max: the word is wider than the column, and its box (and so
                its cover and its frame) must be the word, not the column. */}
            <Build
              boot
              order={1}
              label="mark"
              className="mt-8 w-max"
              /* The letter masks pad past the box, and the outlined S curls below it. */
              style={{ "--cover-bleed": "24px" } as React.CSSProperties}
              aria-hidden
            >
              <ScrollDepth>
                <p className="text-mega">
                  <SplitWords
                    text={markWord}
                    by="char"
                    delay={stagger.markStart}
                  />
                </p>
              </ScrollDepth>
            </Build>

            <Build
              boot
              order={2}
              label="name"
              className="mega-overlap"
              style={{ "--cover-bleed": "14px" } as React.CSSProperties}
            >
              <h1
                className="animate-rise text-display max-w-[12ch]"
                style={step(1)}
              >
                <span className="slab">
                  <SplitWords
                    text={siteConfig.name}
                    delay={stagger.titleStart}
                  />
                </span>
              </h1>
            </Build>

            <Build
              boot
              order={3}
              label="tagline"
              className="animate-rise mt-7 max-w-xl"
              style={step(3)}
            >
              <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                {siteConfig.tagline}
              </p>
            </Build>

            {/* Each control is its own block, so each gets its own frame and
                tag. The row stays a plain flex row: a Build span is a flex
                item, so the wrapping is exactly what it was. */}
            <div className="mt-9 flex flex-wrap items-center gap-3">
              {/*
                These are links wearing button styling: a route, and either
                a PDF or an external URL. They render as real anchors
                through `buttonVariants` rather than through <Button>, which
                would stamp role="button" onto the element and override the
                implicit link role, so a screen-reader user navigating by
                links would skip them entirely.
              */}
              <Build
                boot
                order={4}
                as="span"
                label="projects"
                className="animate-rise"
                style={step(4)}
              >
                <Magnetic>
                  <Link
                    href="/projects"
                    className={cn(buttonVariants({ size: "lg" }), "press")}
                  >
                    View projects
                    <ArrowRightIcon data-icon="inline-end" />
                  </Link>
                </Magnetic>
              </Build>

              <Build
                boot
                order={5}
                as="span"
                label={showResume ? "resume" : "github"}
                className="animate-rise"
                style={step(4)}
              >
                <Magnetic>
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
                </Magnetic>
              </Build>
            </div>

            <Build
              boot
              order={6}
              label="facts"
              className="animate-rise mt-8 w-fit max-w-full"
              style={step(4)}
            >
              {/* Term first in the DOM, as a definition list requires; the
                  number is drawn first visually with `order`. */}
              <dl className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-muted-foreground">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex items-baseline gap-1.5">
                    <dt>{fact.label}</dt>
                    <dd className="order-first text-foreground tabular-nums">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Build>
          </div>

          {/*
            A parallel column, not a continuation of the one on the left. It
            exists because the reading column tops out around 65 characters,
            which leaves a wide screen with a third of it empty, and "what is
            he doing right now" is the question that empty third should answer.
          */}
          <Build
            boot
            order={7}
            label="currently"
            as="aside"
            className="animate-rise surface self-start rounded-md p-6 lg:sticky lg:top-24 lg:mt-24"
            style={{ ...step(2), "--cover-bleed": "3px" } as React.CSSProperties}
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
                  <p className="mt-1.5 font-mono text-xs text-muted-foreground">
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
              <span className="link-draw">Full timeline</span>
              <ArrowRightIcon
                className="size-3 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </Build>
        </div>
      </ScrollFadeOut>
    </section>
  )
}
