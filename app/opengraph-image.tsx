import { ImageResponse } from "next/og"

import { siteConfig } from "@/data/site-config"

/**
 * Under `output: export` there is no server to generate this on request, so it
 * must be rendered once at build time and written out as a file.
 */
export const dynamic = "force-static"

export const alt = `${siteConfig.name} — ${siteConfig.title}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0b",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#33d6a0",
            }}
          />
          <div style={{ fontSize: 24, color: "#a1a1aa", letterSpacing: "-0.01em" }}>
            {siteConfig.location}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 82,
              fontWeight: 700,
              color: "#fafafa",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
            }}
          >
            {siteConfig.name}
          </div>
          <div
            style={{
              marginTop: 20,
              fontSize: 34,
              color: "#33d6a0",
              letterSpacing: "-0.02em",
            }}
          >
            {siteConfig.title}
          </div>
        </div>

        <div style={{ display: "flex", gap: 28, fontSize: 22, color: "#71717a" }}>
          <div style={{ display: "flex" }}>Retrieval systems</div>
          <div style={{ display: "flex" }}>·</div>
          <div style={{ display: "flex" }}>Model compression</div>
          <div style={{ display: "flex" }}>·</div>
          <div style={{ display: "flex" }}>Computer vision</div>
        </div>
      </div>
    ),
    size
  )
}
