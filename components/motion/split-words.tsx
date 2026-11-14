import { Fragment } from "react"

import { stagger } from "@/lib/motion-config"

interface SplitWordsProps {
  text: string
  /** Split into words (headings) or characters (the giant outlined word). */
  by?: "word" | "char"
  /** Seconds before the first piece rises. */
  delay?: number
  /** Seconds between pieces. Defaults to the word stagger. */
  step?: number
}

/**
 * A heading that rises out of its own line, one word at a time.
 *
 * A server component: the split happens at build time, so the full text is
 * in the HTML from the first byte, the heading's text content is unchanged
 * (the spaces between words are real text nodes), and nothing is measured on
 * the client. Each piece is an inline-block mask (.rise-w) with an inner span
 * that rises on a pure CSS keyframe, so there is nothing to hydrate and
 * nothing to mismatch. Reduced motion lands every piece on its final frame
 * through the global override in globals.css.
 */
export function SplitWords({
  text,
  by = "word",
  delay = 0,
  step = stagger.word,
}: SplitWordsProps) {
  const parts =
    by === "char" ? Array.from(text) : text.split(/\s+/).filter(Boolean)

  return (
    <>
      {parts.map((part, i) => (
        // The text never reorders, so the index is a stable key here.
        <Fragment key={i}>
          <span className="rise-w">
            <span style={{ animationDelay: `${(delay + i * step).toFixed(3)}s` }}>
              {part}
            </span>
          </span>
          {by === "word" && i < parts.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  )
}
