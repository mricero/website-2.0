import type { Metadata } from "next"
import { ArrowUpRightIcon } from "lucide-react"

import { projectCategories, projects, projectsByDate } from "@/data/projects"
import { siteConfig } from "@/data/site-config"
import { Container } from "@/components/layout/section"
import { PageHeader } from "@/components/layout/page-header"
import { ProjectsExplorer } from "@/components/projects/projects-explorer"

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Retrieval systems, model-compression research, an offline AI tutor, live Formula 1 telemetry and handwriting OCR. Seven projects, five written up in full.",
  alternates: { canonical: `${siteConfig.url}/projects` },
}

export default function ProjectsPage() {
  const withCaseStudies = projects.filter((p) => p.detail).length

  return (
    <>
      <PageHeader
        title="Things I built end to end"
        lede="Every project here started as a problem I could not buy my way out of. The write-ups lead with the decision that was hard rather than the framework that was used."
        meta={
          <dl className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs">
            <div className="flex items-center gap-2">
              <dt className="text-muted-foreground">Projects</dt>
              <dd className="tabular-nums">{projects.length}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="text-muted-foreground">Case studies</dt>
              <dd className="tabular-nums">{withCaseStudies}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="text-muted-foreground">Categories</dt>
              <dd className="tabular-nums">{projectCategories.length}</dd>
            </div>
          </dl>
        }
      />

      <section className="pb-24 sm:pb-32">
        <Container>
          <ProjectsExplorer
            projects={projectsByDate}
            categories={projectCategories}
          />

          <div className="mt-20 border-t border-border pt-8">
            <a
              href={siteConfig.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Everything else on GitHub
              <ArrowUpRightIcon className="size-3.5" aria-hidden />
            </a>
          </div>
        </Container>
      </section>
    </>
  )
}
