import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon } from "lucide-react"

import { getProject, getProjectNeighbours, projects } from "@/data/projects"
import { siteConfig } from "@/data/site-config"
import { cn } from "@/lib/utils"
import { GitHubIcon } from "@/components/icons"
import { Container } from "@/components/layout/section"
import { PageHeader } from "@/components/layout/page-header"
import { Reveal } from "@/components/motion/reveal"
import { ProjectGallery } from "@/components/projects/project-gallery"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"

type Params = { params: Promise<{ slug: string }> }

/**
 * `output: "export"` has no server to render an unknown slug on demand, so
 * every case-study page has to be enumerated at build time. Adding a project to
 * data/projects.ts is therefore all it takes to get a page; this picks it up
 * automatically.
 */
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.id }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const project = getProject(slug)

  if (!project) return { title: "Project not found" }

  return {
    title: project.title,
    description: project.shortDescription,
    alternates: { canonical: `${siteConfig.url}/projects/${project.id}` },
    openGraph: {
      title: `${project.title}, ${siteConfig.name}`,
      description: project.shortDescription,
      url: `${siteConfig.url}/projects/${project.id}`,
      type: "article",
    },
  }
}

/** A titled block inside the case study. Every one of them reveals once. */
function Block({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
  return (
    <Reveal
      as="section"
      aria-labelledby={id}
      className={cn("border-t border-border pt-10", className)}
    >
      <h2 id={id} className="font-display text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </Reveal>
  )
}

/**
 * Prose list, marked with a short accent rule rather than a filled dot. Used
 * for features and technical notes alike.
 */
function Points({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3.5 text-sm leading-relaxed text-muted-foreground"
        >
          <span className="mt-2.5 h-px w-3 shrink-0 bg-primary/60" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params
  const project = getProject(slug)

  if (!project) notFound()

  const detail = project.detail
  const { previous, next } = getProjectNeighbours(project.id)
  const repo = project.links.github
  const live = project.links.live ?? project.links.demo

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: project.title },
        ]}
        /*
         * The eyebrow names the category and nothing else. It used to read
         * "Systems - 2026", which is two facts glued together with a dash; the
         * dates and the ownership role are separate facts and now live in the
         * meta strip below, where they are labelled.
         */
        eyebrow={project.category}
        title={project.title}
        lede={project.shortDescription}
        actions={
          <>
            {repo && (
              <a
                href={repo}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ size: "lg" }), "press")}
              >
                <GitHubIcon data-icon="inline-start" className="size-4" />
                View source
              </a>
            )}
            {live && (
              <a
                href={live}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "press"
                )}
              >
                Live demo
                <ArrowUpRightIcon data-icon="inline-end" />
              </a>
            )}
          </>
        }
        meta={
          (project.period || project.role) && (
            <dl className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs">
              {project.period && (
                <div className="flex items-center gap-2">
                  <dt className="text-muted-foreground">Built</dt>
                  <dd className="tabular-nums">{project.period}</dd>
                </div>
              )}
              {project.role && (
                <div className="flex items-center gap-2">
                  <dt className="text-muted-foreground">Role</dt>
                  <dd>{project.role}</dd>
                </div>
              )}
            </dl>
          )
        }
      />

      <Container className="pb-24 sm:pb-32">
        {/* The headline figures, straight off the README or the CV. */}
        {detail?.metrics && detail.metrics.length > 0 && (
          <Reveal>
            <dl className="grid grid-cols-2 gap-px border-y border-border bg-border lg:grid-cols-4">
              {detail.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="bg-background px-1 py-6 sm:px-5"
                >
                  <dt className="sr-only">{metric.label}</dt>
                  <dd>
                    <span className="font-display block text-2xl font-semibold text-primary tabular-nums">
                      {metric.value}
                    </span>
                    <span className="mt-2 block text-xs leading-snug text-muted-foreground">
                      {metric.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}

        <div
          className={cn(
            "grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16",
            detail?.metrics?.length && "mt-16"
          )}
        >
          <div className="min-w-0 space-y-12">
            {detail ? (
              <>
                <Reveal as="section" aria-labelledby="overview">
                  <h2 id="overview" className="sr-only">
                    Overview
                  </h2>
                  <div className="space-y-5">
                    {detail.overview.map((paragraph) => (
                      <p
                        key={paragraph.slice(0, 40)}
                        className="max-w-2xl text-base leading-relaxed text-muted-foreground"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </Reveal>

                {detail.gallery && detail.gallery.length > 0 && (
                  <Block title="Screens">
                    <ProjectGallery items={detail.gallery} label={project.title} />
                  </Block>
                )}

                {detail.architecture && (
                  <Block title="Architecture">
                    {/*
                      overflow-x-auto on the wrapper, not the <pre>: the diagram
                      is fixed-width ASCII and would otherwise force the whole
                      page to scroll sideways on a phone.
                    */}
                    <figure>
                      <div className="overflow-x-auto rounded-md border border-border bg-muted/40 p-5">
                        <pre className="font-mono text-xs leading-relaxed whitespace-pre text-muted-foreground">
                          {detail.architecture}
                        </pre>
                      </div>
                      {detail.architectureCaption && (
                        <figcaption className="mt-3 text-sm text-muted-foreground">
                          {detail.architectureCaption}
                        </figcaption>
                      )}
                    </figure>
                  </Block>
                )}

                <Block title="What it does">
                  <Points items={detail.keyFeatures} />
                </Block>

                <Block title="How it works">
                  <Points items={detail.technical} />
                </Block>

                {detail.challenges && detail.challenges.length > 0 && (
                  <Block title="Problems and answers">
                    <ul className="grid gap-4 sm:grid-cols-2">
                      {detail.challenges.map((item) => (
                        <li key={item.challenge} className="surface rounded-md p-5">
                          <p className="text-sm leading-relaxed font-medium">
                            {item.challenge}
                          </p>
                          <p className="mt-3 border-l-2 border-primary/50 pl-4 text-sm leading-relaxed text-muted-foreground">
                            {item.solution}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </Block>
                )}

                {detail.future && detail.future.length > 0 && (
                  <Block title="Where it goes next">
                    <Points items={detail.future} />
                  </Block>
                )}
              </>
            ) : (
              <Reveal>
                <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
                  {project.highlight ?? project.shortDescription}
                </p>
              </Reveal>
            )}
          </div>

          {/*
            Sticky details rail. Sticky only from lg up: on a phone it simply
            follows the article, because pinning a panel to a 700px-tall
            viewport eats the page.
          */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Reveal from="none" className="space-y-8">
              {project.highlight && (
                <div>
                  <h2 className="label-mono">The hard part</h2>
                  <p className="mt-3 border-l-2 border-primary/50 pl-4 text-sm leading-relaxed text-muted-foreground">
                    {project.highlight}
                  </p>
                </div>
              )}

              <div>
                <h2 className="label-mono">Built with</h2>
                {detail?.stack ? (
                  <dl className="mt-4 space-y-4">
                    {detail.stack.map((group) => (
                      <div key={group.group}>
                        <dt className="font-mono text-xs text-muted-foreground/70">
                          {group.group}
                        </dt>
                        <dd className="mt-1.5 flex flex-wrap gap-1.5">
                          {group.items.map((item) => (
                            <Badge
                              key={item}
                              variant="secondary"
                              className="font-mono"
                            >
                              {item}
                            </Badge>
                          ))}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {project.techStack.map((tech) => (
                      <li key={tech}>
                        <Badge variant="secondary" className="font-mono">
                          {tech}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {repo && (
                <div>
                  <h2 className="label-mono">Repository</h2>
                  <a
                    href={repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 font-mono text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    <GitHubIcon className="size-3.5 shrink-0" />
                    <span className="break-all">
                      {repo.replace("https://github.com/", "")}
                    </span>
                  </a>
                </div>
              )}
            </Reveal>
          </aside>
        </div>

        {/*
          Prev / next. Standard on any article, and the reason nobody has to go
          back to the index to read the second one.
        */}
        <Reveal
          as="section"
          aria-label="More projects"
          className="mt-20 grid gap-4 border-t border-border pt-8 sm:grid-cols-2"
        >
          {previous ? (
            <Link
              href={`/projects/${previous.id}`}
              className="surface surface-hover group rounded-md p-5"
            >
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                <ArrowLeftIcon
                  className="size-3 transition-transform group-hover:-translate-x-0.5"
                  aria-hidden
                />
                Newer
              </span>
              <span className="mt-2 block text-sm font-medium tracking-tight transition-colors group-hover:text-primary">
                {previous.title}
              </span>
            </Link>
          ) : (
            <span aria-hidden />
          )}

          {next && (
            <Link
              href={`/projects/${next.id}`}
              className="surface surface-hover group rounded-md p-5 sm:col-start-2 sm:text-right"
            >
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                Older
                <ArrowRightIcon
                  className="size-3 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
              <span className="mt-2 block text-sm font-medium tracking-tight transition-colors group-hover:text-primary">
                {next.title}
              </span>
            </Link>
          )}
        </Reveal>
      </Container>
    </>
  )
}
