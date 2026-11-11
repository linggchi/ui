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

## Requirements baseline

The commit of the requirements repository (`https://github.com/Accura-One/requirements.git`, branch `development`, working copy at `../requirements`) that this repository's product knowledge and prototype have been propagated against. This is the only sync state in the repository; maintain it by hand per the [Requirements Sync Protocol](../AGENTS.md#requirements-sync-protocol), and advance it only after propagation.

| Field | Value |
|---|---|
| Baseline commit | `c2cbd1f01125646338f2a29f08cd614c9f13881b` |
| Baseline date | 2026-11-10 |
| Last checked | 2026-11-11 |
| Propagation | **Partial** — the 2026-11-10 rules are recorded in `docs/product-knowledge/`; no prototype change was required, because every story they touch is unbuilt. Thirteen user stories are new scope and are not built. See Open items. |

## Current status

_As of 2026-11-11 — branch `primary`._

Everything below is in the working tree and **not yet committed**. Three days of work have accumulated on `primary` without a commit; that is the single largest operational risk here. When it is committed, `apps/ui/registry/default/ui/select.tsx` and `packages/ui/src/components/select.tsx` should be separated out: they reach every `@coss/ui` consumer, not only Accura.

- `apps/accura-catalogue/` — the Patterns & Behavior Catalogue app (dev server port `4174`), plus the entry revisions from the 2026-11-10 work. See [`CHANGELOG.md`](../CHANGELOG.md).
- `apps/accura-prototype/` — the Documents list aligned to US-006, the Create Document screen (US-007 and US-010), the document details screen (US-011) and the review stage (US-012), the removal of electronic signature, the shared form conventions in `components/accura-form.tsx`, and the wide-table scroll and row-action behaviour. See [`CHANGELOG.md`](../CHANGELOG.md).
- **Shared UI, outside the prototype:** `apps/ui/registry/default/ui/select.tsx` and its sync into `packages/ui/src/components/select.tsx` — `SelectItem` gained the trailing selection indicator that `ui-hierarchy.md` requires and only `ComboboxItem` had. This one reaches every app that consumes `@coss/ui`, not just Accura.
- `apps/accura-prototype/app/globals.css` — the single badge size (22 px / 12 px) pinned against the COSS default, which shrinks a badge from the `sm` breakpoint up.
- Rule and decision updates under [`docs/rules/`](rules/) and [`docs/change-log/DECISIONS.md`](change-log/DECISIONS.md), and the Pattern Check section in [`AGENTS.md`](../AGENTS.md).
- Doc updates: [`ACCURA.md`](../ACCURA.md) (repository-map row for the catalogue) and [`CHANGELOG.md`](../CHANGELOG.md).
- Staged deletions: `.gitmodules` and `docs/requirements` — the removed requirements submodule. These are staged but uncommitted, so the removal is not yet recorded anywhere but this working tree.

### Open items

