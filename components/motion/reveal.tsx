"use client"

import { motion, useReducedMotion, type Variants } from "motion/react"
import type * as React from "react"

/**
 * The single source of animation on this site (spec.md section 4): fade in,
 * translate up 20px, 0.5s, children staggered by 0.1s. Centralised so timing
 * stays consistent across sections and so reduced-motion is honoured in one
 * place instead of five.
 *
 * The prop surface is deliberately tiny — className and nothing else. These
 * wrappers exist to animate, not to be a general-purpose div: forwarding the
 * full motion prop set would drag in DOM-element-specific event types that do
 * not survive the div/li split below.
 */
const EASE = [0.21, 0.47, 0.32, 0.98] as const

export const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

interface RevealProps {
  children?: React.ReactNode
  className?: string
  /** Wrap several <RevealItem>s to stagger them. */
  stagger?: boolean
}

export function Reveal({ children, className, stagger }: RevealProps) {
  const reduced = useReducedMotion()

  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger ? containerVariants : itemVariants}
      className={className}
      data-reveal
    >
      {children}
    </motion.div>
  )
}

interface RevealItemProps {
  children?: React.ReactNode
  className?: string
  /**
   * The element to render as. Defaults to a div.
   *
   * Pass "li" inside a <ul>/<ol>. A wrapper div sitting between the list and
   * its items breaks list semantics outright — axe flags both `list` and
   * `listitem`, and screen readers stop announcing the group as a list at all.
   * The animation has to live *on* the <li>, not around it.
   */
  as?: "div" | "li"
}

export function RevealItem({
  children,
  className,
  as = "div",
}: RevealItemProps) {
  const reduced = useReducedMotion()

  if (as === "li") {
    if (reduced) return <li className={className}>{children}</li>
    return (
      <motion.li variants={itemVariants} className={className} data-reveal>
        {children}
      </motion.li>
    )
  }

  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div variants={itemVariants} className={className} data-reveal>
      {children}
    </motion.div>
  )
}
