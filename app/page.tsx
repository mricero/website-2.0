import Link from "next/link"
import { ArrowRightIcon, MailIcon } from "lucide-react"

import { experience } from "@/data/career"
import { featuredProjects } from "@/data/projects"
import { skillCategories } from "@/data/skills"
import { focusAreas, siteConfig } from "@/data/site-config"
import { cn } from "@/lib/utils"
import { Section } from "@/components/layout/section"
import { Reveal } from "@/components/motion/reveal"
import { ScrollWrite, StickyStack } from "@/components/motion/scroll-linked"
import { Hero } from "@/components/home/hero"
import { ProjectCard } from "@/components/projects/project-card"
import { buttonVariants } from "@/components/ui/button"

/**
 * The home page is an index, not a container for everything.
 *
 * Each section is a trailer for a page that holds the real thing: three
 * projects out of eight, four areas out of forty skills, two internships out
 * of a full timeline. Every one of them ends in a link to the page with the
 * rest, which is the whole reason this site is five routes rather than one
 * very long scroll.
 *
 * LAYOUT FAMILIES, deliberately all different. A page where every section is
 * a row of cards is a page nobody remembers:
 *
 *   hero        asymmetric split, sticky side panel
 *   statement   editorial line, scroll-written word by word
 *   work        sticky stack, cards pinning over one another
 *   skills      two-column definition list on hairlines
 *   roles       chronological rows with a mono date column
 *   contact     single full-width panel
 *
 * EYEBROWS are rationed to one per three sections. This page spends one, on
 * the hero's availability chip. The headings carry the rest on their own.
 */

/** A quiet link that closes a section: "and here is the rest of it". */
function MoreLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
    >
      {children}
      <ArrowRightIcon
        className="size-3 transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  )
}

export default function HomePage() {
  const lead = featuredProjects.slice(0, 3)

  return (
    <>
      <Hero />

      {/*
        The statement. One long sentence, metered to the scroll so it gets read
        rather than skimmed, with the four working areas underneath it as a
        plain hairline strip.
      */}
      <Section id="statement" divider>
        <ScrollWrite
          text={siteConfig.description}
          className="font-display max-w-4xl text-2xl leading-[1.35] tracking-tight sm:text-3xl sm:leading-[1.3]"
        />

        <Reveal className="mt-12">
          <ul className="grid grid-cols-2 gap-px border-t border-border bg-border sm:grid-cols-4">
            {focusAreas.map((area) => (
              <li
                key={area}
                className="bg-background px-1 py-5 font-mono text-xs text-muted-foreground sm:px-4"
              >
                {area}
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>

      {/*
        Selected work. The cards pin and stack, which is the one thing a plain
        grid cannot say: these are in an order, and this is the first one.
      */}
      <Section
        id="work"
        heading="Selected work"
        lede="Three of eight. The note on each is the part that was actually hard, not the part that took longest."
      >
        <StickyStack>
          {lead.map((project) => (
            <ProjectCard key={project.id} project={project} wide />
          ))}
        </StickyStack>

        <Reveal className="mt-12">
          <MoreLink href="/projects">All eight projects</MoreLink>
        </Reveal>
      </Section>

      {/*
        Skills. A definition list on hairlines rather than a card grid: these
        are four labelled bodies of text, and boxing each one adds a border
        without adding a fact.
      */}
      <Section
        id="skills"
        heading="What I work with"
        lede="Four areas, following the same grouping the CV uses."
      >
        <dl className="border-t border-border">
          {skillCategories.map((category, i) => (
            <Reveal
              key={category.id}
              index={i}
              className="grid gap-3 border-b border-border py-8 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:gap-10"
            >
              <dt className="font-display text-lg font-semibold tracking-tight">
                {category.title}
              </dt>
              <dd>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {category.summary}
                </p>
                <p className="mt-3 font-mono text-xs text-muted-foreground/70">
                  {category.skills
                    .slice(0, 4)
                    .map((s) => s.name)
                    .join(", ")}
                </p>
              </dd>
            </Reveal>
          ))}
        </dl>

        <Reveal className="mt-12">
          <MoreLink href="/skills">Every skill, with the evidence</MoreLink>
        </Reveal>
      </Section>

      {/*
        Internships specifically, not "experience". The hero's side panel
        already carries the positions currently running, and showing the same
        two roles twice on one page is the fastest way to look like a template
        with a data file behind it.
      */}
      <Section
        id="roles"
        heading="Where I have worked"
        lede="Two internships, both within the last year."
      >
        <ol className="border-t border-border">
          {experience.map((role, i) => (
            <Reveal
              key={role.id}
              as="li"
              index={i}
              className="grid gap-3 border-b border-border py-8 md:grid-cols-[minmax(0,10rem)_minmax(0,1fr)] md:gap-10"
            >
              <p className="font-mono text-xs text-muted-foreground tabular-nums">
                {role.period}
              </p>
              <div>
                <h3 className="font-display text-lg font-semibold tracking-tight">
                  {role.organization}
                </h3>
                <p className="mt-1 text-sm text-primary">{role.title}</p>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {role.summary}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-12">
          <MoreLink href="/career">Positions, education and results</MoreLink>
        </Reveal>
      </Section>

      <Section id="contact" className="pb-24 sm:pb-32">
        <Reveal className="surface rounded-md p-8 sm:p-14">
          <h2 className="text-section-title max-w-2xl">
            Looking for an internship in machine learning or robotics.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Happy to talk about any of the work on this site, and about
            research collaborations. Email reaches me fastest.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className={cn(buttonVariants({ size: "lg" }), "press")}
            >
              <MailIcon data-icon="inline-start" />
              Get in touch
            </Link>
            <a
              href={siteConfig.socials.email}
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "press"
              )}
            >
              {siteConfig.socials.emailAddress}
            </a>
          </div>
        </Reveal>
      </Section>
    </>
  )
}
