"use client"

import {
  AwardIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  UsersIcon,
} from "lucide-react"

import type { Achievement, Course, TimelineEntry } from "@/types"
import { Reveal } from "@/components/motion/reveal"
import { Timeline } from "@/components/career/timeline"
import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@/components/ui/tabs"

/**
 * Four panels, matching the four sections the CV itself uses. Internships and
 * positions of responsibility are kept apart rather than merged into one
 * "experience" list, because they answer different questions: one is paid
 * engineering work, the other is what happens around the degree.
 */
interface CareerTabsProps {
  experience: TimelineEntry[]
  leadership: TimelineEntry[]
  education: TimelineEntry[]
  courses: Course[]
  achievements: Achievement[]
}

function Achievements({ items }: { items: Achievement[] }) {
  return (
    <ul className="border-t border-border">
      {items.map((item, i) => (
        <Reveal
          key={item.id}
          as="li"
          index={Math.min(i, 3)}
          className="grid items-baseline gap-x-8 gap-y-2 border-b border-border py-7 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)]"
        >
          <p className="font-display text-2xl font-semibold text-primary tabular-nums">
            {item.value}
          </p>
          <div>
            <h3 className="text-sm font-medium tracking-tight">
              {item.label}
              <span className="ml-3 font-mono text-xs font-normal text-muted-foreground tabular-nums">
                {item.year}
              </span>
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {item.detail}
            </p>
          </div>
        </Reveal>
      ))}
    </ul>
  )
}

/**
 * Coursework, grouped by area. Five rows with a hairline under each would be a
 * spec-sheet table, which is the laziest possible layout for a short list;
 * grouping them into three clusters says something the flat list does not,
 * namely which half of the degree each course belongs to.
 */
function Coursework({ items }: { items: Course[] }) {
  const areas = [...new Set(items.map((c) => c.area))]

  return (
    <section aria-labelledby="coursework-heading" className="mt-16">
      <h3 id="coursework-heading" className="label-mono">
        Undergraduate coursework
      </h3>
      <div className="mt-6 grid gap-px border border-border bg-border sm:grid-cols-3">
        {areas.map((area, i) => (
          <Reveal key={area} index={i} className="bg-background p-6">
            <p className="text-sm font-medium tracking-tight">{area}</p>
            <ul className="mt-3 space-y-1.5">
              {items
                .filter((c) => c.area === area)
                .map((c) => (
                  <li
                    key={c.name}
                    className="font-mono text-xs text-muted-foreground"
                  >
                    {c.name}
                  </li>
                ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export function CareerTabs({
  experience,
  leadership,
  education,
  courses,
  achievements,
}: CareerTabsProps) {
  return (
    <Tabs defaultValue="experience">
      <TabsList>
        <TabsIndicator />
        <TabsTab value="experience">
          <BriefcaseIcon aria-hidden />
          Internships
        </TabsTab>
        <TabsTab value="leadership">
          <UsersIcon aria-hidden />
          Positions
        </TabsTab>
        <TabsTab value="education">
          <GraduationCapIcon aria-hidden />
          Education
        </TabsTab>
        <TabsTab value="achievements">
          <AwardIcon aria-hidden />
          Results
        </TabsTab>
      </TabsList>

      {/*
        Each panel renders its own <Timeline>, so each gets its own ScrollSpine
        measuring its own container. Sharing one spine across four panels would
        leave the trunk sized to whichever panel happened to mount first.

        The sr-only headings exist because the entries inside are <h3>s:
        without an h2 between them and the page <h1>, the outline jumps a
        level. They also give each panel a spoken name as you tab through it.
      */}
      <TabsPanel value="experience">
        <h2 className="sr-only">Internships</h2>
        <Timeline entries={experience} />
      </TabsPanel>

      <TabsPanel value="leadership">
        <h2 className="sr-only">Positions of responsibility</h2>
        <Timeline entries={leadership} />
      </TabsPanel>

      <TabsPanel value="education">
        <h2 className="sr-only">Education</h2>
        <Timeline entries={education} />
        <Coursework items={courses} />
      </TabsPanel>

      <TabsPanel value="achievements">
        <h2 className="sr-only">Results</h2>
        <Achievements items={achievements} />
      </TabsPanel>
    </Tabs>
  )
}
