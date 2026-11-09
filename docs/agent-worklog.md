# Accura Agent Work Log

Operational memory for anyone (human or AI agent) working on Accura, kept **inside the repository** so it survives an account switch or a `git pull` by someone else. It records *how far work has got and what is still open* — the operational state that [`CHANGELOG.md`](../CHANGELOG.md) deliberately leaves out.

## How this file relates to the others

Three time-ordered records, each with one job — they do not duplicate each other:

| File | Answers | Nature |
|---|---|---|
| [`CHANGELOG.md`](../CHANGELOG.md) | *What* settled change landed | Clean index, durable |
| [`docs/change-log/DECISIONS.md`](change-log/DECISIONS.md) | *Why* a direction was chosen; superseded alternatives | Rationale, keeps history |
| **This file** | *Status* — what is in progress, uncommitted, needs review, or still to do | Operational, transient |

State the operational delta here and **link** to the CHANGELOG or DECISIONS entry rather than copying settled facts into this file.

## Maintaining this file

- Append a dated entry to **Work log** whenever a session does something significant, and keep **Current status** current whenever the in-progress / handoff state changes.
- Write absolute dates (`YYYY-MM-DD`), not relative ones.
- Keep it **portable**: use repository-relative paths, and do not hard-code machine-specific facts (local absolute paths, which local clone, which account). A different person pulling this repository must be able to read it correctly.
- When an open item is finished and recorded in `CHANGELOG.md` / `DECISIONS.md`, remove it from **Open items** here.
- This file is operational memory, not a source of truth for product facts, rules, or decisions. Those stay in their owning files per [`ACCURA.md`](../ACCURA.md).

## Current status

_As of 2026-11-09 — branch `primary`._

The following work is in the working tree but **not yet committed**:

- `apps/accura-catalogue/` — new Patterns & Behavior Catalogue app (dev server port `4174`). See [`CHANGELOG.md`](../CHANGELOG.md).
- `apps/accura-prototype/` — Documents list aligned to US-006. See [`CHANGELOG.md`](../CHANGELOG.md).
- Doc updates: [`ACCURA.md`](../ACCURA.md) (repository-map row for the catalogue) and [`CHANGELOG.md`](../CHANGELOG.md).
- `.claude/launch.json` — added the `accura-catalogue` dev-server entry (port `4174`).

### Open items

- **Commit:** nothing above is committed yet — needs a branch off `primary` and user permission before committing.
- **Catalogue content review:** per-entry wording and scope in `apps/accura-catalogue/lib/catalogue-data.ts` is first-draft (derived from `docs/rules/`, `DECISIONS.md`, and the prototype's `design-qa.md`); it needs a review pass.
- **Catalogue cross-navigation:** consider linking between the prototype app and the catalogue app.
- **Documents (US-006 follow-ups, not yet in scope):** the related external user stories were not attached, so these are untouched — External create flow (no References/Approval, "Acknowledge & Register"), Tags, multiple Reviewers, an Obsolete confirmation dialog, and permissions.

## Work log

### 2026-11-09

- Built the **Patterns & Behavior Catalogue** as a new standalone app, `apps/accura-catalogue`: a card grid over Foundations, Shell & Navigation, Components, Patterns, and Behaviors; a left nav marking each entry Ready (✅) or Needs sign-off (🟡); a detail drawer with rules, where it is applied, consistency, and sources; clickable section headers that filter the grid; and live component previews (not screenshots). Dev-server entry (port `4174`) added to `.claude/launch.json`. Recorded in [`CHANGELOG.md`](../CHANGELOG.md) and the [`ACCURA.md`](../ACCURA.md) repository map.
- Aligned the **Documents list to US-006**: added Document Category and Document Type columns, the full status set (Draft, In Review, In Approval, Approved, Superseded, Obsolete), 10/20/50 page sizes, and consecutive grouping of versions that share a Document ID. Renamed "In QA Approval" to "In Approval" across the flow screens (PRD-002 defines no separate QA role; electronic signature is deferred). See [`CHANGELOG.md`](../CHANGELOG.md).
