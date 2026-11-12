"use client";

import { FieldLabel } from "@coss/ui/components/field";
import {
  Popover,
  PopoverPopup,
  PopoverTrigger,
} from "@coss/ui/components/popover";
import { InfoCircle as InfoIcon } from "iconoir-react";
import type React from "react";

/**
 * The Accura form conventions, in one place.
 *
 * These were duplicated per screen until 2026-11-10, which is how the Create
 * Document screen ended up re-deriving them and getting them wrong. A
 * convention two screens could need belongs in a shared module, not in
 * whichever screen happened to need it first.
 *
 * Owning rules: docs/rules/ui-hierarchy.md — Form fields, Containers.
 * Overrides index: docs/rules/prototype-overrides.md.
 */

/**
 * A red asterisk marks required, "(Optional)" marks the rest, and every field
 * carries one or the other so absence is never ambiguous. Both markers sit in
 * a single child, because FieldLabel's `gap-2` would otherwise push the marker
 * away from the word it qualifies.
 */
export function FormLabel({
  children,
  optional,
}: {
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <FieldLabel>
      <span>
        {children}
        {optional ? (
          <span className="ms-1 font-normal text-muted-foreground">
            (Optional)
          </span>
        ) : (
          <span aria-hidden="true" className="ms-0.5 text-destructive">
            *
          </span>
        )}
      </span>
    </FieldLabel>
  );
}

/**
 * A disabled or read-only input changes surface rather than only dimming.
 * COSS signals disabled with `opacity-64` alone, which reads as an empty
 * editable field. `Input` applies `className` to its wrapper span and styles
 * the disabled state with `has-disabled:`, so a `disabled:` class written here
 * would silently do nothing.
 */
export const RECESSED_INPUT =
  "has-disabled:bg-[var(--accura-canvas)] has-disabled:opacity-100 has-disabled:*:text-muted-foreground";

/** Page canvas → card → content gives three readable planes. */
export function SectionCard({
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      className="overflow-hidden rounded-xl border bg-card shadow-xs"
      {...props}
    >
      {children}
    </section>
  );
}

/**
 * The ⓘ beside a section title. A Base UI tooltip opens on hover and focus but
 * not on click, so an icon that looks pressable did nothing when pressed — and
 * nothing at all on touch. A popover opens on click, which is what the control
 * looks like it promises.
 */
export function Hint({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            aria-label={`About ${label}`}
            className="inline-flex cursor-pointer text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
            type="button"
          >
            <InfoIcon aria-hidden="true" className="size-4" />
          </button>
        }
      />
      <PopoverPopup className="max-w-72 text-sm">{children}</PopoverPopup>
    </Popover>
  );
}

/**
 * A Zinc 50 header carries the title, an optional hint and the section action,
 * over a white body below one divider.
 *
 * Prefer `hint` over `description`. A paragraph under every title turns a form
 * into a wall of prose and pushes the first control down the page; a hint keeps
 * the rule one hover away, next to the thing it qualifies. Reserve either for
 * something the user cannot infer from the label and the control — never to
 * repeat them (docs/rules/ui-hierarchy.md — Form fields).
 */
/**
 * The band directly under a card's tab line, for a panel that owns an action
 * but has no filter row to put it on: what this tab is, on the left, and the
 * action, on the right, the two centred against each other.
 *
 * A tabbed card's heading holds the section name only. An action scoped to one
 * tab cannot sit up there — it would be absent on the other tab, which leaves
 * the heading row lurching between two layouts, and it would read as applying
 * to the whole section. Atlassian states the rule the other way round: what
 * applies to every tab goes above the tab line, what does not, goes below it.
 *
 * Where the panel already has a filter row, the action joins that row instead
 * and no description is written: a band carrying nothing but a sentence is a
 * divider the panel did not need.
 */
export function SectionToolbar({
  action,
  description,
}: {
  action?: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
      <p className="min-w-0 flex-1 text-muted-foreground text-sm">
        {description}
      </p>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function SectionHeading({
  action,
  description,
  hint,
  required,
  title,
}: {
  action?: React.ReactNode;
  description?: string;
  hint?: string;
  required?: boolean;
  title: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b bg-[var(--accura-zinc-50)] px-5 py-4.5">
      {/* min-w-0 + flex-1: without it a long description takes the full row
          and wraps the action onto a second line, left-aligned under the
          text. The action stays on the right and never shrinks. */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <h2 className="font-bold text-base leading-tight">
            {title}
            {required && (
              <span aria-hidden="true" className="ms-0.5 text-destructive">
                *
              </span>
            )}
          </h2>
          {hint && <Hint label={title}>{hint}</Hint>}
        </div>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
