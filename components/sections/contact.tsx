import { ArrowUpRightIcon, MailIcon } from "lucide-react"

import { siteConfig } from "@/data/site-config"
import { Section } from "@/components/layout/section"
import { Reveal, RevealItem } from "@/components/motion/reveal"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const links = [
  { label: "GitHub", href: siteConfig.socials.github },
  { label: "LinkedIn", href: siteConfig.socials.linkedin },
] as const

export function ContactSection() {
  return (
    <Section id="contact" index="03" heading="Get in touch">
      <Reveal stagger>
        <RevealItem>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            Open to internships and research collaborations in machine learning,
            retrieval systems, and robotics. The fastest way to reach me is email.
          </p>
        </RevealItem>

        <RevealItem>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {/* mailto: — a link, not a button. See the note in hero.tsx. */}
            <a
              href={siteConfig.socials.email}
              className={cn(buttonVariants({ size: "lg" }))}
            >
              <MailIcon data-icon="inline-start" />
              {siteConfig.socials.emailAddress}
            </a>
          </div>
        </RevealItem>

        <RevealItem>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                  <ArrowUpRightIcon className="size-3" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </RevealItem>
      </Reveal>
    </Section>
  )
}
