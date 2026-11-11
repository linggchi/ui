# Documents Module

This file owns the current knowledge specific to the Accura Documents module.

## Sources And References

- [Module source specification](../../sources/modules/documents/document-module-screen-design.pdf)
- [Document flow UX and accessibility audit](flow-audit.md)
- [`evidence/`](evidence/) — screenshots used by the audit
- [Shared Accura product knowledge](../../overview.md)

## Current Scope

The first prototype slice covers the desktop lifecycle from Document List through Create, Edit Draft, Review, QA Approval, Approved state, versioning, Obsolete state, and Audit Trail. Product facts belong in this module or the shared overview; implementation evidence belongs in the prototype app.

## Settled Rules

From `04 Epics - PRD/PRD-002 - Document Module.md` and the `05 User Story/PRD-002 - Document Module/` stories in the requirements repository, as of baseline `c2cbd1f` (2026-11-10). PRD-002 now holds eleven stories: `US-006`, `US-007`, `US-010`–`US-018`.

### Identity and versioning

- Each saved document version is a separate record, identified by Document ID plus Version. Records sharing a Document ID appear consecutively in the list.
- A Document ID is assigned on the first successful save and retained for the document and all its versions. It is built from Settings > Organisation > Record Numbering — Organisation Prefix, separator, year option, sequence length — with the Document Type abbreviation after the Organisation Prefix. Example: `ACME-BR-2026-000001`.
- The first version is `v1.0`; each later version increments the integer part and keeps `.0` (`v2.0`, `v3.0`).
- Document Category (Controlled or External) is distinct from Document Type and is displayed separately. External Documents use the fixed External (EXT) type.

### Lifecycle and permissions

- Controlled: Draft → In Review → In Approval → Approved.
- **All** assigned Reviewers must approve before the document moves to In Approval. Any eligible reviewer may reject with a required reason, which returns it to Draft and stops the workflow before Approval.
- The assigned Approver, or a user with Read and Write All Records, approves or rejects in In Approval. Rejection requires a reason and returns it to Draft.
- There is **no separate QA Approver role**. Author, every Reviewer, and the Approver must be different people; Reviewers and Approvers may belong to any department.
- Only an Approved Controlled Document may be revised. The revision keeps the Document ID, Document Type, and Department, requires a Revision History change summary in a rich text editor, and takes the next `vN.0` while the previous version stays Approved until the new one is approved, at which point the prior version becomes Superseded.
- Only an Approved document, Controlled or External, may be marked Obsolete, after confirmation.
- Creating a document requires Read and Write or Read and Write All Records. Uploading a revision of an Approved Controlled Document is limited to the Author or a user with Read and Write All Records.

### Effective date and periodic review

Added by the 2026-11-10 requirements update. The display side is built in `US-011`; the rules that *set* an effective date on approval (`US-013`, `US-015`) and the Settings screen that configures the frequency (`US-007`, PRD-001) are not.

- An approved **Controlled Document** does not take effect on its approval date: its **Effective Date is 10 days after approval** (`US-013` AC-02, and `US-015` AC-04 for a revision). Before approval the detail screen shows "Not set".
- An **External Document** is approved at registration, so its Effective Date is the registration date (`US-010` AC-04) — unchanged, but now stated as a consequence of immediate approval rather than as its own rule.
- Every Document Type carries a **Periodic Review Frequency in whole years, configured in Settings > Documents and defaulting to 3 years** (`US-007` AC-01, AC-03 — the PRD-001 story, not the PRD-002 one of the same number). It applies to Controlled **and** External types, `External Document (EXT)` included.
- **Next Periodic Review** is calculated from the date the document became Approved, using that type's frequency (`US-011` AC-02). Before approval it shows "Set after approval."
- When that date passes with no newer version approved, the document is **Overdue for Periodic Review**. This is a displayed state only: its status stays Approved and it stays effective (`US-011` AC-02, AC-06–AC-07).

A previous version becomes **Superseded at the moment the new version is approved**, not when the new Effective Date arrives 10 days later. Settled by the user on 2026-11-11, answering `PRD-002` question 3; the question is still open in the requirements repository, so raise it with the BA rather than assuming it is recorded there.

The two dates therefore do different work: approval ends the old version, and the Effective Date starts the new one. For the 10 days between them a document family has a Superseded version and an Approved-but-not-yet-effective one.

**During that window the Superseded version remains the one to follow.** Settled by the user on 2026-11-11. So `Superseded` means "replaced, and no longer the current revision" — not "withdrawn": a Superseded version is still usable until its successor's Effective Date arrives, and only then does the family have no reason to reach for it. This is what separates Superseded from `Obsolete`, which `US-016` defines as no longer available for active use or linking at all.

### Files and forms

- One primary file plus up to five attachments. Controlled primary files and revisions accept PDF, DOCX, or XLSX; External Documents require PDF. Primary files must not exceed 50 MB.
- A valid primary file is required to save a Controlled Document as Draft and to submit it for review.
- `PRD-002` and `US-014` AC-01 give creation forms and saved Drafts **no Cancel action**. The prototype diverges, confirmed by the user on 2026-11-11: both carry Cancel, and it runs the same discard confirmation as Back to Documents, so it cannot lose unsaved work. Navigating away still prompts. See [`DECISIONS.md`](../../../change-log/DECISIONS.md).
- On a saved Draft, Document ID, Document Type, Author, Version, and Status are read-only.
- **Electronic signature is deferred** and is not required for the initial Document Module implementation, for either submission or external registration. An external PDF is registered with Acknowledge & Register, becomes Approved, and is effective from its registration date.

### Document types

The mockup's Documents type filter offers exactly the twelve types enumerated in `05 User Story/PRD-001 - Setting/02 Documents/US-007 - Manage Document Types.md` AC-01, and the mockup's own sample documents use only those twelve. `US-006` AC-03 loads the filter from the configured list, so an unused type is still offered. `US-007` AC-03 lets an administrator add more at runtime, but nothing beyond the twelve is seeded.

Types are displayed as **"Name (ABBR)"** — `Record (REC)` — in the Documents list column and its filter, matching how the mockup stores and renders them. The abbreviation is the segment `PRD-002` places in a generated Document ID.

### Sample data

The Documents list is seeded from the mockup's own `documentRows` (`01 Research/Accura Mockup.html`): eleven rows, kept verbatim apart from the project's `9 Oct 2026` date format. An earlier twenty-four-row set, invented when the sample was expanded, typed sixteen records as Form, SOP, Procedure, Policy, Work Instruction, or Specification — none of which exist in the requirements or the mockup — and was replaced on 2026-11-10.

The mockup keeps `ACME-FRM-2026-000006` as the Document ID of a record it types `Record (REC)`, so **sample Document IDs do not track the type abbreviation**. Do not "correct" them against the `PRD-002` ID format; the prototype does not implement ID generation.
