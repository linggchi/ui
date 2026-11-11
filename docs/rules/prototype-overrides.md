# Accura Prototype Overrides

Accura deliberately departs from COSS and library defaults in the places listed
below. Each one is easy to lose when a file is regenerated, reformatted, or
rewritten from a generic template, because the surrounding code looks ordinary
and the default it replaces looks correct in isolation.

**Before rewriting any file in this table, read the owning rule and carry the
override forward.** If an override no longer serves its purpose, remove it
through a decision in
[`../change-log/DECISIONS.md`](../change-log/DECISIONS.md), not by regeneration.

This file is an index. It records *where* each override lives and *what it
replaces*; the reasoning belongs to the rule it links to.

## Current overrides

| Override | Lives in | Replaces | Owning rule |
|---|---|---|---|
| Iconoir icons render at stroke width 2 | `apps/accura-prototype/app/layout.tsx` (inline `<style>`) | Iconoir's 1.5 default | [`ui-hierarchy.md`](ui-hierarchy.md) — Icons |
| Icon-only buttons keep full-strength icons | `apps/accura-prototype/app/globals.css` | COSS dims every button icon to 80% | [`ui-hierarchy.md`](ui-hierarchy.md) — Icons |
| Table row actions use the 28 px icon button | `size="icon-sm"` on row action buttons in the prototype screens | The 24 px `icon-xs` used elsewhere | [`ui-hierarchy.md`](ui-hierarchy.md) — Icons |
| Underline tabs with Brand 950 selection | `apps/accura-prototype/components/accura-tabs.tsx` | The COSS segmented tab default | [`ui-hierarchy.md`](ui-hierarchy.md) — Tabs |
| Disabled inputs take the Zinc 100 recessed surface | `RECESSED_INPUT` in `apps/accura-prototype/components/accura-form.tsx` | COSS signals disabled with `opacity-64` alone | [`ui-hierarchy.md`](ui-hierarchy.md) — Form fields |
| Every form field is marked required or optional | `FormLabel` in `apps/accura-prototype/components/accura-form.tsx` | Marking only required fields | [`ui-hierarchy.md`](ui-hierarchy.md) — Form fields |
| One badge size: 22 px tall, 12 px text | `[data-slot="badge"]` in `apps/accura-prototype/app/globals.css` | COSS shrinking a badge to 18 px from `sm` up | [`ui-hierarchy.md`](ui-hierarchy.md) — Badges |
| The segmented control track is Zinc 200 | `SegmentedControl` className in `apps/accura-prototype/components/create-document-screen.tsx` | COSS's lighter `bg-muted` track | [`ui-hierarchy.md`](ui-hierarchy.md) — Navigation Selection |
| User rows render as an avatar, name, and email cluster | `UserIdentity` in the Settings screens | A plain name and email stack | [`user-identity.md`](user-identity.md) |
| A `Prototype · Viewing as` role switcher in the top bar | `apps/accura-prototype/components/prototype-role.tsx` | Nothing in the mockup — it exists only because authentication is not built | [`ui-hierarchy.md`](ui-hierarchy.md) — Gated actions and decision dialogs |

## Notes

- The Accura form conventions — `FormLabel`, `RECESSED_INPUT`, `SectionCard`
  and `SectionHeading` — live in
  `apps/accura-prototype/components/accura-form.tsx`. Import them; do not
  re-derive them in a screen. They were duplicated per screen until
  2026-11-10, which is exactly how a screen drifted off them.

- **Four shared modules now carry what more than one Documents screen needs.**
  Each exists because the same thing had been declared twice and the two
  copies drifted. Import from them; do not re-declare.

  | Module | Holds | What drifted before it |
  |---|---|---|
  | `accura-form.tsx` | `FormLabel`, `RECESSED_INPUT`, `SectionCard`, `SectionHeading`, `Hint` | Each screen's own section header and disabled-field treatment |
  | `document-directory.ts` | The people and departments list | The create form and the Draft editor each held a copy, with different members |
  | `document-status.ts` | Status → badge treatment | The register and the details view each mapped Superseded to `outline` |
  | `prototype-role.tsx` | `ProtoRole`, `PROTO_ROLES`, `canManage`, the switcher | The role was state in two screens, and the switcher rendered in both |

- The **role switcher is prototype chrome, not a permission model.** It is
  deliberately marked as such — a `Prototype` badge beside it — so it is never
  mistaken for a screen to build. It exists so that the eligibility gates in
  `US-012` to `US-016` can be demonstrated from both sides while there is no
  signed-in user. It sits in the **top bar**, beside the user it stands in
  for; it was inside the document screens until 2026-11-11, where it sat
  between a document's title and its workflow and read as part of the record.
  Delete it the moment real permissions arrive; do not grow features on it.

- `Input` applies its `className` to the wrapper span, not the inner `input`
  element, and styles the disabled state with `has-disabled:`. A `disabled:`
  class written on `Input` silently does nothing.
- The `endAddon` slot on `ComboboxChips` is **not** an override. It was added to
  the shared primitive in `packages/ui`, so it is available to every
  application and must be kept in sync through `bun run ui:sync` from
  `apps/ui`, never edited directly in `packages/ui`.
