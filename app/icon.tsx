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
          /*
           * Vermilion ground rather than paper. A 32px favicon sits on a
           * browser tab strip that is itself near-white in light mode, so a
           * paper-coloured mark would dissolve into it; the accent is the one
           * colour in the palette that reads at this size against either.
           * Hex, because Satori cannot resolve custom properties or oklch().
           */
          background: "#b14019",
          color: "#fbfaf7",
          fontSize: 17,
          fontWeight: 700,
          letterSpacing: "-0.05em",
          borderRadius: 5,
        }}
      >
        {siteConfig.initials}
      </div>
    ),
    size
  )
}
