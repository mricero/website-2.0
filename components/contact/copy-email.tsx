"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

/**
 * Copy-to-clipboard for the email address.
 *
 * `navigator.clipboard` requires a secure context. That covers the deployed
 * site and localhost, but not a page opened over plain http on a LAN address —
 * which is exactly how someone checks a static export from their phone. The
 * fallback keeps the button working there instead of failing silently.
 */
async function copy(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }

    const area = document.createElement("textarea")
    area.value = text
    area.setAttribute("readonly", "")
    area.style.position = "fixed"
    area.style.opacity = "0"
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand("copy")
    document.body.removeChild(area)
    return ok
  } catch {
    return false
  }
}

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )

  React.useEffect(() => () => clearTimeout(timer.current), [])

  const onClick = async () => {
    if (!(await copy(email))) return
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 font-mono text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {copied ? (
        <CheckIcon className="size-3.5 text-primary" aria-hidden />
      ) : (
        <CopyIcon className="size-3.5" aria-hidden />
      )}
      {/* aria-live so the confirmation is announced, not just seen. */}
      <span aria-live="polite">{copied ? "Copied" : "Copy address"}</span>
    </button>
  )
}
