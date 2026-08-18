import Link from "next/link"
import { ArrowDownRightIcon, ArrowUpRightIcon, FileTextIcon } from "lucide-react"

import { focusAreas, siteConfig } from "@/data/site-config"
import { assetPath, cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

/**
 * The hero deliberately does NOT use <Reveal>. It holds the LCP element, and a
 * Framer entrance would serve the <h1> at opacity:0 until React hydrates —
 * blank page on a slow connection, and LCP measured at hydration rather than
 * paint. The `.animate-rise` keyframe does the same thing in CSS, starting at
 * first paint with no JavaScript involved.
 */
const step = (i: number) => ({ animationDelay: `${i * 0.09}s` })

export function Hero() {
  return (
    <section
      id="top"
      className="mx-auto flex min-h-[85svh] w-full max-w-5xl flex-col justify-center px-6 pt-28 pb-20"
    >
      <div className="animate-rise" style={step(0)}>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 font-mono text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden />
          Available for internships
        </span>
      </div>

      <h1
        className="animate-rise mt-8 text-4xl font-semibold tracking-tighter sm:text-6xl lg:text-7xl"
        style={step(1)}
      >
        {siteConfig.name}
      </h1>

      <p
        className="animate-rise mt-4 font-mono text-sm text-primary sm:text-base"
        style={step(2)}
      >
        {siteConfig.title}
      </p>

      <p
        className="animate-rise mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
        style={step(3)}
      >
        {siteConfig.description}
      </p>

      <ul
        className="animate-rise mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-muted-foreground"
        style={step(4)}
      >
        {focusAreas.map((area) => (
          <li key={area} className="flex items-center gap-2">
            <span className="size-1 rounded-full bg-border" aria-hidden />
            {area}
          </li>
        ))}
      </ul>

      <div
        className="animate-rise mt-10 flex flex-wrap items-center gap-3"
        style={step(5)}
      >
        {/*
          These are links wearing button styling — an in-page anchor, a PDF, and
          an external URL — so they render as real anchors via `buttonVariants`
          rather than through Base UI's <Button>. Routing them through <Button>
          stamps role="button" onto the element, which overrides the implicit
          link role: a screen-reader user navigating by links would skip the
          résumé and GitHub entirely. Styling is identical either way.
        */}
        <Link
          href="#projects"
          className={cn(buttonVariants({ size: "lg" }))}
        >
          View projects
          <ArrowDownRightIcon data-icon="inline-end" />
        </Link>
        <a
          href={assetPath(siteConfig.socials.resume)}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
        >
          <FileTextIcon data-icon="inline-start" />
          Resume
        </a>
        <a
          href={siteConfig.socials.github}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ size: "lg", variant: "ghost" }))}
        >
          GitHub
          <ArrowUpRightIcon data-icon="inline-end" />
        </a>
      </div>
    </section>
  )
}
