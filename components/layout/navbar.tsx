"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MenuIcon } from "lucide-react"
import { motion, useMotionValueEvent, useScroll, useSpring } from "motion/react"

import { navItems, siteConfig } from "@/data/site-config"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

/**
 * `trailingSlash: true` in next.config.ts means usePathname() returns "/skills/"
 * in the exported build and "/skills" in dev. Comparing raw strings would light
 * up the wrong tab in exactly one of those two environments — the kind of bug
 * that only shows up after deploy.
 */
function normalise(path: string) {
  return path !== "/" && path.endsWith("/") ? path.slice(0, -1) : path
}

function isActive(pathname: string, href: string) {
  const here = normalise(pathname)
  if (href === "/") return here === "/"
  // A case study at /projects/kurt should still light up "Projects".
  return here === href || here.startsWith(`${href}/`)
}

export function Navbar() {
  const pathname = usePathname()
  const { scrollY, scrollYProgress } = useScroll()
  const [hidden, setHidden] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)

  // Reading scroll through a motion value rather than a state-per-frame handler:
  // setHidden only fires when the boolean actually flips, so the tree re-renders
  // a handful of times per session instead of on every scroll event.
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0
    setScrolled(latest > 8)
    if (menuOpen) return
    setHidden(latest > previous && latest > 140)
  })

  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  })

  /*
   * A route change while the bar is hidden would leave the new page with no
   * navigation until the reader scrolled up to go find it, and would leave the
   * mobile sheet open over the wrong page.
   *
   * Adjusted during render against the previous pathname rather than in an
   * effect: React re-runs this component immediately with the corrected state
   * and never commits the stale frame, whereas an effect would paint the hidden
   * navbar once and then correct it.
   */
  const [lastPath, setLastPath] = React.useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setHidden(false)
    setMenuOpen(false)
  }

  return (
    <motion.header
      variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      // z-index comes from the scale declared in globals.css rather than being
      // invented here; --z-nav sits below the overlay and the grain layers.
      style={{ zIndex: "var(--z-nav)" }}
      className="fixed inset-x-0 top-0"
      data-scrolled={scrolled}
    >
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <nav
          aria-label="Primary"
          className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6"
        >
          <Link
            href="/"
            aria-label={`${siteConfig.name}, home`}
            className="font-mono text-sm font-medium tracking-tight transition-colors hover:text-primary"
          >
            {siteConfig.initials}
            <span className="text-primary">.</span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative rounded-md px-3 py-2 text-sm transition-colors",
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                    {active && (
                      /*
                       * layoutId lets Framer interpolate this underline between
                       * the two <li>s across a route change, so it slides to the
                       * new tab instead of disappearing and reappearing.
                       */
                      <motion.span
                        layoutId="nav-active"
                        aria-hidden
                        className="absolute inset-x-3 -bottom-px h-px bg-primary"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="flex items-center gap-1">
            <ThemeToggle />

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Open navigation menu"
                  />
                }
              >
                <MenuIcon />
              </SheetTrigger>
              <SheetContent side="right" className="w-[17rem]">
                <SheetHeader>
                  <SheetTitle className="font-mono text-sm">Navigation</SheetTitle>
                </SheetHeader>
                <ul className="flex flex-col gap-0.5 px-2">
                  {navItems.map((item) => {
                    const active = isActive(pathname, item.href)
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          onClick={() => setMenuOpen(false)}
                          className={cn(
                            "block rounded-md px-3 py-2.5 transition-colors hover:bg-muted",
                            active && "bg-muted"
                          )}
                        >
                          {/* A short accent rule marks the current page rather
                              than a coloured dot. aria-current already carries
                              the fact; this is the visual half of it. */}
                          <span className="flex items-center gap-2 text-sm font-medium">
                            {active && (
                              <span
                                className="h-px w-3 shrink-0 bg-primary"
                                aria-hidden
                              />
                            )}
                            {item.label}
                          </span>
                          {item.description && (
                            <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                              {item.description}
                            </span>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </SheetContent>
            </Sheet>
          </div>
        </nav>

        {/*
          Reading progress, on the navbar's bottom edge so it reads as part of
          the chrome rather than as a second floating element. Faded out until
          the page has actually been scrolled, or it would render as a permanent
          hairline of accent colour at every page top.
        */}
        <motion.div
          aria-hidden
          style={{ scaleX: progress }}
          className={cn(
            "h-px origin-left bg-primary transition-opacity duration-300",
            scrolled ? "opacity-100" : "opacity-0"
          )}
        />
      </div>
    </motion.header>
  )
}
