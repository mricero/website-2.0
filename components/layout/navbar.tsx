"use client"

import * as React from "react"
import Link from "next/link"
import { MenuIcon } from "lucide-react"
import { motion, useMotionValueEvent, useScroll } from "motion/react"

import { navItems, siteConfig } from "@/data/site-config"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function Navbar() {
  const { scrollY } = useScroll()
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
    setHidden(latest > previous && latest > 120)
  })

  return (
    <motion.header
      variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed inset-x-0 top-0 z-50"
      data-scrolled={scrolled}
    >
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <nav
          aria-label="Primary"
          className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6"
        >
          <Link
            href="#top"
            className="font-mono text-sm font-medium tracking-tight transition-colors hover:text-primary"
          >
            {siteConfig.initials}
            <span className="text-primary">.</span>
          </Link>

          <ul className="hidden items-center gap-8 md:flex">
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
              <SheetContent side="right" className="w-64">
                <SheetHeader>
                  <SheetTitle className="font-mono text-sm">Navigation</SheetTitle>
                </SheetHeader>
                <ul className="flex flex-col gap-1 px-2">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </motion.header>
  )
}
