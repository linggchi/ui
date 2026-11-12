# QA evidence

Screenshots cited by [`../design-qa.md`](../design-qa.md), one set per iteration:

- `reference-*` — the source being matched (Agentic/COSS, or a design system scanned for a decision)
- `implementation-*` — Accura rendering the same thing
- `qa-comparison-*` — the two placed side by side

No code imports these. They are the record of what a screen looked like when a
decision was made, which is why `AGENTS.md` requires a browser verification
pass per screen: a screenshot taken before a requirement changed stops being
evidence.

They live here rather than at the app root, where 125 of them sat among
`package.json` and `next.config.ts` until 2026-11-12. Add new ones here and
cite them as `design-qa/<name>` from `design-qa.md`. Twelve files no file
cited were deleted in the same pass — if nothing cites it, it is not evidence.
