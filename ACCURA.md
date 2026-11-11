# Accura Workspace Guide

This file is the entry point for people and AI agents working on Accura inside the COSS monorepo. The upstream COSS introduction remains in [`README.md`](README.md).

## Start Here

Read these sources in order:

0. The requirements drift check in [`AGENTS.md`](AGENTS.md#requirements-sync-protocol). Product requirements are authored by the BA in `../requirements`, outside this repository, and the prototype is only as current as the baseline commit recorded in [`docs/agent-worklog.md`](docs/agent-worklog.md).
1. [`docs/product-knowledge/overview.md`](docs/product-knowledge/overview.md) — current product understanding, users, business logic, shared workflows, and open questions.
2. Read the relevant module overview, starting with [`docs/product-knowledge/modules/documents/overview.md`](docs/product-knowledge/modules/documents/overview.md) for Documents.
3. Read the applicable files in [`docs/rules/`](docs/rules/), currently [`ui-hierarchy.md`](docs/rules/ui-hierarchy.md), [`user-identity.md`](docs/rules/user-identity.md), and [`visual-system.md`](docs/rules/visual-system.md).
4. Read [`docs/rules/prototype-overrides.md`](docs/rules/prototype-overrides.md) before rewriting any prototype file. It indexes the places where Accura departs from COSS and library defaults, so a regenerated file does not silently revert them.
5. [`CHANGELOG.md`](CHANGELOG.md) — short chronological index of notable changes.
6. [`docs/change-log/DECISIONS.md`](docs/change-log/DECISIONS.md) — detailed rationale and superseded decisions.
7. [`apps/accura-prototype/design-qa.md`](apps/accura-prototype/design-qa.md) — implementation verification and visual evidence.

## Repository Map And Ownership

| Location | Owns | Must not own |
|---|---|---|
| `../requirements/` (separate repository, read-only) | The BA's authored PRDs, user stories, Acceptance Criteria, templates, and research — the single source of truth for product requirements | Anything written from this repository; it is never edited, copied, or vendored here |
| `docs/product-knowledge/` | Current product facts, business logic, users, workflows, module specifications, source evidence | Design-system rules, implementation history, session history |
| `docs/rules/` | Current approved UI, UX, accessibility, content, and component usage rules, and the index of deliberate departures from library defaults in [`prototype-overrides.md`](docs/rules/prototype-overrides.md) | Historical rationale or implementation evidence |
| `docs/visual-references/` | Candidate visual directions and comparison notes that require explicit approval before implementation | Approved rules or automatic implementation instructions |
| `docs/change-log/DECISIONS.md` | Why a decision was made, alternatives, consequences, and superseded directions | Current product requirements or duplicated implementation logs |
| `CHANGELOG.md` | Short chronological index of notable repository and prototype changes | Detailed rationale; entries link to the canonical detail |
| `brand-assets/` | Accura token inputs, mapping contract, generator, and generated CSS | General UI rules or product requirements |
| `apps/accura-prototype/` | Executable Accura prototype and its implementation QA evidence | Product knowledge or cross-project design rules |
| `apps/accura-catalogue/` | Patterns & Behavior catalogue app that visualizes settled design-system elements with their rules, usage, and readiness status | The source of truth for any rule (links to `docs/rules/` instead); product requirements |
| `packages/ui/` | Reusable COSS component implementation consumed by apps | Accura-specific product behavior |
| `apps/ui/` | COSS documentation, registry, particles, and component development environment | Accura prototype decisions |
| `apps/origin/` | Legacy Origin UI reference | New Accura foundation |
| `apps/www/` | Main COSS website | Accura product documentation |
| `apps/examples/` | Example applications showing COSS usage | Accura source of truth |

## Accura Working Flow

```text
../requirements/  (BA-authored, read-only — baseline commit recorded in the work log)
  → docs/product-knowledge/
  → docs/rules/
  → brand-assets/
  → apps/accura-prototype/
  → apps/accura-prototype/design-qa.md
  → CHANGELOG.md + docs/change-log/DECISIONS.md
```

## Where To Put New Information

- New or corrected product fact → `docs/product-knowledge/`, citing its `../requirements/` path and AC id. Never a copy of the requirement text as the source of truth.
- A requirements update from the BA → run the [Requirements Sync Protocol](AGENTS.md#requirements-sync-protocol). Nothing is written into, or copied out of, `../requirements/`.
- New module requirement or flow → the relevant folder under `docs/product-knowledge/modules/`.
- New reusable UI rule → `docs/rules/`.
- Candidate visual direction that has not been approved → `docs/visual-references/`; do not implement it automatically.
- New decision or a change to an existing decision → `docs/change-log/DECISIONS.md`.
- Notable implemented change → one short entry in `CHANGELOG.md` linking to its decision or QA evidence.
- Visual or technical verification → the owning app’s `design-qa.md`.
- Brand primitive or COSS theme mapping → `brand-assets/` and its README.

Do not copy the same rule or decision into multiple files. Link to its owning source instead.
