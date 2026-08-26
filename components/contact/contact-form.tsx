"use client"

import * as React from "react"
import { SendIcon } from "lucide-react"

import { siteConfig } from "@/data/site-config"
import { cn } from "@/lib/utils"

/**
 * A contact form on a statically exported site has no server to POST to, so it
 * needs a form backend or it needs to be honest about doing nothing.
 *
 * This does both, in that order:
 *
 *  - With `siteConfig.contactFormKey` set, it POSTs to Web3Forms, which
 *    forwards the submission to the address the key is bound to. That is the
 *    email alert. Free tier is 250 a month.
 *  - With no key, it falls back to composing the message in the visitor's own
 *    mail client and says so on screen, rather than implying a send that never
 *    happens.
 *
 * The fallback also doubles as the failure path. If the request errors, the
 * visitor is offered the mailto: link with everything they typed already in
 * it, so a service outage never costs them their message. That is the part
 * most form integrations skip.
 */

const ENDPOINT = "https://api.web3forms.com/submit"

interface Fields {
  name: string
  email: string
  subject: string
  message: string
}

type Errors = Partial<Record<keyof Fields, string>>
type Status = "idle" | "sending" | "sent" | "error"

const EMPTY: Fields = { name: "", email: "", subject: "", message: "" }

function validate(values: Fields): Errors {
  const errors: Errors = {}

  if (!values.name.trim()) errors.name = "Please add your name."

  if (!values.email.trim()) {
    errors.email = "Please add an email address."
  } else if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    // Deliberately loose. Anything stricter starts rejecting valid addresses,
    // and the real validation is whether the reply arrives.
    errors.email = "That does not look like an email address."
  }

  if (!values.message.trim()) {
    errors.message = "Please write a message."
  } else if (values.message.trim().length < 10) {
    errors.message = "A little more detail would help."
  }

  return errors
}

/** The same message, addressed to a mail client. Fallback and failure path. */
function mailtoHref(values: Fields) {
  const subject = values.subject.trim() || `Message from ${values.name.trim()}`
  const body = `${values.message.trim()}\n\n--\n${values.name.trim()}\n${values.email.trim()}`
  return `mailto:${siteConfig.socials.emailAddress}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="label-mono block">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-xs text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  )
}

/*
 * --border-strong, not --border. A field's outline is the only thing telling a
 * sighted reader where it starts and stops, which puts it under WCAG 1.4.11 at
 * 3:1 against the page. The hairline --border used for dividers is nowhere
 * near that, by design.
 */
const inputClass =
  "w-full rounded-md border border-border-strong bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/80 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:opacity-60"

export function ContactForm() {
  const [values, setValues] = React.useState<Fields>(EMPTY)
  const [errors, setErrors] = React.useState<Errors>({})
  const [status, setStatus] = React.useState<Status>("idle")
  const [failure, setFailure] = React.useState("")

  const key = siteConfig.contactFormKey
  const canSend = key.length > 0
  const busy = status === "sending"

  const update =
    (field: keyof Fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }))
      // Clear the error as soon as they start fixing it; leaving it up while
      // someone types is the most irritating form behaviour there is.
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
      if (status === "error") setStatus("idle")
    }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (busy) return

    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      // Move focus to the first problem, so a keyboard user is not left
      // hunting for what went wrong.
      document.getElementById(Object.keys(found)[0])?.focus()
      return
    }

    // No key configured: hand off to the mail client, as before.
    if (!canSend) {
      window.location.href = mailtoHref(values)
      setStatus("sent")
      return
    }

    setStatus("sending")
    setFailure("")

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: key,
          name: values.name.trim(),
          email: values.email.trim(),
          subject:
            values.subject.trim() || `Message from ${values.name.trim()}`,
          message: values.message.trim(),
          // What the notification is *from*, and who hitting reply answers.
          from_name: `${siteConfig.name} website`,
          replyto: values.email.trim(),
          // Honeypot. Always empty for a human; see the field below.
          botcheck: "",
        }),
      })

      const data = (await res.json().catch(() => null)) as {
        success?: boolean
        message?: string
      } | null

      if (res.ok && data?.success) {
        setValues(EMPTY)
        setStatus("sent")
        return
      }

      setFailure(data?.message ?? `The form service returned ${res.status}.`)
      setStatus("error")
    } catch {
      // Offline, blocked by an extension, DNS, anything. The visitor does not
      // care which; they care that their message still has somewhere to go.
      setFailure("Could not reach the form service.")
      setStatus("error")
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {/*
        Honeypot. Positioned off-screen rather than display:none, because the
        bots that matter check for display:none and skip the field. Hidden from
        assistive technology and taken out of the tab order so a real person
        never lands on it.
      */}
      <div
        className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
        aria-hidden
      >
        <label htmlFor="botcheck">Leave this field empty</label>
        <input
          id="botcheck"
          name="botcheck"
          type="checkbox"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Name" error={errors.name}>
          <input
            id="name"
            name="name"
            value={values.name}
            onChange={update("name")}
            autoComplete="name"
            disabled={busy}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={inputClass}
            placeholder="Ada Lovelace"
          />
        </Field>

        <Field id="email" label="Email" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            value={values.email}
            onChange={update("email")}
            autoComplete="email"
            disabled={busy}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={inputClass}
            placeholder="you@example.com"
          />
        </Field>
      </div>

      <Field id="subject" label="Subject (optional)">
        <input
          id="subject"
          name="subject"
          value={values.subject}
          onChange={update("subject")}
          disabled={busy}
          className={inputClass}
          placeholder="Internship in computer vision"
        />
      </Field>

      <Field id="message" label="Message" error={errors.message}>
        <textarea
          id="message"
          name="message"
          rows={6}
          value={values.message}
          onChange={update("message")}
          disabled={busy}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={cn(inputClass, "resize-y")}
          placeholder="What are you working on?"
        />
      </Field>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={busy}
          className="press inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-60"
        >
          <SendIcon className="size-4" aria-hidden />
          {busy ? "Sending" : canSend ? "Send message" : "Compose email"}
        </button>

        {/*
          One live region for every outcome, so a screen reader hears the
          result without the focus moving out from under them.
        */}
        <p
          aria-live="polite"
          className={cn(
            "text-xs leading-relaxed",
            status === "error" ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {status === "sending" && "Sending your message."}

          {status === "sent" &&
            (canSend
              ? "Sent. I read everything and will reply to the address you gave."
              : "Handed to your email client. Press send there to deliver it.")}

          {status === "idle" &&
            (canSend
              ? "Goes straight to my inbox. I read everything."
              : "This opens your email client with the message ready. Nothing is sent from this page.")}

          {status === "error" && (
            <>
              {failure} Your message is safe.{" "}
              <a
                href={mailtoHref(values)}
                className="underline decoration-destructive/50 underline-offset-4 hover:decoration-destructive"
              >
                Send it by email instead
              </a>
              .
            </>
          )}
        </p>
      </div>
    </form>
  )
}
