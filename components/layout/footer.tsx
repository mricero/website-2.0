import Link from "next/link"
import { ArrowUpRightIcon, MailIcon } from "lucide-react"

import { navItems, siteConfig } from "@/data/site-config"
import { GitHubIcon, LinkedInIcon } from "@/components/icons"
import { Build } from "@/components/motion/build/build"

/**
 * Three columns, not four.
 *
 * There used to be a fourth listing the four most recent projects, which is a
 * link farm: it duplicated /projects, went stale the moment the ordering
 * changed, and existed mainly to make the footer look substantial. A footer's
 * job is the primary navigation paths and a way to get in touch.
 *
 * Every piece builds on arrival like the rest of the site: the intro column,
 * each heading, each link row and each line of the base strip are their own
 * blocks. The rows are built rather than their lists, so no Build sits inside
 * another. Never part of the home boot; the footer is never above the fold.
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
          <Build>
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
          </Build>

          <nav aria-labelledby="footer-pages">
            <Build label="pages">
              <h2 id="footer-pages" className="label-mono">
                Pages
              </h2>
            </Build>
            <ul className="mt-4 space-y-2.5">
              {navItems.map((item) => (
                <Build
                  as="li"
                  key={item.href}
                  label={item.label.toLowerCase()}
                >
                  <Link
                    href={item.href}
                    className="link-draw text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </Build>
              ))}
            </ul>
          </nav>

          <div>
            <Build label="elsewhere">
              <h2 className="label-mono">Elsewhere</h2>
            </Build>
            <ul className="mt-4 space-y-2.5">
              {socials.map(({ label, handle, href, Icon, external }) => (
                <Build as="li" key={label} label={label.toLowerCase()}>
                  <a
                    href={href}
                    {...(external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="link-draw group inline-flex max-w-full items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
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
                </Build>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 font-mono text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <Build as="p">
            © {new Date().getFullYear()} {siteConfig.name}
          </Build>
          <Build as="p">{siteConfig.location}</Build>
        </div>
      </div>
    </footer>
  )
}
