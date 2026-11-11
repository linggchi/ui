/**
 * One status, one treatment — in the register and in the details view alike.
 *
 * Both screens held their own status-to-badge map until 2026-11-11, and both
 * mapped Superseded to the outline badge, which is also what the Category
 * badge uses. "Superseded · Controlled" in one row then read as two badges of
 * the same kind. The mapping lives here so a new status or a changed colour is
 * one edit, not a hunt.
 *
 * See `docs/rules/ui-hierarchy.md` §Badges and `app/globals.css`.
 */
export type DocumentStatusName =
  | "Approved"
  | "Draft"
  | "In Approval"
  | "In Review"
  | "Obsolete"
  | "Superseded";

type BadgeLook = {
  className?: string;
  variant: "error" | "info" | "secondary" | "success" | "warning";
};

const SUPERSEDED_CLASS =
  "border-transparent bg-[var(--accura-status-superseded-surface)] text-[var(--accura-status-superseded-text)]";

export function statusBadgeLook(status: DocumentStatusName): BadgeLook {
  if (status === "Approved") return { variant: "success" };
  if (status === "In Review") return { variant: "warning" };
  if (status === "In Approval") return { variant: "info" };
  if (status === "Obsolete") return { variant: "error" };
  if (status === "Superseded")
    return { className: SUPERSEDED_CLASS, variant: "secondary" };
  return { variant: "secondary" };
}
