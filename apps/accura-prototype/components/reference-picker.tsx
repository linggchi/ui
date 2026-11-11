"use client";

import { Badge } from "@coss/ui/components/badge";
import { Button } from "@coss/ui/components/button";
import { Input } from "@coss/ui/components/input";
import { Xmark as XIcon } from "iconoir-react";
import { useId, useState } from "react";

/**
 * A document that can be linked, and the status that decides whether it can.
 */
export type ReferenceCandidate = {
  id: string;
  name: string;
  status: string;
  version: string;
};

export type ReferenceLink = {
  id: string;
  name: string;
  version: string;
};

/**
 * Which statuses can be cited.
 *
 * The mockup's own words are "Link available documents in Draft, In Review, or
 * Approved status", and **Superseded is added to that list** by decision on
 * 2026-11-11: a Superseded version stays the one to follow until its successor
 * takes effect, so a document written during that window has to be able to
 * cite it. See `docs/change-log/DECISIONS.md`.
 *
 * Still excluded:
 * - **Obsolete** — `US-016` AC-04 puts it beyond active use or linking.
 * - **In Approval** — the mockup leaves it out, so the rule is not simply
 *   "everything that is not closed". Not yet confirmed with the BA.
 */
const LINKABLE_STATUSES = new Set([
  "Approved",
  "Draft",
  "In Review",
  "Superseded",
]);

const MAX_RESULTS = 6;

export function ReferencePicker({
  canEdit,
  candidates,
  excludeId,
  label,
  onChange,
  selected,
}: {
  canEdit: boolean;
  candidates: ReferenceCandidate[];
  /** The document being edited: it must not cite itself. */
  excludeId?: string;
  label: string;
  onChange: (next: ReferenceLink[]) => void;
  selected: ReferenceLink[];
}) {
  const [query, setQuery] = useState("");
  const listId = useId();
  const term = query.trim().toLowerCase();

  const results = term
    ? candidates
        .filter((candidate) => {
          if (candidate.id === excludeId) return false;
          if (!LINKABLE_STATUSES.has(candidate.status)) return false;
          // US-015 AC-03: never the same document and version twice.
          if (
            selected.some(
              (item) =>
                item.id === candidate.id && item.version === candidate.version,
            )
          )
            return false;
          return (
            candidate.id.toLowerCase().includes(term) ||
            candidate.name.toLowerCase().includes(term)
          );
        })
        .slice(0, MAX_RESULTS)
    : [];

  const add = (candidate: ReferenceCandidate) => {
    onChange([
      ...selected,
      {
        id: candidate.id,
        name: candidate.name,
        version: candidate.version,
      },
    ]);
    setQuery("");
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="font-semibold text-sm">{label}</p>

      {/* "None linked." answers a question the reader of a saved document is
          asking. While editing, the search field underneath already says the
          list is empty and what to do about it, so the line is noise. */}
      {selected.length === 0 && !canEdit && (
        <p className="text-muted-foreground text-xs">None linked.</p>
      )}
      {selected.length > 0 && (
        <ul className="flex flex-col gap-0.5">
          {selected.map((item) => (
            <li
              className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-secondary/40"
              key={`${item.id}-${item.version}`}
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate font-medium text-[var(--accura-brand-900)] text-sm">
                  {item.name}
                </span>
                <span className="identifier truncate text-muted-foreground text-xs">
                  {item.id} · {item.version}
                </span>
              </span>
              {canEdit && (
                <Button
                  aria-label={`Remove ${item.name}`}
                  onClick={() =>
                    onChange(
                      selected.filter(
                        (other) =>
                          !(
                            other.id === item.id &&
                            other.version === item.version
                          ),
                      ),
                    )
                  }
                  size="icon-sm"
                  variant="ghost"
                >
                  <XIcon aria-hidden="true" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <div className="relative">
          <Input
            aria-controls={listId}
            aria-expanded={results.length > 0}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search documents to link…"
            type="search"
            value={query}
          />
          {/* Results sit under the field rather than in a popup: the panel is
              360px wide and already scrolls, and a portalled popup would
              detach from the field it belongs to. */}
          {term.length > 0 && (
            <div
              className="mt-1 flex flex-col overflow-hidden rounded-lg border bg-popover shadow-md"
              id={listId}
            >
              {results.length === 0 ? (
                <p className="px-3 py-2.5 text-muted-foreground text-xs">
                  No document matches “{query.trim()}”. An Obsolete document
                  cannot be linked, and neither can one still In Approval.
                </p>
              ) : (
                results.map((candidate) => (
                  <button
                    className="flex items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-secondary/48 focus-visible:bg-secondary/48 focus-visible:outline-none"
                    key={`${candidate.id}-${candidate.version}`}
                    onClick={() => add(candidate)}
                    type="button"
                  >
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate font-medium text-sm">
                        {candidate.name}
                      </span>
                      <span className="identifier truncate text-muted-foreground text-xs">
                        {candidate.id} · {candidate.version}
                      </span>
                    </span>
                    <Badge variant="outline">{candidate.status}</Badge>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
