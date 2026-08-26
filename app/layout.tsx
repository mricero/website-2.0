import type { Metadata, Viewport } from "next"
import { Archivo, Geist_Mono, Instrument_Sans } from "next/font/google"

import { languages } from "@/data/career"
import { siteConfig } from "@/data/site-config"
import { assetPath } from "@/lib/utils"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { BackToTop } from "@/components/layout/back-to-top"

import "./globals.css"

/*
 * Three faces, three jobs. See the note in globals.css for why Geist Sans is
 * no longer among them.
 *
 * All three are variable fonts, so a weight range costs one file rather than
 * one file per weight, and next/font self-hosts them: no request ever leaves
 * for fonts.googleapis.com at runtime.
 */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
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
   * Absolute, not "/". metadataBase now carries a path (/website-2.0), and a
   * root-relative "/" resolves against a URL base by replacing the whole path,
   * so "/" would emit https://mricero.github.io/ and point the canonical at
   * someone else's site root.
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
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#13100d" },
  ],
}

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
      // next-themes writes the theme class here; without suppressHydrationWarning
      // React logs a mismatch on every load, because the server cannot know it.
      suppressHydrationWarning
      className={`${archivo.variable} ${instrumentSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/*
          Below the fold, entrances are driven by an IntersectionObserver that
          stamps `data-revealed`, so those elements are served at opacity:0 and
          only become visible once the script runs. With scripting off they
          would never appear at all. This restores every one of them, along
          with the timeline branches, the skill bars and the scroll-written
          words, all of which start hidden for the same reason.
        */}
        <noscript>
          <style>{`[data-reveal],[data-branch],[data-node],[data-bar]{opacity:1!important;transform:none!important;filter:none!important}[data-scrollwrite]>span{opacity:1!important}[data-stack-item]{position:static!important}`}</style>
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

        <script
          type="application/ld+json"
          // Content is a local constant, not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  )
}
