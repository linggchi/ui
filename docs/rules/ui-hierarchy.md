# Accura UI Hierarchy Rules

## Action Priority

Use at most one solid primary action in the same task context. A page and an open dialog may each have their own primary action because they are separate contexts.

| Variant | Use for | Current examples |
|---|---|---|
| Primary | The principal action that advances the current task | Create Document, Continue, Submit for Review, Approve & Sign |
| Secondary | Supporting actions and selected controls that need clear but quieter emphasis | Current selection, active pagination, Save as Draft, medium-priority utility actions |
| Outline | Utilities and lifecycle actions that must remain discoverable without competing with the task | Download, Export, Filter, View Audit Trail |
| Ghost | Low-emphasis, reversible, or compact controls | Cancel, Close, icon utilities, row action menu |
| Destructive | Actions with harmful, irreversible, or lifecycle-ending consequences | Reject, Delete, Mark as Obsolete when the consequence is confirmed |

## Navigation Selection

- Navigation selection communicates location; it is not a call to action.
- Do not let selected navigation compete with the page’s principal action.
- Prefer a secondary or brand-soft selected surface when a solid brand selection makes the shell visually heavy.
- A segmented control's track is a backdrop, not a selection: keep it neutral and leave the white moving indicator to mark the chosen segment. Colouring the track brand-soft, or filling the indicator with a brand or accent colour, was tried and rejected — the first makes the unselected half look chosen, the second shouts louder than the page's primary action. Use Zinc 200 so the track separates from the canvas, and take every step from the generated palette; never mix a shade by hand.
- Keep visible focus independent from selected state.
- When navigation collapses to icons, every item names itself on hover and on keyboard focus. An icon alone is a guess, and expanding the sidebar to find out what an item is defeats collapsing it. Expanded, the label is already visible, so no tooltip appears.
- A brand mark that doubles as the expand control must reveal the expand icon on hover and focus; a logo that acts as a button without announcing it gives no reason to click. Swap the two by hiding one, never by cross-fading, so both are never visible at once.

## Icons

- Accura renders Iconoir icons at stroke width 2, not the library default of 1.5. The 1.5 default is too light against Accura's type weight and disappears in dense tables.
- An icon inside a button that also has a visible label stays at the inherited 80% emphasis so it does not compete with the label. An icon-only button has no label, so its icon carries full strength: the icon is the entire affordance.
- A table row action uses the 28 px icon button, not the 24 px one. At 24 px the target is below a comfortable pointer size and a three-dot glyph renders too small to read as a control.

## Wide tables

- A register with more columns than the viewport holds **scrolls**; it does not hide columns at fixed breakpoints. A hidden column takes data away instead of making it reachable, and the widths between two breakpoints still overflow.
- The trailing action cell stays pinned to the trailing edge, so a row's actions never scroll out of reach and a user never has to scroll to the end of a row to act on it.
- **At rest the cell is invisible.** It carries no surface, no border, no shadow, and its action is hidden, so the row reads as one continuous row and the column underneath is legible to its own end. A cell raised on every row at once draws a permanent band down the register and covers a column no one asked it to cover.
- **The action appears on the row the pointer or keyboard is on**, and only there, as a raised chip: a white surface, a 1 px border and a soft shadow. Put the elevation on the action, not on the cell — a shadow spread across a full-height cell against a near-white row is present in computed style and invisible in use. A bordered white chip on the row's tinted hover surface separates on contrast as well as on shadow.
- The cell itself only masks: on that row it takes the row's hover surface so the columns passing underneath do not show through, and carries no border or shadow of its own.
- **At the end of the row, drop all of it.** The actions now sit in their own column with nothing behind them, so every row shows a plain action and none of them is raised: no surface, no border, no shadow. The reveal and the elevation both exist to handle a column being covered; where nothing is covered they only make the last column look like it is floating over the register.
- A hover-only reveal is unreachable by keyboard and on touch, so the row answers to focus as well as hover — but to `:focus-visible`, not `:focus-within`. Closing a menu returns focus to its trigger, and with `:focus-within` that row stays revealed while the pointer has already moved on, showing two raised actions at once on a list where only one row is being pointed at.
- **An open menu keeps its row revealed, and that cannot be done in CSS.** The popup is portalled out of the table, so once it opens the pointer has left the row and focus sits inside the portal: `:hover` and `:focus-within` are both false and the row drops back to rest, leaving a menu hanging off a chip that is no longer drawn. Hold the open row in state and let the row, its cell and its chip read from it.
- The header has no trailing cell of its own to pin. A header is never hovered and holds no action, so there is nothing for it to keep in reach; pinning it only clips the last heading and leaves a block in the corner above rows that are clean. Its trailing cell scrolls with the rest of the header.
- Truncate a long cell value and give it its full text on hover; never let it set the column's width.

