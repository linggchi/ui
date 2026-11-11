"use client";

import { Badge } from "@coss/ui/components/badge";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@coss/ui/components/select";

/**
 * Who the prototype is pretending you are.
 *
 * `US-012` AC-01, `US-013` AC-01, `US-014` AC-01, `US-015` AC-01 and `US-016`
 * AC-01 all gate actions on the signed-in user's assignment and permission.
 * Authentication is not built, so the role below stands in for it — and it is
 * **prototype chrome**, not a screen from the mockup. See
 * `docs/rules/prototype-overrides.md`.
 */
export type ProtoRole =
  | "all-records"
  | "approver"
  | "author"
  | "read-only"
  | "reviewer";

/**
 * Each role is a **named person**, not an abstract capability.
 *
 * A QMS records who acted, so a prototype that says "you are the Assigned
 * Reviewer" while the top bar still shows Amit Kothari is telling the viewer
 * two different things at once. Switching the role switches the identity:
 * avatar, name and the line beneath it all follow.
 *
 * The names are the ones already in the seeded approval routes, so the person
 * the shell claims you are is a person the documents actually reference.
 */
export const PROTO_ROLES: {
  label: string;
  user: string;
  value: ProtoRole;
}[] = [
  { label: "Assigned Reviewer", user: "Sarah Johnson", value: "reviewer" },
  { label: "Assigned Approver", user: "Nina Patel", value: "approver" },
  { label: "Author", user: "Amit Kothari", value: "author" },
  {
    label: "Read and Write All Records",
    user: "Priya Shah",
    value: "all-records",
  },
  { label: "Read Only", user: "Ravi Patel", value: "read-only" },
];

export function roleIdentity(role: ProtoRole) {
  return PROTO_ROLES.find((item) => item.value === role) ?? PROTO_ROLES[0];
}

export const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

/**
 * `US-014` AC-01, `US-015` AC-01 and `US-016` AC-01: editing a Draft, starting
 * a revision and marking a document Obsolete belong to the Author or to a user
 * with Read and Write All Records. `US-016`'s exact permission is still an
 * open question in PRD-002.
 */
export const canManage = (role: ProtoRole) =>
  role === "all-records" || role === "author";

/**
 * It lives in the top bar, beside the signed-in user it is standing in for —
 * not inside the document screens, where it sat between the document's title
 * and its workflow and read as part of the record.
 */
export function RoleSwitcher({
  onRoleChange,
  role,
}: {
  onRoleChange: (role: ProtoRole) => void;
  role: ProtoRole;
}) {
  return (
    <div className="flex items-center gap-2 max-lg:hidden">
      <Badge variant="outline">Prototype</Badge>
      <Select
        items={PROTO_ROLES}
        onValueChange={(value) => onRoleChange(value as ProtoRole)}
        value={role}
      >
        <SelectTrigger aria-label="Viewing as" className="w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectPopup>
          {PROTO_ROLES.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
    </div>
  );
}
