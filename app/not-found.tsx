import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { navItems } from "@/data/site-config"
import { cn } from "@/lib/utils"
import { Container } from "@/components/layout/section"
import { PageHeader } from "@/components/layout/page-header"
import { buttonVariants } from "@/components/ui/button"

/**
 * A 404 that offers somewhere to go rather than an apology.
 *
 * Note there is no `metadata` export here: on a static export this page is
 * emitted as 404.html and served for any unmatched path, so its title falls
 * back to the layout default — which is the right one, since the URL that
 * produced it is unknowable at build time.
 */
export default function NotFound() {
  return (
    <>
      <PageHeader
        eyebrow="404"
        title="This page does not exist"
        lede="The link is wrong, or something moved. Both are fixable. Here is everything that does exist."
        actions={
          <Link href="/" className={cn(buttonVariants({ size: "lg" }))}>
            Back home
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        }
      />

      <section className="pb-24 sm:pb-32">
        <Container>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {navItems
              .filter((item) => item.href !== "/")
              .map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="surface surface-hover group block h-full rounded-md p-6"
                  >
                    <span className="flex items-center gap-1.5 text-sm font-medium tracking-tight transition-colors group-hover:text-primary">
                      {item.label}
                      <ArrowRightIcon
                        className="size-3.5 transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </span>
                    {item.description && (
                      <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
          </ul>
        </Container>
      </section>
    </>
  )
}
