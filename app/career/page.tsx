import type { Metadata } from "next"
import Link from "next/link"

import {
  achievements,
  courses,
  education,
  experience,
  leadership,
} from "@/data/career"
import { siteConfig } from "@/data/site-config"
import { Container } from "@/components/layout/section"
import { PageHeader } from "@/components/layout/page-header"
import { CareerTabs } from "@/components/career/career-tabs"

export const metadata: Metadata = {
  title: "Career",
  description:
    "Two internships, three positions of responsibility and a B.Tech in Mathematics and Computing at IISc Bengaluru, with the results that got me there.",
  alternates: { canonical: `${siteConfig.url}/career` },
}

export default function CareerPage() {
  const active = [...experience, ...leadership].filter((e) => e.current).length

  return (
    <>
      <PageHeader
        title="How I got here, in order"
        lede="Two internships, three positions and three qualifications. The rover work and the festival operations both run in parallel with the degree, which is most of why the last two years look busy."
        meta={
          <dl className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs">
            <div className="flex items-center gap-2">
              <dt className="text-muted-foreground">Internships</dt>
              <dd className="tabular-nums">{experience.length}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="text-muted-foreground">Currently active</dt>
              <dd className="tabular-nums">{active}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="text-muted-foreground">Graduating</dt>
              <dd className="tabular-nums">{siteConfig.graduation}</dd>
            </div>
          </dl>
        }
      />

      <section className="pb-24 sm:pb-32">
        <Container>
          <CareerTabs
            experience={experience}
            leadership={leadership}
            education={education}
            courses={courses}
            achievements={achievements}
          />

          <p className="mt-20 border-t border-border pt-8 text-sm text-muted-foreground">
            The technical side of all this is on the{" "}
            <Link
              href="/projects"
              className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary/50"
            >
              projects page
            </Link>
            .
          </p>
        </Container>
      </section>
    </>
  )
}