## Workflow stepper

- The four stage names — Draft, In Review, In Approval, Approved — are **semibold in the brand colour at every stage**, completed, current and future alike. They name the lifecycle, which does not change with where the document sits; weighting only the current one made the other three read as disabled.
- The line under each stage — "Completed by…", "Current stage" — stays muted and regular at **12px**, the smallest size used anywhere in Accura. 11px read as noise rather than information.
- **The caption names one actor, or counts several — it never lists some and hides the rest.** A stage with exactly one actor names that person ("Completed by Amit Kothari"); the Review stage can have many, so it states a count ("Approved by 2 Reviewers"). "Amit, +1" asks the reader to work out what the +1 counts and truncates a surname, which is the wrong thing to abbreviate in a QMS. The Approval card beside the stepper already names everyone with their decision — repeating the roster in the narrowest element on the screen gives one fact two sources, and the narrow one breaks first.
- The caption is derived per stage, not written once: Draft names the Author, Review counts the Reviewers, Approval names the Approver. A single hard-coded name was showing the Author as having completed all three.
- Completed, current and future are distinguished by the marker (filled check, ringed number, plain number), never by the label's colour or the connector alone.
- A document that is not at a stage shows no stepper: an External Document has no review or approval path, and a Superseded or Obsolete version is no longer at the Approved stage the stepper would mark as current.

## Identifiers and counters

- **The identifier that opens a record carries a link colour at rest**, not the foreground every other cell uses. Hover alone does not mark it: a user has to find it before they can hover it. Accura's `--primary` (Brand 950, `#00393f`) is too close to body text at table sizes to read as anything, so the link takes **Brand 900 (`#175e41`)** — a clear hue shift at 7.7:1 on white — with the underline revealed on hover.
- **A section heading does not carry a progress counter against a maximum.** "Attachments · 0/5" reads as a quota to fill, not a ceiling not to exceed. The maximum belongs in the section's hint, and the Add control is disabled once it is reached — the limit then states itself where it applies.
- **A count of what is there is useful; show it as a badge on the heading.** Attachments, Reference Documents and each reference group carry one, so a collapsed-looking card still says how much is in it. The badge is the total, never a ratio — except on a route, where `2/3` is the fact (`Reviewers 2/3` means two of three have approved).
- **A list of content does not need a button per row.** When the only action on an item is to open it, the item's own name is the link — a name plus an Open button beside it gives one target two controls and makes a list read as a toolbar.

## Capitalisation

This went wrong three times in two days — *Document category*, *Reference documents*, *Revision history* — so it is written as one rule with no judgement calls in it.

**Ask one question: does this text head a section or a group of content, or does it label a single value or control?**

**A button or menu item is sentence case** — one capital, on the first word: *Add user*, *Add type*, *Add attachment*, *Save as draft*, *Submit for review*, *Acknowledge & register*, *Mark as obsolete*. The only capitals after that are proper nouns: module names (*Back to Documents*), role names, and PRD-002's own defined terms (*Controlled Document*, *External Document*). A control's `aria-label` matches its visible label; they had drifted on the create form's Document type field.

- **Heads a section or a group → Title Case.** Every section card heading, and every group heading inside one: *Primary Document*, *Document Information*, *Reference Documents*, *Related Documents*, *Referred Documents*, *Revision History*, *Document Category*, *Approval*, *Attachments*, *Reviewers*, *Approver*.
- **Labels one value or control → sentence case.** Every form field label and every read-only field label: *Document name*, *Document type*, *Effective date*, *Next periodic review*, *Email address*, *First name*, *Related documents* (as the label on a search input). Acronyms keep their case: *Document ID*.

**One thing has one name across every screen.** The create form, the Draft editor and the details view all say *Document Information*, *Reference Documents* and *Approval* — not *Document Details* here and *Document Information* there. When a heading is added or renamed, grep the other screens for the old name before finishing.

## Action bars on a record

