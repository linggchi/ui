# AGENTS.md

Guidelines for AI agents working on this codebase.

## Main Documentation

The comprehensive agent guidelines for this repository are located in:

**[apps/ui/AGENTS.md](apps/ui/AGENTS.md)**

## Workspace Source Boundary

Two paths are project sources: this repository, and the requirements repository at `../requirements` — **read-only**, see [Requirements Sync Protocol](#requirements-sync-protocol).

- Do not read, search, copy, cite, or use files from Downloads, Desktop, temporary folders, other repositories, or any other path outside those two unless the user explicitly authorizes that exact external path in the current session.
- Do not carry external-file permission forward from an earlier session.
- Never write to, commit in, restructure, or `git pull` away from the user's intent in `../requirements`. It belongs to the BA. Divergences are recorded in [`docs/change-log/DECISIONS.md`](docs/change-log/DECISIONS.md), never corrected upstream.
- Never copy requirement files into this repository, in whole or in part, and never re-add them as a submodule. A second copy drifts silently; cite the upstream path instead.
- If a required attachment or token export is outside both paths, ask the user to place it in this repository before using it.
- Save any artifact that must remain available to future sessions inside this repository.

## Accura Startup Protocol

Before working on Accura, read these files in order:

0. Run the requirements drift check in [Requirements Sync Protocol](#requirements-sync-protocol) and state the result in one line before anything else.
1. [`ACCURA.md`](ACCURA.md) for the repository map and documentation ownership.
2. [`docs/product-knowledge/overview.md`](docs/product-knowledge/overview.md) and the relevant module overview under `docs/product-knowledge/modules/`.
3. The applicable rule files under [`docs/rules/`](docs/rules/).
4. The latest relevant entries in [`CHANGELOG.md`](CHANGELOG.md).
5. The relevant rationale in [`docs/change-log/DECISIONS.md`](docs/change-log/DECISIONS.md).
6. The current operational state — what is in progress, uncommitted, or still open — in [`docs/agent-worklog.md`](docs/agent-worklog.md). Update it before finishing a session.

Reading this list once at session start is not enough for building. Run the [Pattern Check Before Building A Screen](#pattern-check-before-building-a-screen) again before each screen you build or rewrite.

Do not duplicate product facts, rules, decisions, or implementation QA across files. Update the owning source and link to it from indexes or evidence files.

## Typography

Set type per the [Cal Sans font guide](packages/ui/src/fonts/font-guide.md): no added letter-spacing, `font-optical-sizing: auto` instead of a hard-coded `opsz`, one `GEOM` value per role, no synthesized bold or italic, and typeset punctuation (’ – − “ ”) in UI strings.

## Pattern Check Before Building A Screen

The Startup Protocol is read **once per session**. This check runs **before every screen or component you build or rewrite**, including the second and third one in the same session. Skipping it is how a screen ends up re-inventing a convention this repository already settled, which is expensive to find and tedious to unpick.

Before writing any screen code:

1. **Read [`docs/rules/`](docs/rules/) for the control types you are about to use.** Not the whole folder — the sections that apply. `ui-hierarchy.md` alone owns Form fields, Selection controls, Icons, Tabs, Containers, System feedback and Action priority.
2. **Read [`docs/rules/prototype-overrides.md`](docs/rules/prototype-overrides.md), including its Notes.** It lists the places where a sensible-looking default is wrong here, and the traps that cost the most time (for example: `Input` applies `className` to its wrapper span, so a growth class must go on a flex child around it).
3. **Open the catalogue entry for each pattern you are about to use:** `apps/accura-catalogue/lib/catalogue-data.ts`, or the running app on port 4174. If an entry exists, it is the agreed behavior — follow it rather than deciding again.
4. **Find the nearest screen that already solves the same problem and reuse its component.** `settings-screens.tsx` owns the established form conventions: `FormLabel` (required asterisk / "(Optional)"), `SectionCard` and `SectionHeading` (Zinc 50 header, `gap-0.5` between title and description). Copying the convention into a new file is correct; re-deriving it is not.
5. **Say in one line which rules and catalogue entries apply** before you start, so a wrong reading is visible before it becomes code.

A convention lives in a **shared primitive** whenever two screens could need it. Fix it in `apps/ui/registry/default/ui/` and run `bun run ui:sync` from `apps/ui` — never edit `packages/ui` directly, and never work around a primitive with a screen-level override. If a rule names only one primitive but applies to its siblings, fix the siblings and widen the rule in the same change.

### After building

- Add or update the catalogue entry for anything new, changed or removed. An entry that no longer matches the prototype is worse than no entry.
- Record a new reusable rule in `docs/rules/`, and a deliberate departure in [`docs/change-log/DECISIONS.md`](docs/change-log/DECISIONS.md).

## Requirements Sync Protocol

Product requirements are authored by the BA in `../requirements` (`https://github.com/Accura-One/requirements.git`, branch `development`) — one working copy, outside this repository, serving as the single source of truth. The prototype is downstream of it:

```text
../requirements/  →  docs/product-knowledge/  →  apps/accura-prototype/
```

### The baseline

The prototype is only as current as the requirements commit it was last propagated against. That commit is the **requirements baseline**, recorded in the baseline table in [`docs/agent-worklog.md`](docs/agent-worklog.md). It is the single piece of sync state in this repository; do not create a second one.

This record is maintained by hand, so the discipline in step 7 is the whole mechanism: a baseline advanced ahead of the prototype destroys the only signal that the prototype is stale, and nothing else will catch it.

### At every session start

```sh
BASE=<baseline commit from docs/agent-worklog.md>
git -C ../requirements fetch --quiet origin development
git -C ../requirements log --oneline "$BASE"..origin/development
```

- No output → in sync; proceed.
- Commits listed → say how many, and which documents are behind, then offer the sync below. Do not begin prototype work on a stale baseline without saying it is stale.
- Also check **Open items** in [`docs/agent-worklog.md`](docs/agent-worklog.md): the baseline may be current while propagation is deliberately left unfinished.
- If `../requirements` is missing, say so and stop rather than working from memory — it is cloned from the URL above.

### On a sync trigger

Treat any of these as a request to run the full sync, with no further questions: *"doc đã được cập nhật"*, *"BA vừa update doc"*, *"sync requirements"*, *"pull doc mới"*, or the drift check finding new commits.

1. **Fetch** — fetch, do not check out yet; the comparison is against the recorded baseline, not against the local working copy:

   ```sh
   git -C ../requirements fetch origin development
   ```

2. **List what changed** — and catch renames, which matter most, because a renamed PRD or user story silently orphans every citation in this repository:

   ```sh
   git -C ../requirements diff --stat "$BASE"..origin/development
   git -C ../requirements diff --name-status --find-renames "$BASE"..origin/development
   ```

3. **Read what changed:** `git -C ../requirements diff "$BASE"..origin/development -- '*.md'`. For a `.docx` or other binary, git proves only *that* it changed — list it and ask the user what changed inside. Never infer binary content from the filename or the commit message.

4. **Classify every changed document** into exactly one bucket and report the table before editing anything:

   | Bucket | Meaning | Action |
   |---|---|---|
   | Behavioral | An Acceptance Criterion, business rule, role, status, permission, or flow changed | Prototype work required |
   | Structural | A document was added, deleted, renamed, or moved | Re-point citations; an added document is usually new scope, not a silent task |
   | Editorial | Wording, formatting, or typos only | Advance the baseline, change no code |

   A rename reported at low similarity (`R058`) is a rename *and* a content change: re-read the document, do not treat it as a pure move.

5. **Propagate in this order**, for Behavioral and Structural changes only:
   - `docs/product-knowledge/` — the owning product fact, citing the document path and AC id as evidence.
   - `docs/rules/` — only if a reusable UI/UX rule genuinely changed.
   - `apps/accura-prototype/` — the implementation.
   - [`apps/accura-prototype/design-qa.md`](apps/accura-prototype/design-qa.md) — re-verify the affected screens in a real browser. A screenshot taken before the requirement changed is no longer evidence.
   - [`docs/change-log/DECISIONS.md`](docs/change-log/DECISIONS.md) — when the update contradicts a decision made here, or when the prototype deliberately continues to diverge.
   - [`CHANGELOG.md`](CHANGELOG.md) — one short entry.

6. **Stop and ask** when an update contradicts an approved decision, removes behavior already built, or requires design that does not exist yet. Do not silently re-implement, and do not silently keep the old behavior.

7. **Advance the baseline last**, and only once propagation is complete — or the remainder is written into **Open items** in [`docs/agent-worklog.md`](docs/agent-worklog.md) by document name, so the gap is visible to the next session. Then, in the same change as the propagation work, update the baseline table: the new commit, its date, today's date, and whether propagation is complete.

### Citing requirements

Cite the document by identifier and repository-relative path, as text, not as a markdown link — the file is outside this repository and the link would be dead:

> `05 User Story/PRD-002 - Document Module/US-006 - View Document List.md` AC-03, requirements repository
