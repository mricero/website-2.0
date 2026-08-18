import { ImageResponse } from "next/og"

import { siteConfig } from "@/data/site-config"

/**
 * Under `output: export` there is no server to generate this on request, so it
 * must be rendered once at build time and written out as a file.
 */
export const dynamic = "force-static"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0b",
          color: "#33d6a0",
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: "-0.05em",
          borderRadius: 6,
        }}
      >
        {siteConfig.initials}
      </div>
    ),
    size
  )
}