- **One named action, the rest in a menu.** A record screen accumulates actions — print, download, revise, obsolete, audit — and a row of six outline buttons gives them all the same weight and wraps on a laptop. Keep visible the one action a reader of *any* record in *any* status reaches for (on a document, the audit trail) and collapse the rest into **More actions**.
- Inside that menu, a **status-gated** action is disabled rather than hidden — the menu is also where someone looks to learn the action exists. A **permission-gated** action is absent, because showing a user something they can never do is not information.
- **A row menu holds only actions that do something.** A dead entry teaches the reader that the menu is decorative. And an item whose only outcome is to open a record opens it — a dialog that summarises the row and then offers "Open document" puts a step in front of the one thing it can do.
- **The status strip at the foot of a record behaves the same whatever the status.** It was sticky while a decision was pending and static once the document was Approved, so the one element whose job is "where does this stand" moved depending on which document you opened.

## Gated actions and decision dialogs

- When a user is not entitled to act, the action **is not shown**, and a banner says why. A disabled Approve still presents the decision as theirs and merely blocked; a requirement that says the record is "displayed in read-only mode" means the control is absent, not dimmed.
- **A decision that is recorded and auditable is confirmed before it is recorded**, and the confirmation states the consequence rather than asking "Are you sure?" — whether this is the last approval outstanding changes what the same click means. A confirmation is not an electronic signature: it captures no credential and performs no identity check, so it does not reinstate a signature step a requirement defers. When a real signature arrives it replaces the confirmation; two confirmations for one decision is worse than none.
- **Say what the record is waiting for, not what it lacks.** A reviewer who has not decided is **Awaiting**, not "Pending" — pending reads as "not yet asked". Rename the stored value, not just the label, so the two cannot drift.
- A required field in a decision dialog keeps its submit control **live**. Pressing it with the field empty marks the field invalid and replaces the hint with the instruction; typing clears both. A disabled submit prevents the attempt instead of answering it, and leaves a user who cannot tell what is missing.
- A dialog opened by setting state, rather than by a `DialogTrigger`, never receives `onOpenChange(true)` from Base UI. Per-use state — a reason, a draft, a validation flag — must be reset on the open **transition**, read in render, or the previous use's value survives into the next one.
- **A form whose footer holds the commitment actions also holds the way out.** A Cancel that discards silently is the thing to avoid, not the Cancel itself: route it through the same confirmation as the breadcrumb and it cannot lose work. Asking a user to scroll back to a breadcrumb to leave is not a safeguard.
- Progress through a multi-party stage is held **per party**, with the decision recorded against the person who acted. A single shared flag cannot express "three of four have approved", and it quietly lets one decision stand in for everyone's.

## List screens

One shape for every screen that lists records, set by Settings > Users and now followed by the Dashboard's Records section:

- **One card holds the whole section** — heading band, tabs, filter row, table. A heading and tabs loose on the canvas above a separate table card read as three unrelated things.
- **The heading line holds the section's primary action** (Add User). A filter does not belong there; it goes in the filter row with the result count, where the search sits.
- **The filter row carries the count** of what is currently shown.
- **The table sits behind a `border-t`**, with the Zinc 50 header row.
- **The row action is a “…” menu**, never a bare icon button. One place for row actions means a second action can be added later without redesigning the column.
- **An identifier and a name are two columns**, never stacked in one cell. Stacked, neither can be scanned down the page — the eye has to read two lines per row to find one value. The identifier keeps the register's link treatment (Brand 900, underline on hover) wherever it appears.
- **Status and priority use the 8% semantic tints**, never saturated `destructive` — see §Badges.

**A settings screen owns the value, and the feature reads it.** When a Settings story exists for something a module uses — a document type's review frequency, the ID format, the department list — the value lives in one shared module, Settings edits it and the feature reads it. A hard-coded copy in the consuming screen means Settings is showing a value it does not own, and the module is using one nobody can change. Three of those were removed on 2026-11-11.

## Metric cards