- **New scope — thirteen user stories exist upstream and are not built.** The 2026-11-11 sync added `US-017 - Print Document` and `US-018 - Download Document` to PRD-002, bringing that module to eleven stories, **all eleven built as of 2026-11-11**. What each one leaves thin is listed under [Refine pass backlog](#refine-pass-backlog) rather than left implicit.
- **New scope from the 2026-11-10 sync — the first eleven:** They were classified as new scope, not silently implemented; each needs its own decision about prototype scope:
  - *Settings:* `US-007 - Manage Document Types`, `US-008 - Configure Record Numbering`, `US-009 - Manage Departments`. US-007's twelve configured types already exist in the Settings screen's sample data; the three screens themselves do not.
  - *Document Module:* all built on 2026-11-11 — `US-011`, `US-012`, `US-013`, `US-014`, `US-015`, `US-016`, `US-017`, `US-018`. These superseded the "US-006 follow-ups" previously blocked for want of attached stories.
- **`US-011` and `US-012` are built; one thing in them is not.** Attachments and References, and the rejection notice on a returned Draft, were both built on 2026-11-11 — the latter with `US-012`, which is where the rejection is recorded. What remains is **real permissions**. `US-011` AC-03–AC-07 and `US-012` AC-01 gate Draft edit mode and the Approve/Reject actions on who the user is; the prototype has no signed-in user, so the gate is demonstrated by a `Prototype · Viewing as` switcher in the top bar, over five roles (see [`docs/rules/prototype-overrides.md`](rules/prototype-overrides.md)). That is a demonstration, not a permission model, and it is deliberately marked as such. The same gap is open for `US-007` and `US-010`, and `US-012`'s own open question — the exact permissions for actions other than viewing — is still with the BA.
- **One reading of `US-012` is an interpretation, not a requirement.** The story says a Read and Write All Records user may review without being assigned, *and* that the transition still needs every assigned Reviewer. The prototype resolves that by clearing one assigned slot per approval, annotated with who acted. Recorded as a [decision](change-log/DECISIONS.md#2026-11-11---one-approval-clears-one-assigned-reviewers-slot); confirm it with the BA.
- **Rejections are not persisted.** A rejection notice lives in the detail screen's React state, so it survives the return to Draft and a resubmission but not a reload or a trip back to the register. The prototype has no store; `US-014` is where this would become real.
- **Ten of the eleven sample rows carry invented detail content.** The mockup details exactly one document, so its attachments, references and tags are the mockup's; the content on the other ten was written in this repository on 2026-11-11 so that every status demonstrates the detail panel. It is plausible per document type and every reference points at a row that exists, but it is **not traceable to the mockup or to a requirement** — replace it if the BA supplies real sample content. The same applies to the **review routes** seeded on 2026-11-11 for `US-012`: every Controlled row now names two Reviewers and an Approver drawn from the create form's five sample people, which the mockup does not specify.
- **No sample row is Overdue for Periodic Review.** The state is implemented and the calculation verified, but every fixture row was approved in 2026 and the default frequency is three years, so nothing reaches it. Showing it needs either a row approved before 2023 or a shorter configured frequency, which is `US-007` (PRD-001) and not built.
- **The 2026-11-10 effective-date and periodic-review rules are recorded but unbuilt.** Recorded in [`docs/product-knowledge/modules/documents/overview.md`](product-knowledge/modules/documents/overview.md) §Effective date and periodic review. No prototype change was made, and that is deliberate: an approved Controlled Document's Effective Date (approval + 10 days) is set by `US-013`/`US-015`, and Next Periodic Review is displayed by `US-011` — all three unbuilt. `US-010` **is** built and gained one clause, "calculate Next Periodic Review from the registration date", but the prototype has nowhere to show it and no configured frequency to read, because `US-007 - Manage Document Types` (PRD-001) is not built either. Build these together, not one at a time.
- **`US-007` is ambiguous as a citation.** `PRD-001/02 Documents/US-007 - Manage Document Types` and `PRD-002/US-007 - Create Controlled Document` are different stories with the same number. Always cite the PRD with it.
- **Two settled divergences from PRD-002 to raise with the BA.** Both are confirmed by the user and built; neither is reflected upstream. (1) The **Document ID, not the Name, is the link** that opens a document — `US-011` Entry Point and AC-01. (2) The **Draft editor and Create Document both keep a Cancel action** — `US-014` AC-01 reads "no Cancel action is available for the Draft" and `US-007` AC-04 says the same of the creation form; the prototype's Cancel runs the same discard confirmation as the breadcrumb, so it cannot lose work unconfirmed. (3) A **Superseded document can be cited as a reference**, where the mockup allows Draft, In Review and Approved only. (4) **Approving opens a confirmation**, which `US-012` AC-02 and `US-013` AC-02 do not ask for — it is not an electronic signature, so their "without an electronic-signature prompt" still holds, but it is an extra step and the BA should know. All four are in [`docs/change-log/DECISIONS.md`](change-log/DECISIONS.md).
- **Answered 2026-11-11 — the previous version is Superseded on approval.** `PRD-002` question 3 asked whether that happens at approval or when the new Effective Date arrives 10 days later. The user settled it: **at approval**, which is what the prototype already did, so no code changed. Recorded in [`docs/product-knowledge/modules/documents/overview.md`](product-knowledge/modules/documents/overview.md). The question is still open in the requirements repository — tell the BA, and tell them the follow-up the user also settled: for the 10 days between approval and the Effective Date, **the Superseded version stays the one to follow**. Superseded therefore means "replaced, still usable until the successor takes effect", while Obsolete is withdrawn outright.
- **US-007 and US-010 are built except for their permission gate.** Both stories' AC-01 says the create form is unavailable to a user without Read and Write or Read and Write All Records in the Document module. The prototype has no permission switching to gate against. Decide whether it should simulate roles.
- **The attachment file-size limit is unenforced.** `US-010` AC-02 records it as an open question — "Attachment file-size limit is unresolved" — so nothing is validated. Ask the BA.
- **Record Numbering and Departments are hard-coded in the create form.** `US-007` AC-02 sources them from Settings; `US-008` and `US-009` are not built, so `apps/accura-prototype/components/create-document-screen.tsx` carries the mockup's saved values (`ACME`, hyphen, year on, six digits) and department list. Wire them to Settings when those stories land.
- **References are display-only in the create form.** `US-007` AC-02 makes Related and Referred Documents optional, and the search inputs are present but do not link documents yet.
- **Two requirement binaries changed and their contents are unknown:** `02 Documents/Document Module Requirements Oct 2026.docx` and `02 Documents/Technical Overview and Architecture.docx`. Git cannot diff them; ask the BA what changed inside.
- **Department filter options are still derived from the sample rows,** not from a configured list. `US-006` AC-03 wants them loaded from Settings, but `US-009 - Manage Departments` is not built, so there is no configured list to read yet. Resolve this when US-009 lands.
- **Upstream hygiene (ask the BA, do not fix from here):** `.DS_Store` and `.obsidian/workspace.json` are tracked in the requirements repository and appear in every diff as noise; they belong in its `.gitignore`.

- **The wide-table row-action behaviour needs sign-off.** It was built and then revised three times on 2026-11-10 against live review: the reveal moved from the table's scroll state to the hovered row, the elevation moved from the cell to the action, and the end-of-row state became flat with every row showing its action. Both catalogue entries (`Data Table`, `Wide Table Scroll & Pinned Actions`) are marked Needs sign-off until it is reviewed as a whole.
- **The catalogue thumbnail for `Data Table` shows none of that behaviour.** It is a static two-row mini table of Name and Status. Not wrong, but it illustrates nothing of the scroll, the pinned cell or the reveal. Deliberately left as is.
- **Tailwind in the prototype's dev server does not reliably regenerate new utility classes on HMR.** On 2026-11-10 a class was present on the element with no matching rule anywhere in the stylesheet, which reads exactly like a broken implementation. If a style change appears not to apply, stop the dev server, remove `apps/accura-prototype/.next/cache` and start it again before diagnosing the code.
- **Commit:** nothing above is committed yet — needs a branch off `primary` and user permission before committing.
- **Catalogue content review:** per-entry wording and scope in `apps/accura-catalogue/lib/catalogue-data.ts` is first-draft (derived from `docs/rules/`, `DECISIONS.md`, and the prototype's `design-qa.md`); it needs a review pass.
- **Catalogue cross-navigation:** consider linking between the prototype app and the catalogue app.

## Refine pass backlog

**Done so far (2026-11-11):**
- Round 1 — Cancel on the Draft editor, the Attachments `0/5` counter, the Document Category heading casing, the Document ID link colour. [Iteration 43](../apps/accura-prototype/design-qa.md#iteration-43--first-four-of-the-refine-pass)
- Round 5 — a confirmation in front of Approve (recorded as a divergence), each prototype role given a named person so the top-bar identity follows the switcher, global search narrowed to 300px, the row menu reduced to actions that do something, and reviewer status renamed Pending → Awaiting in the data model. [Iteration 48](../apps/accura-prototype/design-qa.md#iteration-48--approving-asks-first-and-the-shell-says-who-you-are)
- Round 4 — the Draft editor brought in line with the other document screens (Tags as a field, references as plain rows), the register's inline save banner replaced by the settled toast, Cancel added to Create Document, "None linked." hidden while editing, and the prototype role switcher moved to the top bar. [Iteration 47](../apps/accura-prototype/design-qa.md#iteration-47--the-draft-stops-being-its-own-screen-and-a-settled-pattern-finally-reaches-documents)
- Round 3 — Superseded given its own violet status colour with the status map moved into one shared module, every count badge removed from the details view, the action bar collapsed to View audit trail plus a More actions menu, and the footer made sticky in every status. [Iteration 46](../apps/accura-prototype/design-qa.md#iteration-46--superseded-gets-a-colour-the-action-bar-gets-a-menu-the-footer-stops-moving)
- Round 2 — stepper captions derived per stage and raised to 12px, the Approval card grouped by role, attachments and references as links with count badges, Related/Referred as group headings, preview zoom and full screen, and a capitalisation rule plus a sweep that gave one thing one name across all three document screens. [Iteration 44](../apps/accura-prototype/design-qa.md#iteration-44--the-details-panel-reads-as-content-and-one-thing-gets-one-name)

**Capitalisation has now been fixed three times.** The rule in [`docs/rules/ui-hierarchy.md`](rules/ui-hierarchy.md) §Capitalisation is deliberately written as a question with one answer, because the previous version ("one screen, one casing") required judgement and did not survive contact. Check it before adding any heading.



All eleven PRD-002 stories were built in one run on 2026-11-11 at the user's direction — *"dựng hết các US rồi chúng ta sẽ refine từng chi tiết 1 sau"* — so this is the list to walk through together, not a list of defects to fix unasked. Each line says what the requirement asks for and what the prototype actually does.

### Cross-cutting

- **Nothing persists.** Every document change lives in React state, so a reload returns the whole register to its eleven seeded rows. Approvals, Draft edits, revisions and obsolescence are all lost. This is the biggest gap between the prototype and the requirements, and it sits underneath several lines below.
- **No real files anywhere.** Uploading, replacing and attaching record only *whether* a file is present. Nothing validates PDF/DOCX/XLSX or the 50 MB limit (`US-014` AC-02 and AC-05, `US-015` AC-02), and nothing stores bytes.
- **The role switcher is not a permission model.** `Prototype · Viewing as` stands in for a signed-in user across `US-012` AC-01, `US-013` AC-01, `US-014` AC-01, `US-015` AC-01 and `US-016` AC-01. `US-012` and `US-016` both carry an open permission question upstream.
- **The audit trail is a fixed four-event list.** It does not record the approvals, rejections, edits, revisions or obsolescence the screens now perform.

### US-014 Edit Draft Document

- ~~References can be removed but not added~~ — **built 2026-11-11** as a shared `ReferencePicker` used by the create form and the Draft editor. Linkable statuses are Draft, In Review, Approved and — by the 2026-11-11 decision — Superseded; never the document itself, never the same document and version twice.
- **Attachment Name and Description are generated, not editable.** AC-02 makes both optional free text, maximum 100 characters.
- **AC-06 guards only Back to Documents.** The AC also covers navigating to another in-app menu; the sidebar is not guarded.
- **AC-07 depends on a browser rule.** `beforeunload` is registered only while there are unsaved edits, but Chrome suppresses the prompt until the page has had a user gesture, so it does not fire on a page the user has not touched.
- Only Document Name enforces its 100-character maximum.

### US-015 Upload Controlled Document Revision

- **Revision History is a plain textarea.** AC-03 asks for a rich-text editor with bulleted and numbered lists, tables, bold and italics. Building one was out of proportion to this pass; the field is labelled as plain text in the dialog itself.
- **Reviewers and the Approver are edited after the revision is created**, in the Draft editor, not inside the revision dialog. AC-03 reads as either, but confirm it.
- ~~The rule "do not add the same document/version more than once"~~ — **enforced 2026-11-11** in the shared picker; an already-linked document and version drops out of the results.

### Superseded versions during the 10-day window

- **A reference pointing at a Superseded version is shown like any other.** Now that Superseded documents can be cited, the details panel could mark such a link so a reader knows the cited version is mid-handover. Decide whether that is worth the noise.
- **A Superseded version does not say it is still in use.** The user settled on 2026-11-11 that it stays the one to follow until its successor's Effective Date, but the details screen shows only the status badge — so it reads as "do not use this" exactly when someone needs to know which revision to follow. Showing it requires the details screen to know the document *family*, find the successor and read its Effective Date; today it receives one version only. Decide the wording with it: something that names the date the handover completes.

### To put to the BA

- **A Superseded document can now be cited** — settled by the user on 2026-11-11, diverging from the mockup's "Draft, In Review, or Approved". Tell the BA; it follows from the same day's decision that a Superseded version stays in use until its successor takes effect. See [`DECISIONS.md`](change-log/DECISIONS.md).
- **Is In Approval deliberately excluded?** The mockup's list leaves it out, which reads as deliberate (a document still under decision should not be cited), but it is never stated as a rule. **Still open.**

### Consistency, still open

- ~~The create form keeps Tags inside Document Information; the Draft editor gives Tags its own card~~ — **resolved 2026-11-11**: Tags are a field of Document Information on all three document screens.

### US-016 Mark Document as Obsolete

- ~~"No longer available for active use or linking" is only a status change~~ — **enforced 2026-11-11**: an Obsolete document never appears in the reference picker's results, because the mockup's linkable list is Draft, In Review and Approved.
- AC-05 (rejecting an ineligible status at submission) is a server-side guard and has nowhere to live in a prototype.
- The permission is gated on Author or Read and Write All Records. PRD-002 leaves the real rule open — **ask the BA**.

### US-017 Print Document

- **What prints is the mock preview page**, not a real document, and there is no configured header or footer.

### US-018 Download Document

- **Both downloads produce a labelled placeholder `.txt`.** AC-01 wants the native file unmodified; AC-02 wants a generated controlled PDF whose first page carries a document control summary in the configured Header and Footer structures. Neither is possible without stored files, and imitating them would have been worse than saying so.

### US-013 Approve Controlled Document

- **The periodic-review frequency is the 3-year default.** AC-02 reads it per Document Type from Settings > Documents, which is `US-007` (PRD-001) and not built.

## Work log

### 2026-11-11

- Built **US-011 View Document Details** and **US-012 Review Controlled Document** into `apps/accura-prototype/components/document-flow-screens.tsx`. US-011's root defect was that the details screen never received the opened record; US-012's was that one Approve advanced the document on its own. Documents now carry a review route (a decision per assigned Reviewer plus an Approver), the eligibility gate in AC-01 is demonstrated through a prototype role switcher, and a rejection is recorded and shown on the returned Draft. See [`CHANGELOG.md`](../CHANGELOG.md), [design-qa Iteration 40](../apps/accura-prototype/design-qa.md#iteration-40--us-011-and-the-details-screen-learns-which-document-it-is-showing) and [Iteration 41](../apps/accura-prototype/design-qa.md#iteration-41--us-012-and-one-approval-stops-standing-in-for-every-reviewer).
- Built the **remaining six Document-module stories** — `US-013`, `US-014`, `US-015`, `US-016`, `US-017`, `US-018` — in one run at the user's direction, taking PRD-002 to eleven of eleven. The flow screens can now write to the record, not just change the view. What each story leaves thin is in [Refine pass backlog](#refine-pass-backlog), to be walked through together. See [`CHANGELOG.md`](../CHANGELOG.md) and [design-qa Iteration 42](../apps/accura-prototype/design-qa.md#iteration-42--the-last-six-stories-and-the-screens-start-changing-the-record).
- Refine pass round 5: the approve confirmation, role-to-person identity in the shell, a narrower global search, a trimmed row menu, and Awaiting in place of Pending.
- Refine pass round 4: the Draft editor aligned with the other document screens, the save banner replaced by the settled toast pattern, Cancel on Create Document, and the role switcher moved to the top bar.
- Refine pass round 3: the Superseded status colour (logged in the design system), count badges removed, a More actions menu, and one footer behaviour across statuses.
- Refine pass round 2: the document details panel — stepper captions, the Approval card grouped by role, links and count badges on attachments and references, preview zoom and full screen, and a capitalisation rule written to stop a mistake that had recurred three times.
- Started the **refine pass** at the user's direction: Cancel on the Draft editor (a recorded divergence from `US-014` AC-01), the Attachments quota counter, the Document Category heading, and the Document ID link colour.
- Put the **Create Document** form back on the settled controls (Reviewers combobox, disabled Author, Tags Add-in-input), and settled the **workflow stepper** labels.
- Ran the **requirements sync** (baseline `a3eea9c` → `c2cbd1f`). The 10-day effective date and the periodic-review frequency are recorded in `docs/product-knowledge/`; `US-011` now displays the derived review date.

### 2026-11-10

- Ran the first **requirements sync** (baseline `c5e65b8` → `a3eea9c`) and propagated it: the Users form, the Documents sample rows and type filter, and the settled Documents rules in `docs/product-knowledge/`. Eleven new user stories were classified as new scope and left unbuilt — see Open items.
- Built **US-007 Create Controlled Document** and **US-010 Create External Document** into `apps/accura-prototype/components/create-document-screen.tsx`, moved the Controlled / External choice into the page, and removed electronic signature from the prototype per `PRD-002`.
- Audited the prototype screens against the settled patterns and moved the shared form conventions into `apps/accura-prototype/components/accura-form.tsx`. Added the [Pattern Check Before Building A Screen](../AGENTS.md#pattern-check-before-building-a-screen) to `AGENTS.md` after a review found a screen had been built without re-reading the rules.
- Gave the **Documents register horizontal scrolling and a pinned row-action column**, then reworked that behaviour three times against live review: the action is revealed on the hovered or keyboard-focused row rather than on every row at once, its elevation is a chip on the action rather than a shadow on the cell, a row whose menu is open is held in state because the popup is portalled out of it, and at the end of the row every row shows a plain action with no elevation at all. The header's trailing cell is no longer pinned. See [`CHANGELOG.md`](../CHANGELOG.md) and [design-qa Iteration 38](../apps/accura-prototype/design-qa.md#iteration-38--the-action-belongs-to-the-hovered-row-and-it-is-a-raised-chip).

### 2026-11-09

- Built the **Patterns & Behavior Catalogue** as a new standalone app, `apps/accura-catalogue`: a card grid over Foundations, Shell & Navigation, Components, Patterns, and Behaviors; a left nav marking each entry Ready (✅) or Needs sign-off (🟡); a detail drawer with rules, where it is applied, consistency, and sources; clickable section headers that filter the grid; and live component previews (not screenshots). Dev-server entry (port `4174`) added to `.claude/launch.json`. Recorded in [`CHANGELOG.md`](../CHANGELOG.md) and the [`ACCURA.md`](../ACCURA.md) repository map.
- Aligned the **Documents list to US-006**: added Document Category and Document Type columns, the full status set (Draft, In Review, In Approval, Approved, Superseded, Obsolete), 10/20/50 page sizes, and consecutive grouping of versions that share a Document ID. Renamed "In QA Approval" to "In Approval" across the flow screens (PRD-002 defines no separate QA role; electronic signature is deferred). See [`CHANGELOG.md`](../CHANGELOG.md).
