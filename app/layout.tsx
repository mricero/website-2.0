import type { Metadata, Viewport } from "next"
import { Archivo, Geist_Mono, Instrument_Sans } from "next/font/google"

import { languages } from "@/data/career"
import { siteConfig } from "@/data/site-config"
import { assetPath } from "@/lib/utils"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { BackToTop } from "@/components/layout/back-to-top"
import { BuildStage } from "@/components/motion/build/stage"
import { boot } from "@/lib/motion-config"

import "./globals.css"

/*
 * Three faces, three jobs. See the note in globals.css for why Geist Sans is
 * no longer among them.
 *
 * All three are variable fonts, so a weight range costs one file rather than
 * one file per weight, and next/font self-hosts them: no request ever leaves
 * for fonts.googleapis.com at runtime.
 */
/*
 * Archivo is loaded as the full variable font with its width axis, rather
 * than as three fixed weights, because the giant outlined word behind the
 * hero name (.text-mega) sets it at wdth 62, its narrowest. That is what lets
 * seven heavy capitals fit a 390px phone without a second display face.
 */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
})

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name}, ${siteConfig.title}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.metaDescription,
  keywords: [
    "Lukalapu Mohnish",
    "IISc Bengaluru",
    "Mathematics and Computing",
    "machine learning",
    "RAG",
    "retrieval augmented generation",
    "model compression",
    "vision transformers",
    "Lean 4",
    "formal verification",
    "Isaac Sim",
    "robotics simulation",
  ],
  authors: [{ name: siteConfig.name, url: siteConfig.socials.github }],
  creator: siteConfig.name,
  /**
   * Absolute, not "/". If metadataBase ever carries a path again (a project
   * site under /<repo>/), a root-relative "/" resolves against it by replacing
   * the whole path and points the canonical at the bare host instead.
   */
  alternates: { canonical: siteConfig.url },
  /**
   * Declared explicitly because Next emits the file-convention icon as a bare
   * "/icon", ignoring basePath, which 404s on a project-site deployment. The
   * generated file itself lands in the right place; only the link was wrong.
   */
  icons: {
    icon: [{ url: assetPath("/icon"), type: "image/png", sizes: "32x32" }],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name}, ${siteConfig.title}`,
    description: siteConfig.metaDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name}, ${siteConfig.title}`,
    description: siteConfig.metaDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
}

export const viewport: Viewport = {
  /* Matches the two --background tokens exactly, so mobile browser chrome
     continues the page rather than framing it. */
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f0ede9" },
    { media: "(prefers-color-scheme: dark)", color: "#090705" },
  ],
}

/**
 * Decides, before first paint, whether the home page plays its boot.
 *
 * Inline in <head> (the pattern next-themes uses for the theme class) so the
 * answer is on <html> before anything renders: no flash, and no component
 * ever branches on sessionStorage or a media query during render. "play" only
 * on the first view of the home page in a browser session and never under
 * reduced motion; "skip" everywhere else. Any failure (storage blocked, old
 * browser) lands on "skip", the safe answer.
 *
 * On "play" it also sets data-boot-hold, which keeps the hero's covers from
 * timing out while the page's scripts are still on their way (see
 * boot.holdGraceMs in lib/motion-config.ts): released after the load event
 * plus a grace period, at once on a script that fails to load, and at a hard
 * cap, after which the ordinary CSS failsafe runs.
 */
const homePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "")
const bootScript = `(function(){var d=document.documentElement,m="skip";try{var p=location.pathname;while(p.length>1&&p.charAt(p.length-1)==="/")p=p.slice(0,-1);if(p===${JSON.stringify(homePath || "/")}&&!sessionStorage.getItem("boot-seen")&&!matchMedia("(prefers-reduced-motion: reduce)").matches)m="play"}catch(e){}d.setAttribute("data-boot",m);if(m!=="play")return;d.setAttribute("data-boot-hold","");var r=function(){d.removeAttribute("data-boot-hold")};addEventListener("load",function(){setTimeout(r,${boot.holdGraceMs})});addEventListener("error",function(e){if(e.target&&e.target.tagName==="SCRIPT")r()},true);setTimeout(r,${boot.holdCapMs})})()`

/** Person schema, so search engines resolve the name to an entity. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteConfig.name,
  url: siteConfig.url,
  email: siteConfig.socials.emailAddress,
  jobTitle: "Undergraduate Researcher",
  description: siteConfig.metaDescription,
  knowsLanguage: [...languages],
  knowsAbout: [
    "Machine Learning",
    "Retrieval-Augmented Generation",
    "Model Compression",
    "Formal Verification",
    "Robotics Simulation",
  ],
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Indian Institute of Science, Bengaluru",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bengaluru",
    addressCountry: "IN",
  },
  sameAs: [siteConfig.socials.github, siteConfig.socials.linkedin],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      /*
       * Next 16 no longer overrides `scroll-behavior: smooth` during a route
       * change unless asked. Without this, every navigation scrolls to the
       * new page's top smoothly, the navbar's hide-on-scroll sees a downward
       * scroll, and the page lands a few hundred pixels down with the
       * navigation hidden. (See the Next 16 upgrade guide.)
       */
      data-scroll-behavior="smooth"
      // next-themes writes the theme class here; without suppressHydrationWarning
      // React logs a mismatch on every load, because the server cannot know it.
      suppressHydrationWarning
      className={`${archivo.variable} ${instrumentSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        {/*
          Below the fold, entrances are driven by an IntersectionObserver that
          stamps `data-revealed`, so those elements are served at opacity:0 and
          only become visible once the script runs. With scripting off they
          would never appear at all. This restores every one of them, along
          with the timeline branches, the skill bars and the scroll-written
          words, all of which start hidden for the same reason. Build covers
          and the build canvas go entirely: there is no engine to lift them.
        */}
        <noscript>
          <style>{`[data-reveal],[data-branch],[data-node],[data-bar]{opacity:1!important;transform:none!important;filter:none!important}[data-scrollwrite]>span{opacity:1!important}[data-stack-item]{position:static!important}[data-build-cover],[data-build-stage]{display:none!important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          /*
           * Light, unconditionally, on a first visit.
           *
           * `enableSystem` is deliberately OFF. With it on, `defaultTheme`
           * only decides what happens when the OS expresses no preference, so
           * anyone running a dark desktop (which is most people who would be
           * reading this site) would still land on dark and never see the
           * default at all.
           *
           * The toggle is still there and next-themes still persists the
           * choice under localStorage.theme, so this costs a returning reader
           * nothing. Set `enableSystem` to follow the OS instead.
           */
          defaultTheme="light"
          enableSystem={false}
          /*
           * The key is versioned because next-themes persists the reader's
           * theme and a stored value beats `defaultTheme` every time. Anyone
           * who visited while dark was the default still had "dark" sitting in
           * localStorage under the old key, so they kept landing on dark and
           * the new default never applied. Bumping the key retires those
           * stored values once; choices made from here persist normally.
           */
          storageKey="theme-2"
          disableTransitionOnChange
        >
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-sm focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
          >
            Skip to content
          </a>

          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <BackToTop />
        </ThemeProvider>

        {/*
          After everything else on purpose: effects run in tree order, so by
          the time the engine attaches every <Build> on the first page has
          registered and the boot has been requested.
        */}
        <BuildStage />

        <script
          type="application/ld+json"
          // Content is a local constant, not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  )
}