- **One coloured mark per card, and it is the one that carries words.** The dashboard card went through two wrong answers: a lime rule used nowhere else in the product, then a state-coloured rule — which at least meant something, but left each card with a coloured stripe, a tinted icon and a tinted badge all saying "Overdue". Five cards × three marks is fifteen pieces of colour for five numbers. Keep the badge, which states the status in words; drop the rest.
- **Making a decoration meaningful is not the same as needing it.** Giving the stripe a job made it defensible, not necessary. Ask whether the card loses information without it.
- Before adding a decorative accent, grep the token. `--accura-pop` appeared in exactly one place in the prototype and read as a mistake because of it.
- **A pop colour wants one home, not a thin spread.** `--accura-pop` failed as a stripe across five dashboard cards and works as a single Getting started card in the navigation rail. The test is whether a reader can say what the colour means; spread over everything it means nothing, used once against the brand's dark surface it is obviously the thing asking for attention.
- **A card that looks pressable does something.** Four of the five module cards lifted on hover and led nowhere once a dead selection state was removed; they are plain cards now, and only the built module is a button.
- **A selected state that drives nothing is not a state.** `selectedModule` was written and read in one place — its own styling — so it gave one card a different border on load and meant nothing. Before styling a selection, check what reads it.
- **The number owns its own line**, above the label, with the detail muted beneath. Sharing a line with a sentence makes the figure the card exists to show compete with grey text.
- **Status badges on a dashboard use the same tints as everywhere else** — the 8% semantic surfaces, not saturated `destructive`. Several saturated chips in one grid shout over the numbers they label.
- A metric and its caption must not repeat each other. A detail string that starts with the metric renders as "0 0 overdue".
- **Let the grid wrap where it wraps.** Five cards in three columns leave a gap in the second row; closing it by narrowing the columns truncates the captions. Tidying the layout at the cost of the data is the wrong trade. Settled 2026-11-11.

## Badges

- One badge size across the product: 22 px tall with 12 px text. A filled status badge and an outline metadata badge appear in the same table row, and two heights on two baselines read as a mistake.
- **Filled = status. Outline = metadata.** No status may take the outline treatment, because outline already means "this is a category, not a state". Superseded did, so `Superseded · Controlled` in one row read as two badges of the same kind.
- **Every status has its own hue.** The document statuses:

