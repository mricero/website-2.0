import type { Metadata } from "next"
import Link from "next/link"

import { experience, leadership } from "@/data/career"
import { projects } from "@/data/projects"
import { allSkills, skillCategories } from "@/data/skills"
import { siteConfig } from "@/data/site-config"
import { Container } from "@/components/layout/section"
import { PageHeader } from "@/components/layout/page-header"
import { SkillsExplorer } from "@/components/skills/skills-explorer"

export const metadata: Metadata = {
  title: "Skills",
  description:
    "Machine learning, systems engineering, robotics simulation and mathematics, with each skill linked to the project or role that demonstrates it.",
  alternates: { canonical: `${siteConfig.url}/skills` },
}

/**
 * Both lookup tables are resolved here rather than inside the explorer, so
 * that data/projects.ts (seven full case studies, most of the site's prose)
 * and data/career.ts never cross into the client bundle just to render a
 * handful of link labels.
 */
const projectTitles = Object.fromEntries(
  projects.map((p) => [p.id, p.title])
) as Record<string, string>

const roleTitles = Object.fromEntries(
  [...experience, ...leadership].map((r) => [r.id, r.organization])
) as Record<string, string>

export default function SkillsPage() {
  return (
    <>
      <PageHeader
        title="What I actually know how to do"
        lede="Levels here are self-assessed, so they are reported as bands rather than as percentages. What is not self-assessed is the evidence: most rows link to the project or the internship where the skill did real work."
        meta={
          <dl className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs">
            <div className="flex items-center gap-2">
              <dt className="text-muted-foreground">Areas</dt>
              <dd className="tabular-nums">{skillCategories.length}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="text-muted-foreground">Skills</dt>
              <dd className="tabular-nums">{allSkills.length}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="text-muted-foreground">Currently learning</dt>
              <dd className="tabular-nums">
                {allSkills.filter((s) => s.learning).length}
              </dd>
            </div>
          </dl>
        }
      />

      <section className="pb-24 sm:pb-32">
        <Container>
          <SkillsExplorer
            categories={skillCategories}
            projectTitles={projectTitles}
            roleTitles={roleTitles}
          />

          <p className="mt-20 border-t border-border pt-8 text-sm text-muted-foreground">
            The work behind these lives in{" "}
            <Link
              href="/projects"
              className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary/50"
            >
              seven projects
            </Link>
            , five of them written up in full.
          </p>
        </Container>
      </section>
    </>
  )
}
