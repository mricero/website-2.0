import { experiences } from "@/data/experience"
import { Section } from "@/components/layout/section"
import { Reveal, RevealItem } from "@/components/motion/reveal"
import { Badge } from "@/components/ui/badge"

export function ExperienceSection() {
  return (
    <Section
      id="work"
      index="01"
      heading="Experience"
      lede="Robotics and systems work alongside the degree."
    >
      <Reveal stagger>
        <ol className="relative border-l border-border pl-6 sm:pl-8">
          {experiences.map((item) => (
            <RevealItem
              key={item.id}
              as="li"
              className="relative pb-12 last:pb-0"
            >
                {/* The dot sits on the rule: half its width back, plus the 1px border. */}
                <span
                  className="absolute -left-[calc(1.5rem+4.5px)] top-2 size-2 rounded-full bg-primary ring-4 ring-background sm:-left-[calc(2rem+4.5px)]"
                  aria-hidden
                />

                <p className="font-mono text-xs text-muted-foreground">
                  {item.duration}
                </p>
                <h3 className="mt-2 text-lg font-medium tracking-tight">
                  {item.role}
                </h3>
                <p className="text-sm text-primary">{item.organization}</p>

                <ul className="mt-4 space-y-2">
                  {item.description.map((line) => (
                    <li
                      key={line}
                      className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                    >
                      <span
                        className="mt-2 size-1 shrink-0 rounded-full bg-border"
                        aria-hidden
                      />
                      {line}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {item.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="font-mono">
                      {skill}
                    </Badge>
                  ))}
                </div>
            </RevealItem>
          ))}
        </ol>
      </Reveal>
    </Section>
  )
}