| Status | Treatment |
|---|---|
| Draft | `secondary` |
| In Review | `warning` |
| In Approval | `info` |
| Approved | `success` |
| **Superseded** | **violet — `--accura-status-superseded-surface` (#f3e8ff, Tailwind purple-100) on `--accura-status-superseded-text` (#6b21a8, purple-800), 7.39:1** |
| Obsolete | `error` |

- Superseded is violet rather than amber or red on purpose. It is a handover state, not a fault: the version stays in use until its successor takes effect, and a cautionary colour would tell the reader to stop using a document they are still meant to follow.
- **The mapping lives in one place** — `apps/accura-prototype/components/document-status.ts` — and both the register and the details view read it. They each held their own copy until 2026-11-11, which is why Superseded was outline in both.
- **A count badge on a section heading is noise on a read-only panel.** The items are listed directly underneath and can be counted by looking. Removed from Attachments, Reference Documents, the reference groups and the approval route on 2026-11-11.

## Permission and configuration matrices

- When a setting applies per item — an access level per module, a notification per event — show every item in one list with its current value visible. Do not put the items behind tabs: a tab shows one item at a time, so a configuration that varies between items cannot be read without clicking through all of them.
- Where an item can be excluded entirely, make inclusion its own control and list every item, included or not. An absent row cannot distinguish "excluded" from "does not exist", and a value shown for an excluded item is meaningless. Reveal the value only once the item is included.
- Keep every item label at the same text emphasis whether its inclusion control is on or off. Inclusion changes the control state and whether its value is shown; it does not make the item itself less important or harder to scan.
- A selection label must repeat the wording of the text that explains it. Shortening one of them makes the reader stop to check whether the two mean the same thing.
- Show the available values alongside the chosen one, not the chosen value alone. The reader learns the scale a value sits on, and a read-only view built this way becomes editable by unlocking the control rather than by redesigning the screen.
- When the available action is View details and no edit or save path exists, disable every field and selection control in that detail surface. Do not make temporary changes merely to demonstrate a future editing model.

## Form fields

- Mark a required field with a red asterisk immediately after the label text. Mark an optional field with a muted "(Optional)" beside the label. Every field in a form carries one marker or the other, so absence is never ambiguous.
- Do not add helper text that only repeats what the label, marker, or control already says. Reserve supporting text for rules the user cannot infer.
- **A Save button is disabled until something in its section has changed**, so the control itself says whether there is anything to save. It returns to disabled after the save.
- **A button says the verb, not the section it is in.** *Save*, inside a card headed Record Numbering, not *Save Record Numbering* — the heading is right above it and the label repeating it only makes the button longer.
- A disabled control must change surface, not only dim. Use the Zinc 100 recessed plane with muted text and keep the border at full strength; opacity alone makes a disabled field read as an empty editable one.
- **The Add-inside-the-input pattern belongs to Tags, and only to Tags.** Typing several short free-text values in a row is the case it serves: Enter adds one, the inline-end Add button is there for anyone who does not know that, and the field stays ready for the next value. Settled as a local convenience on 2026-11-11, deliberately **not** generalised to "any free-text field with an Add".
- A field whose value comes from a **known set** — Reviewers, Departments, Related and Referred Documents — is a combobox with chips inside the input, never a text box with an Add button. The user is choosing, not composing, and a text box invites a value that does not exist.

## Selection controls

- In listbox and combobox options, place the option content at the inline start and the selected check or state indicator at the inline end.
- Unselected options must not reserve an empty indicator gutter before their content. Every option label begins on the same leading alignment, whether it is selected or not.
- Apply this behavior in the shared COSS `ComboboxItem` **and** `SelectItem` primitives so every consumer inherits it without screen-level overrides. A rule that names one primitive applies to its siblings; when a sibling is found missing it, fix the primitive and widen this line rather than patching the screen.

## One content type, one shape

- **The same content keeps the same rank on every screen.** Tags are a field of Document Information on the create form, in the Draft editor and in the details view — not a field on two screens and a section on the third. Before adding a card, check what the other screens that hold the same content do with it.
- **The same content keeps the same treatment whether it is editable or not.** A linked reference is a plain row with the Brand 900 name in both the editor and the read-only panel; only the remove control appears or disappears. Wrapping the editable one in a bordered box made one document's references look like a different kind of object depending on its status.
- **An empty-state line answers a question the reader of saved content is asking.** On a form, the input underneath already says the list is empty and what to do about it, so "None linked." is noise there. Show it read-only, hide it while editing.

## System feedback

- Use a bottom-right toast for brief, non-blocking confirmation after a completed action such as saving Settings or sending an invitation. **Every module uses the same one** — Documents kept its own inline banner for save confirmations until 2026-11-11, so one kind of message appeared two ways depending on which module the user was in.
- **The toast clears any sticky footer on the screen.** Its default bottom offset put the confirmation on top of the Submit button the user had just pressed. Raise the offset, not `--toast-inset`, which also drives the viewport width and the enter and exit animations.
- Give each toast semantic text and an icon, include a dismiss control, and auto-dismiss it after a short interval. Color supports the message but never carries the meaning alone.
- Keep inline alerts for persistent, contextual, blocking, or actionable information that must remain beside the affected content. Do not replace validation errors or required next steps with an ephemeral toast.
- Use the Accura-level `AccuraInformationPanel` for persistent explanatory content that helps a user understand a nearby task but does not report validation, warning, or success. It uses the semantic information-blue surface, a uniform thin border, icon, title, and description so it remains distinct from selectable cards.
- A persistent information panel has no close or collapse control by default. Do not imply that required task context can be dismissed; add a visibility control only when hiding the content is a real user setting.

## Tabs

- Tabs must read as available navigation, not as passive labels. Give the tab row enough vertical space to separate it from nearby headings, controls, and data.
- Across Accura, use the shared `AccuraTabs` wrapper for underline tabs. Keep tab backgrounds transparent in default, selected, and hover states, and use Brand 950 for the selected underline, selected text, and hover text.
- Keep unselected tabs neutral and preserve hover and keyboard-focus feedback. Do not turn tabs into primary actions.

## Color Hierarchy

- Reserve solid Accura primary green for principal actions and intentionally strong brand anchors.
- Use COSS secondary or neutral surfaces for table headers, row hover, pagination selection, notices, and supporting selection states.
- In structured Settings or detail containers, use a Zinc 50 header for the title, description, and primary section action; keep tabs, controls, and data on the white body below one divider. Do not repeat gray bands for nested content.
- Keep document names neutral at rest; reveal primary color on interaction when useful.
- Do not use primary color as the only indication of state.

## Semantic Actions And Status

- Status colors communicate lifecycle meaning and must not be replaced by primary or secondary styling.
- Use outline badges for categorical metadata such as roles, modules, and document-type abbreviations. Reserve filled semantic badges for actual status, severity, or lifecycle meaning.
- Reject and other negative actions must not look like ordinary primary progression.
- Approve or Reject requires the regulated confirmation and electronic-signature behavior defined in product knowledge; button styling does not remove that friction.

## Accessibility

- Every icon-only button requires an accessible name.
- Focus indication must remain visible regardless of hover, selection, or status color.
- Text and icons must retain sufficient contrast in default, hover, pressed, selected, disabled, and focus states.
- Color must be supported by text, iconography, position, or another non-color cue.
