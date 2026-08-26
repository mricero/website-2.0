import Link from "next/link"
import { ArrowUpRightIcon, MailIcon } from "lucide-react"

import { navItems, siteConfig } from "@/data/site-config"
import { GitHubIcon, LinkedInIcon } from "@/components/icons"

/**
 * Three columns, not four.
 *
 * There used to be a fourth listing the four most recent projects, which is a
 * link farm: it duplicated /projects, went stale the moment the ordering
 * changed, and existed mainly to make the footer look substantial. A footer's
 * job is the primary navigation paths and a way to get in touch.
 */
const socials = [
  {
    label: "GitHub",
    handle: siteConfig.socials.githubHandle,
    href: siteConfig.socials.github,
    Icon: GitHubIcon,
    external: true,
  },
  {
    label: "LinkedIn",
    handle: siteConfig.socials.linkedinHandle,
    href: siteConfig.socials.linkedin,
    Icon: LinkedInIcon,
    external: true,
  },
  {
    label: "Email",
    handle: siteConfig.socials.emailAddress,
    href: siteConfig.socials.email,
    Icon: MailIcon,
    external: false,
  },
] as const

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="font-mono text-sm font-medium tracking-tight transition-colors hover:text-primary"
            >
              {siteConfig.initials}
              <span className="text-primary">.</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {siteConfig.role}
            </p>
          </div>

          <nav aria-labelledby="footer-pages">
            <h2 id="footer-pages" className="label-mono">
              Pages
            </h2>
            <ul className="mt-4 space-y-2.5">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="label-mono">Elsewhere</h2>
            <ul className="mt-4 space-y-2.5">
              {socials.map(({ label, handle, href, Icon, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    {...(external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="group inline-flex max-w-full items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Icon className="size-3.5 shrink-0" aria-hidden />
                    <span className="truncate">{handle}</span>
                    {external && (
                      <ArrowUpRightIcon
                        className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                        aria-hidden
                      />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 font-mono text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
          <p>{siteConfig.location}</p>
        </div>
      </div>
    </footer>
  )
}
