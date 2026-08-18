import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { siteConfig } from "@/data/site-config"
import { assetPath } from "@/lib/utils"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
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
    default: `${siteConfig.name} — ${siteConfig.title}`,
    template: `%s — ${siteConfig.name}`,
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
    "computer vision",
    "robotics",
  ],
  authors: [{ name: siteConfig.name, url: siteConfig.socials.github }],
  creator: siteConfig.name,
  /**
   * Absolute, not "/". metadataBase now carries a path (/website-2.0), and a
   * root-relative "/" resolves against a URL base by replacing the whole path —
   * so "/" would emit https://mricero.github.io/ and point the canonical at
   * someone else's site root.
   */
  alternates: { canonical: siteConfig.url },
  /**
   * Declared explicitly because Next emits the file-convention icon as a bare
   * "/icon", ignoring basePath — which 404s on a project-site deployment. The
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
    title: `${siteConfig.name} — ${siteConfig.title}`,
    description: siteConfig.metaDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.title}`,
    description: siteConfig.metaDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
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
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Indian Institute of Science, Bengaluru",
  },
  address: { "@type": "PostalAddress", addressLocality: "Bengaluru", addressCountry: "IN" },
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/*
          Below the fold, section entrances are Framer-driven, so those elements
          are served at opacity:0 and only become visible once React hydrates.
          With scripting off they would never appear at all. A stylesheet
          !important beats an inline style that lacks it, so this restores them.
        */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
          >
            Skip to content
          </a>

          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
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
