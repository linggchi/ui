"use client";

import {
  Tabs as CossTabs,
  TabsList as CossTabsList,
  TabsPanel as CossTabsPanel,
  TabsTab as CossTabsTab,
} from "@coss/ui/components/tabs";
import { cn } from "@coss/ui/lib/utils";
import type { ComponentProps } from "react";

export function Tabs({ className, ...props }: ComponentProps<typeof CossTabs>) {
  return <CossTabs className={cn("gap-0", className)} {...props} />;
}

export function TabsList({
  className,
  ...props
}: Omit<ComponentProps<typeof CossTabsList>, "variant">) {
  return (
    <CossTabsList
      className={cn(
        // px-2 so a tab's own px-3 lands its label on the 20px gutter the
        // heading band and the table's first column already use.
        //
        // Top padding only: the gap belongs between the heading band and the
        // tabs. Below them the underline has to stay close to the row's
        // bottom edge, so the base 4px is left alone.
        //
        // It has to be written as the same data variant the COSS underline
        // tabs use. A plain `pt-3` loses to their
        // `data-[orientation=horizontal]:py-1` on specificity, so the row
        // stays 4px and the change looks like it did nothing.
        "w-full justify-start border-b px-2 data-[orientation=horizontal]:pt-3 [&_[data-slot=tab-indicator]]:bg-[var(--accura-brand-950-darkshade)]",
        className,
      )}
      variant="underline"
      {...props}
    />
  );
}

export function TabsTab({
  className,
  ...props
}: ComponentProps<typeof CossTabsTab>) {
  return (
    <CossTabsTab
      className={cn(
        "h-10 grow-0 px-3 text-muted-foreground hover:bg-transparent! hover:text-[var(--accura-brand-950-darkshade)] data-active:text-[var(--accura-brand-950-darkshade)]",
        className,
      )}
      {...props}
    />
  );
}

export function TabsPanel({
  className,
  ...props
}: ComponentProps<typeof CossTabsPanel>) {
  return <CossTabsPanel className={className} {...props} />;
}
