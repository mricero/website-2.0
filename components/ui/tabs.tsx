"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"

import { cn } from "@/lib/utils"

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-8", className)}
      {...props}
    />
  )
}

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        // relative, because the indicator positions itself against this box.
        // overflow-x-auto so a fourth or fifth tab scrolls on a narrow phone
        // rather than wrapping into a ragged second row.
        "relative isolate flex w-full max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-border bg-muted/40 p-1 sm:w-fit",
        className
      )}
      {...props}
    />
  )
}

function TabsTab({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-tab"
      className={cn(
        "relative z-10 inline-flex shrink-0 items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none select-none",
        "hover:text-foreground data-selected:text-foreground",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

/**
 * The sliding pill behind the active tab.
 *
 * Base UI publishes the active tab's geometry as CSS custom properties on this
 * element; translating and sizing from those is what lets the pill animate
 * between tabs instead of cutting. `renderBeforeHydration` writes the initial
 * position in a tiny inline script, so the pill already sits under the right
 * tab in the server-rendered HTML rather than snapping into place on hydration
 * — which matters here because the page is statically exported.
 */
function TabsIndicator({ className, ...props }: TabsPrimitive.Indicator.Props) {
  return (
    <TabsPrimitive.Indicator
      data-slot="tabs-indicator"
      renderBeforeHydration
      className={cn(
        "absolute top-1 left-0 z-0 h-[calc(100%-0.5rem)] w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] rounded-md bg-background shadow-sm ring-1 ring-border transition-[translate,width] duration-300 ease-out",
        className
      )}
      {...props}
    />
  )
}

function TabsPanel({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-panel"
      className={cn("outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTab, TabsIndicator, TabsPanel }
