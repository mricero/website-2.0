import { ImageResponse } from "next/og"

import { focusAreas, siteConfig } from "@/data/site-config"

/**
 * Under `output: export` there is no server to generate this on request, so it
 * must be rendered once at build time and written out as a file.
 *
 * The colours are the light theme's tokens resolved to hex, because Satori
 * cannot read CSS custom properties or oklch(). They are hard-coded here and
 * therefore have to be changed alongside :root in globals.css:
 *
 *   #fbfaf7  --background        paper
 *   #231d19  --foreground        warm graphite
 *   #6b635d  --muted-foreground
 *   #b14019  --primary           vermilion
 *   #e3dfda  --border
 */
export const dynamic = "force-static"

export const alt = `${siteConfig.name}, ${siteConfig.title}`
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
          background: "#fbfaf7",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 28, height: 3, background: "#b14019" }} />
          <div
            style={{ fontSize: 24, color: "#6b635d", letterSpacing: "-0.01em" }}
          >
            {siteConfig.location}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 86,
              fontWeight: 700,
              color: "#231d19",
              letterSpacing: "-0.04em",
              lineHeight: 1.02,
            }}
          >
            {siteConfig.name}
          </div>
          <div
            style={{
              marginTop: 20,
              fontSize: 34,
              color: "#b14019",
              letterSpacing: "-0.02em",
            }}
          >
            {siteConfig.title}
          </div>
        </div>

        {/*
          Columns separated by space and a hairline, not by a row of middle
          dots. The dot is rationed to one per line and this had two.
        */}
        <div
          style={{
            display: "flex",
            gap: 40,
            fontSize: 22,
            color: "#6b635d",
            borderTop: "1px solid #e3dfda",
            paddingTop: 28,
          }}
        >
          {focusAreas.map((area) => (
            <div key={area} style={{ display: "flex" }}>
              {area}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  )
}
