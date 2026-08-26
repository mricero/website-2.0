import type { Metadata } from "next"
import { ArrowUpRightIcon, MailIcon, MapPinIcon } from "lucide-react"

import { languages } from "@/data/career"
import { siteConfig } from "@/data/site-config"
import { cn } from "@/lib/utils"
import { GitHubIcon, LinkedInIcon } from "@/components/icons"
import { Container } from "@/components/layout/section"
import { PageHeader } from "@/components/layout/page-header"
import { Reveal } from "@/components/motion/reveal"
import { ContactForm } from "@/components/contact/contact-form"
import { CopyEmail } from "@/components/contact/copy-email"
import { buttonVariants } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Open to internships and research collaborations in machine learning, retrieval systems and robotics. Email, GitHub and LinkedIn.",
  alternates: { canonical: `${siteConfig.url}/contact` },
}

const channels = [
  {
    label: "GitHub",
    handle: siteConfig.socials.githubHandle,
    detail: "Every project on this site, plus the ones that did not make it.",
    href: siteConfig.socials.github,
    Icon: GitHubIcon,
    external: true,
  },
  {
    label: "LinkedIn",
    handle: siteConfig.socials.linkedinHandle,
    detail: "Roles, timeline and the occasional update.",
    href: siteConfig.socials.linkedin,
    Icon: LinkedInIcon,
    external: true,
  },
  {
    label: "Email",
    handle: siteConfig.socials.emailAddress,
    detail: "The fastest route. I read everything.",
    href: siteConfig.socials.email,
    Icon: MailIcon,
    external: false,
  },
] as const

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Get in touch"
        lede="Open to internships and research collaborations in machine learning, retrieval systems and robotics, and happy to talk about any of the projects on this site."
        actions={
          <>
            <a
              href={siteConfig.socials.email}
              className={cn(buttonVariants({ size: "lg" }), "press")}
            >
              <MailIcon data-icon="inline-start" />
              {siteConfig.socials.emailAddress}
            </a>
            <CopyEmail email={siteConfig.socials.emailAddress} />
          </>
        }
      />

      <section className="pb-24 sm:pb-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
            {/*
              Not id="message" — the textarea inside the form already owns that
              id, and a duplicate breaks both `for` and `aria-labelledby`
              resolution, which is how a label silently stops being a label.
            */}
            <Reveal as="section" aria-labelledby="send-heading">
              <h2
                id="send-heading"
                className="label-mono"
              >
                Send a message
              </h2>
              <div className="mt-6">
                <ContactForm />
              </div>
            </Reveal>

            <aside className="space-y-8">
              <Reveal from="none">
                <h2 className="label-mono">
                  Elsewhere
                </h2>
                <ul className="mt-4 space-y-3">
                  {channels.map(
                    ({ label, handle, detail, href, Icon, external }) => (
                      <li key={label}>
                        <a
                          href={href}
                          {...(external
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                          className="surface surface-hover group flex gap-3 rounded-md p-4"
                        >
                          <Icon
                            className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                            aria-hidden
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5 text-sm font-medium tracking-tight">
                              {label}
                              {external && (
                                <ArrowUpRightIcon
                                  className="size-3 opacity-0 transition-opacity group-hover:opacity-100"
                                  aria-hidden
                                />
                              )}
                            </span>
                            <span className="mt-0.5 block truncate font-mono text-xs text-primary">
                              {handle}
                            </span>
                            <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground">
                              {detail}
                            </span>
                          </span>
                        </a>
                      </li>
                    )
                  )}
                </ul>
              </Reveal>

              <Reveal from="none">
                <h2 className="label-mono">Where</h2>
                <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPinIcon className="size-4 shrink-0" aria-hidden />
                  {siteConfig.location}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  On campus at IISc through {siteConfig.graduation}. Remote and
                  hybrid both work.
                </p>
              </Reveal>

              {/*
                From the CV. It belongs on this page rather than on the skills
                page: it is not a technical skill, it is information about how
                to have a conversation.
              */}
              <Reveal from="none">
                <h2 className="label-mono">Languages</h2>
                <ul className="mt-4 space-y-1.5">
                  {languages.map((language) => (
                    <li key={language} className="text-sm text-muted-foreground">
                      {language}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </aside>
          </div>
        </Container>
      </section>
    </>
  )
}
