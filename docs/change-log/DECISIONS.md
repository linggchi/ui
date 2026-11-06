# Accura Decision Log

This is the canonical history of Accura product, design-system, and prototype decisions. It records why a direction was chosen and preserves superseded directions. Current product facts live in `docs/product-knowledge/`; current rules live in `docs/rules/`; implemented changes are indexed in root `CHANGELOG.md`.

## 2026-11-06 - Role details are read-only

### Decision

Role details is a view-only surface. Disable the role name, description, module switches, and permission radios instead of allowing temporary edits. Keep every module visible, show no permission level for an uncovered module, and show the three full permission labels — Read only, Read and write, and Read and write all records — on one row for every covered module.

**Supersedes** [Role details are live, not locked](#2026-11-05---role-details-are-live-not-locked). The module coverage model and full permission wording remain current.

### Reasoning

The Roles & Permissions list exposes only View details; there is no Edit action and no save path. Interactive controls therefore imply an editing capability the product does not provide, even when the dialog explains that changes will be discarded. Disabled controls preserve the future create/edit form shape while accurately communicating the current capability. Keeping the three levels on one row makes the selected level and the available scale readable without adding vertical scanning inside each module.

## 2026-11-05 - Role details are live, not locked

**Status:** Superseded by [Role details are read-only](#2026-11-06---role-details-are-read-only). The current View details surface disables every field and permission control.

### Decision

Every control in the role dialog is interactive: the module switches, the access level radios, the role name and the description. Switching a module on defaults it to Read only. Nothing is persisted — the draft is seeded from the role each time the dialog opens, and closing discards it. The dialog subtitle says so.

Access level wording appears once per legend entry as a single inline line, label and explanation together, instead of a two-column grid.

**Supersedes** the locked-control part of [Module coverage is a switch, the access level sits under it](#2026-11-05---module-coverage-is-a-switch-the-access-level-sits-under-it) and of [Role details reuse the create and edit form layout](#2026-11-05---role-details-reuse-the-create-and-edit-form-layout).

### Reasoning

A locked form can be reviewed but not tried. The questions that matter about this model — what happens to the access level when a module is switched off, what a newly covered module should default to, whether the three levels read correctly in sequence — are only answerable by operating the controls. Making them live turns the prototype into something that can be used to settle the create/edit story rather than only illustrate it.

The risk is a reviewer believing their edits were saved, so the subtitle states plainly that they are not. Persisting them would mean building create and edit, which is still out of scope in PRD-001.

A new module defaults to Read only because granting the least privilege is the only safe default; defaulting to write would hand out access nobody chose.

## 2026-11-05 - Module coverage is a switch, the access level sits under it

**Status:** The switch and level model stands. The controls are disabled in the current View details surface under [Role details are read-only](#2026-11-06---role-details-are-read-only).

### Decision

In role details, list every module in the system with a switch. The switch says whether the role covers that module at all; a module switched off grants no access and shows no access level. Switching a module on reveals the three access levels beneath it, labelled exactly as the legend labels them.

**Supersedes** [Role permissions are read as one list, not one module at a time](#2026-11-05---role-permissions-are-read-as-one-list-not-one-module-at-a-time), which listed only covered modules and put the three levels on one line.

### Reasoning

The earlier list encoded the wrong model. It showed only the modules a role covers, which left no way to tell "this role has no access to Settings" apart from "Settings is not a module", and it implied access is always one of three levels when in fact the first question is whether the role reaches the module at all. Coverage and level are two decisions, and the switch makes the first one visible before the second.

Showing an access level for an uncovered module would also be meaningless: there is no level that means "none", so the control only appears once coverage is on.

The level labels now repeat the legend wording exactly — "Read only", "Read and write", "Read and write all records" — rather than the shortened forms the single-line layout needed. A selection label that differs from the label explaining it makes the reader check whether they are the same thing.

## 2026-11-05 - Role permissions are read as one list, not one module at a time

**Status:** Superseded by [Module coverage is a switch, the access level sits under it](#2026-11-05---module-coverage-is-a-switch-the-access-level-sits-under-it). Every module is listed with a switch, and the level appears only when the switch is on.

### Decision

Show every module the role covers as a row, each with the three access levels side by side and the granted one selected. Drop the module tab strip, the duplicated module chips, and the Modules column in the Roles & Permissions list, which now carries role name, description, users assigned, and the action.

**Supersedes** the permissions portion of [Role details reuse the create and edit form layout](#2026-11-05---role-details-reuse-the-create-and-edit-form-layout). The create/edit form shape is kept for the name and description; the permissions area is a list rather than tabs.

### Reasoning

Tabs answered "what access does this role have **in this module**". The question a reviewer actually has is "what access does this role have", and a role that varies by module cannot be answered without clicking every tab. The client raised exactly this against showing module names alone: a future Document Manager role with write on Documents and read elsewhere is unreadable unless each module's level is visible at once.

The tab strip was also a measured defect, not only a conceptual one: at eight modules it overflowed its container by 160px (878px of content in a 718px row), clipping the dialog horizontally.

Keeping all three levels visible per row, rather than only the granted one, means the row already has the shape the deferred create/edit story needs — unlocking the radios is the whole change — and it shows the scale a level sits on instead of a bare value.

## 2026-11-05 - A user holds exactly one role

### Decision

The invite and edit user form assigns a single role through a radio group, not several through checkboxes. The users list shows one Role column value per person, and the Roles & Permissions list counts a user once.

This contradicts the written requirement, which asks for multiple roles in five places: [`US-002`](../requirements/05%20User%20Story/PRD-001%20-%20User%20Roles%20&%20Permissions/US-002%20-%20Create%20User.md) AC-02 ("select one or more roles") and AC-04 ("at least one role"), [`US-004`](../requirements/05%20User%20Story/PRD-001%20-%20User%20Roles%20&%20Permissions/US-004%20-%20Edit%20User.md) AC-02, and [`PRD-001`](../requirements/04%20Epics%20-%20PRD/PRD-001%20-%20User%20Roles%20&%20Permissions.md) under the shared invite/edit form. The mockup also used checkboxes. The user confirmed the change with that evidence in front of them; the requirements repository is a separate submodule and was deliberately left unchanged.

### Reasoning

Single assignment removes the question the multi-role model never answered: when two roles cover the same module at different access levels, which one wins. With one role per user the access a person has is exactly the access its role defines, so the permission model stays decidable without a precedence rule that no requirement specifies.

Consequences carried in the same change: the user record holds `role: string` instead of `roles: string[]`, the users table column is **Role** rather than the **Roles** that US-003 AC-01 lists, and the validation message is "Select a role to continue." rather than "at least one role".

## 2026-11-05 - Role details reuse the create and edit form layout

**Status:** The permissions portion is superseded by [Role permissions are read as one list, not one module at a time](#2026-11-05---role-permissions-are-read-as-one-list-not-one-module-at-a-time). The name and description keep the form layout.

### Decision

Present built-in role details in the shape of the mockup's create/edit role form — role name, optional description, module chips, and a permissions tab per module with the three access levels as radios — with every control locked rather than editable.

**Supersedes** [Role detail shows an access matrix instead of a locked form](#2026-11-04---role-detail-shows-an-access-matrix-instead-of-a-locked-form) in full: the Module/Access level table, the removed description, and showing only the granted access levels are all reverted.

### Reasoning

Creating and editing roles is deferred, not cancelled. Building the read-only view in the same shape the editable form will take means the field order, labels and grouping do not have to be relearned when that story lands, and the later work becomes unlocking controls rather than redesigning a screen.

The earlier decision optimised for the read-only case in isolation and was right on its own terms — the matrix is denser and the module tabs never changed on interaction because every built-in role grants one uniform level. That reasoning still holds for viewing alone; it is outweighed by keeping one layout across view and edit once edit is known to be coming.

## 2026-11-04 - Persistent information uses an information panel

### Decision

Add the Accura-level `AccuraInformationPanel` composition for persistent explanatory content. It uses the shared COSS Alert information variant with a subtle blue surface, uniform thin border, icon, title, description, and `role="note"`; it exposes no close or collapse control. Use it for the Invitation email explanation in the user invitation dialog. The current usage rule is owned by [`../rules/ui-hierarchy.md`](../rules/ui-hierarchy.md#system-feedback).

### Reasoning

The Invitation email explanation is neither a role choice nor a transient system response. Its previous white card-like treatment made it look selectable. The semantic information treatment identifies its explanatory purpose without implying warning or success; keeping the border uniform avoids decorative weight at the leading edge. A reusable composition prevents future screens from rebuilding the distinction with one-off classes.

## 2026-11-04 - Collapsed navigation names itself on hover and focus

### Decision

In the collapsed sidebar, every nav item shows its label in a tooltip on hover and on keyboard focus, and the Accura mark swaps to the expand icon on hover and focus. The swap hides the mark outright rather than cross-fading, so the two are never on screen together.

This restores the expand affordance that [Selection indicators trail content and saves use toasts](#2026-11-04---selection-indicators-trail-content-and-saves-use-toasts) removed, without reintroducing the overlap that decision objected to.

### Reasoning

Collapsing the sidebar trades labels for space, but it should not trade away identification. With no tooltip, the only way to tell what an icon does is to expand the sidebar again, which defeats collapsing it. The mark had the same problem in a sharper form: it silently behaved as the expand control while looking like a logo, so nothing invited the click.

The earlier removal was a reasonable fix for the wrong half of the problem. Its objection was that an opacity cross-fade could expose both visuals mid-transition; deleting the second visual solved that but left the control unannounced. Swapping on `display` instead of opacity removes the overlap by construction — the measured state is one visible, one `display: none`, never both — so the affordance returns without the defect.

## 2026-11-04 - Selection indicators trail content and saves use toasts

**Status:** The collapsed-mark portion is superseded by [Collapsed navigation names itself on hover and focus](#2026-11-04---collapsed-navigation-names-itself-on-hover-and-focus). The mark swaps to the expand icon again, by hiding rather than cross-fading. The combobox indicator and toast portions remain current.

### Decision

Move the shared COSS `ComboboxItem` selection indicator to the inline end while keeping every option’s content aligned at the inline start. Use dismissible bottom-right success toasts for completed Settings saves and invitations. In the collapsed Accura sidebar, make the standalone mark the expand control instead of layering a second expand icon over it. The enforceable behavior is owned by [`../rules/ui-hierarchy.md`](../rules/ui-hierarchy.md) and [`../rules/visual-system.md`](../rules/visual-system.md).

### Reasoning

A leading indicator column left an unexplained blank slot before every unselected option, which made a valid default state look broken. Trailing the indicator preserves one content alignment while still making selection explicit. Save confirmation is temporary and non-blocking, so a bottom-right toast keeps it visible without inserting a new banner into the Settings layout. The previous collapsed logo target cross-faded two visuals in the same geometry and could expose both during transition; one visual per target removes the overlap entirely.

## 2026-11-04 - Icon weight and an index of deliberate overrides

### Decision

Render Iconoir icons at stroke width 2, keep icons in icon-only buttons at full strength while icons beside a label stay at the inherited 80%, and use the 28 px icon button for table row actions. Record every deliberate departure from COSS and library defaults in [`../rules/prototype-overrides.md`](../rules/prototype-overrides.md), indexed from the Accura start-here list.

### Reasoning

Three separate things made table row actions look faint: Iconoir's 1.5 stroke, the 80% opacity COSS applies to any icon inside a button, and a 14 px glyph in a 24 px target. Only the first had been addressed, and it had been addressed invisibly — the stroke override lived in an inline style block in `layout.tsx` with no record anywhere in the documentation. Any agent rewriting that file would have dropped it and produced a result that looked like the library default while appearing correct in isolation. The override index exists so that failure mode is caught by reading, not by noticing a regression later.

## 2026-11-04 - ComboboxChips gains an optional endAddon

### Decision

Add an optional `endAddon` slot to the shared `ComboboxChips` primitive in `packages/ui`, mirroring the existing `startAddon`. The slot is positioned at the inline end, stays interactive so it can host a `ComboboxTrigger`, and the container reserves its space automatically through `has-[[data-slot=combobox-end-addon]]:pe-8`. Passing nothing keeps the previous appearance.

### Reasoning

`ComboboxInput` renders a chevron trigger by default through `showTrigger`, but `ComboboxChipsInput` renders none and `ComboboxChips` only exposed `startAddon`, so every multi-select combobox looked like a plain text field with no sign it opens a list. That gap affects any application using the primitive, not only Accura, so it was fixed in the shared component rather than wrapped at the Accura level the way `AccuraTabs` is. The prop is additive and opt-in, so existing usages are unchanged.

## 2026-11-04 - Form fields state required and optional explicitly

### Decision

Mark required fields with a red asterisk after the label and optional fields with a muted "(Optional)" beside the label, and remove helper text that repeats the label or control. Give disabled inputs the Zinc 100 recessed surface with muted text at full opacity. The enforceable rule is owned by [`../rules/ui-hierarchy.md`](../rules/ui-hierarchy.md).

### Reasoning

Previously only required fields were marked, so an unmarked field could mean optional or could mean the marker was forgotten. Sentences such as "Optional. Choose one or more departments." restated the label and the control instead of adding a rule the user could not infer. The COSS `Input` wrapper signals disabled with `has-disabled:opacity-64` alone, which on a white dialog is indistinguishable from an empty editable field; a changed surface states the condition instead of implying it.

## 2026-11-04 - Role detail shows an access matrix instead of a locked form

**Status:** Superseded by [Role details reuse the create and edit form layout](#2026-11-05---role-details-reuse-the-create-and-edit-form-layout). The dialog returns to the mockup's form layout with locked controls.

### Decision

Present built-in role details as a read-only Module/Access level table. Drop the role description from the dialog and explain only the access levels the role actually grants. The user confirmed all three changes.

These diverge from [`US-005 - View Role Details`](../requirements/05%20User%20Story/PRD-001%20-%20User%20Roles%20&%20Permissions/US-005%20-%20View%20Role%20Details.md), which specifies disabled radio controls (AC-02), a displayed description (AC-02), and all three access-level definitions (AC-03). The requirements repository is a separate submodule and was deliberately left unchanged, so this log is the record of the divergence.

### Reasoning

Every built-in role grants one uniform level across its modules, so module tabs with disabled radios never changed on interaction and read as broken. A table shows all modules at once and still prevents editing. The description restated the access level and the module list that the table already shows, and defining levels the role does not use added noise. Anyone validating the prototype against US-005 should expect these three differences.

## 2026-11-04 - User accounts carry an explicit three-state status

### Decision

Give the Settings user list a Status column with Active, Inactive, and Invitation pending, rendered as filled semantic badges. Keep the identity cluster free of status so no row grows a third text line.

[`PRD-001`](../requirements/04%20Epics%20-%20PRD/PRD-001%20-%20User%20Roles%20&%20Permissions.md) defines only Invitation pending and places user activation and deactivation out of scope; [`US-003`](../requirements/05%20User%20Story/PRD-001%20-%20User%20Roles%20&%20Permissions/US-003%20-%20View%20List%20Users.md) AC-01 lists four columns and excludes account status management. The user approved the wider model for the prototype; the requirements repository was left unchanged.

### Reasoning

A single pending marker forced an exception into the identity cell and made that row taller than its peers. A dedicated column gives every account the same shape, keeps row height uniform, and leaves room for the activation states the product will need. Filled badges are correct here because status is genuine lifecycle meaning, which [`../rules/ui-hierarchy.md`](../rules/ui-hierarchy.md) separates from outline metadata.

## 2026-11-04 - Departments are a controlled list and email is fixed after invitation

### Decision

Select departments from a multi-select dropdown drawn from a defined list rather than typing them as comma-separated text. Make the email address read-only in Edit user while keeping it editable in Invite user.

This settles open question 3 in PRD-001 in favour of a controlled directory for prototype purposes.

### Reasoning

Free text let the same team be entered as "Quality" and "Quality Assurance", which silently fragments any later filtering or approver-eligibility rule that depends on department. The email address identifies the account and drives the invitation, so changing it after an invitation has been sent would detach the person from the invitation already issued; US-004 still requires unique-email validation, which now only applies when inviting.

## 2026-11-04 - Metadata badges use outline hierarchy

### Decision

Use outline badges for categorical metadata, including roles, modules, and document-type abbreviations. Keep filled semantic variants for actual status, severity, and lifecycle meaning. The current enforceable rule is owned by [`../rules/ui-hierarchy.md`](../rules/ui-hierarchy.md).

### Reasoning

Roles and modules describe classification or access scope rather than state. Giving them the same filled treatment as status made neutral metadata appear actionable or semantic; an outline preserves scanability while keeping status visually distinct.

## 2026-11-04 - Brand 950 navigation and primary treatment

### Decision

- Keep Zinc 100 as the recessed application canvas and white as the principal content surface.
- Use Brand 950 for the prototype navigation surface, principal action, and main-content focus ring.
- Use Zinc 200 for default navigation content and Zinc 100 with Zinc 900 foreground for selected or hovered navigation.
- Use Brand 150 for focus indication against the dark navigation surface.
- Apply these product-specific roles in `apps/accura-prototype/app/globals.css` after the reusable generated adapter.

### Reasoning

The darker brand anchor gives the expanding Accura prototype a stable navigation frame and stronger product identity while retaining the neutral Zinc content canvas. Keeping the override at the application layer preserves the reusable COSS adapter boundary.

### Supersedes

This replaces the light Zinc navigation portion of the 2026-11-03 application-shell decision. The Zinc canvas and white content-surface portions remain current.

## 2026-11-04 - Settings section headers separate context from content

### Decision

Use Zinc 50 for the header band of structured Settings and detail containers when it groups a title, description, and section-level action. Keep tabs, filters, tables, forms, and other working content on the white body beneath a single divider.

### Reasoning

The subtle header plane makes context and actions easier to scan without introducing another brand-colored surface. Zinc 50 remains distinct from both the Zinc 100 application canvas and the white content body, preserving the existing Accura hierarchy.

## 2026-11-04 - Card-table visual treatment deferred

### Decision

Keep the existing table treatment in Settings. Store the supplied sectioned and standalone table examples as non-binding visual references in [`../visual-references/table-compositions.md`](../visual-references/table-compositions.md). Do not apply either direction automatically or promote it into `docs/rules/` until the user confirms the scope of a coordinated table migration.

### Reasoning

Applying the inset card-table treatment only to Settings would make it inconsistent with Documents, Records, and module tables. The references remain useful for future exploration, but consistency across comparable data surfaces takes precedence over a partial restyle.

## 2026-11-04 - Settings tabs and user identity made explicit

### Decision

- Keep Settings navigation as tabs rather than changing it into a row of solid action buttons.
- Increase tab-row spacing and use Brand 950 for the selected underline and text without adding a selected background.
- Own this treatment in the Accura-level `AccuraTabs` wrapper and use it for both Settings and Dashboard tabs. Keep the shared COSS primitive visually unchanged so other applications are not affected.
- When a user’s name and email appear together, use the reusable avatar, name, and email identity cluster defined in [`../rules/user-identity.md`](../rules/user-identity.md).

### Reasoning

The previous compact neutral underline looked like static labels and made the alternate Users view easy to miss. Strong solid buttons or a filled selected tab would compete with the section action, so a more spacious branded underline preserves the correct navigation hierarchy. Pairing an avatar with the existing name and email makes people easier to scan and establishes one repeatable user pattern across Accura.

## 2026-11-02 - Documents selected as the first vertical slice

### Decision

Use Documents as the first complete prototype slice, covering List, Create, Edit Draft, Review, Approved, and Audit Trail states.

### Reasoning

The available screens and specification cover enough of the regulated lifecycle to establish reusable list, form, workflow, signature, version, and audit patterns before expanding to other modules.

## 2026-11-02 - Token mapping prioritized

### Decision

Visual direction selection is intentionally deferred. The next workstream is to map the Accura token system into COSS so every later prototype direction uses the same visual and component contract.

### Source Boundary

- Only files inside `/Users/mac/Documents/GitHub/Coss` may be used as project sources.
- Files previously observed outside the repository are out of scope and must not be read or reused.
- Token counts and contents must be re-established from exports that the user places inside the repository.

No external token file is an implementation source of truth.

## 2026-11-02 - Repository token boundary established

### Context

- `brand-assets/Primitives.json` contains 229 literal tokens.
- `brand-assets/Semantics.json` contains 115 aliases in Light mode, but is not an active theme input.
- The Primitive collection contains 25 colors under `color/brand/*` and `color/zinc/*`.
- The source has no web code syntax, so approved palette names are generated deterministically.
- Accura typography, spacing, radius, shadow, opacity, motion, status, and chart tokens are outside the integration boundary.

### Decision

- Added an explicit palette-only Accura-to-COSS mapping contract.
- Added deterministic generation for brand and Zinc colors only.
- Added a partial COSS theme override and a single CSS entry point.
- Added source-boundary, collision, mapping, drift, and direct-pair contrast validation.
- Added root scripts for generation and drift checking.

### Superseded Direction

The initial full Semantic-to-COSS bridge was rejected because it introduced a second semantic system and made the prototype feel too heavy. `Semantics.json` remains reference material only and is not read by the generator.

## 2026-11-02 - Palette-only COSS adapter confirmed

### Decision

- Treat Accura as a brand skin over the current COSS theme.
- Import only `color/brand/*` and `color/zinc/*` from `Primitives.json`.
- Use `brand/800-base` for primary, `brand/500` for focus, and the dark brand tones for the sidebar.
- Keep COSS white surfaces, alpha border/input/muted roles, status colors, charts, radius, spacing, density, component behavior, and Cal Sans typography.
- Keep COSS white for primary foreground because it reaches 4.52:1 on `brand/800-base`; `zinc/50` reaches only 4.32:1.
- Scope the current adapter to light mode. Native COSS dark mode remains unchanged until an Accura dark palette is intentionally designed.

### Historical Next Action

Prove the palette adapter against a small COSS component specimen before creating the Accura prototype app. This action was subsequently completed.

## 2026-11-03 - Primary and secondary hierarchy refined

### Decision

Adopt a quieter primary/secondary hierarchy for the prototype. The current enforceable rule is owned by [`../rules/ui-hierarchy.md`](../rules/ui-hierarchy.md).

### Reasoning

Repeating primary green across navigation, links, table chrome, pagination, and calls to action flattened the hierarchy and made the Documents workspace feel visually heavy. A neutral secondary layer keeps the interface calm while allowing the primary action to remain obvious.

## 2026-11-03 - Light Zinc application shell

**Status:** Partially superseded by [Brand 950 navigation and primary treatment](#2026-11-04---brand-950-navigation-and-primary-treatment). Zinc remains the application canvas, but the navigation surface is no longer light Zinc.

### Decision

- Use Zinc for the recessed application canvas and light navigation rail.
- Reserve white for the sticky global header and principal content containers.
- Keep brand color focused on selected navigation, primary actions, focus, and intentional interaction accents.

### Reasoning

The earlier dark and brand-tinted shells competed with the regulated document workspace. A neutral shell gives the content clearer hierarchy and keeps Accura recognizable without covering the interface in green.

## 2026-11-03 - Official logo and sidebar collapse behavior

**Status:** Partially superseded by [Selection indicators trail content and saves use toasts](#2026-11-04---selection-indicators-trail-content-and-saves-use-toasts). The dimensions and official assets remain current; the mark no longer swaps to a second expand icon.

### Decision

- Use the official Accura SVG logo and mark stored in the prototype.
- Use a 248 px expanded sidebar and a 64 px collapsed sidebar.
- In collapsed state, show only the Accura mark in the centered logo/expand target.

### Reasoning

The official asset preserves brand fidelity, while a single centered mark/expand target prevents duplicate controls and keeps the collapsed rail aligned.

## 2026-11-03 - Global search replaced repeated page context

### Decision

Use the top bar for cross-product search rather than repeating the current page title and subtitle. Keep the page-specific title in the content area and expose the `⌘ K` shortcut.

### Reasoning

Repeating “Documents” in both the header and page content spent high-value space without adding orientation. Global search gives the shell a reusable product-level function.

## 2026-11-03 - Iconoir adopted for the Accura prototype

### Decision

Adopt Iconoir for prototype-level interface icons while retaining official Accura SVGs as brand assets. The current enforceable rule is owned by [`../rules/visual-system.md`](../rules/visual-system.md).

### Reasoning

Iconoir’s lighter geometry fits the neutral shell and Cal Sans better than the prior prototype-level Lucide set. COSS may retain its internal icon dependencies; this decision applies to the Accura application layer.

## 2026-11-03 - Documentation ownership model established

### Decision

- Use root `ACCURA.md` as the human and AI entry point without replacing the upstream COSS README.
- Use root `CHANGELOG.md` only as a concise chronological index.
- Use this file as the canonical detailed decision history.
- Use `docs/product-knowledge/` for current product truth and `docs/rules/` for current enforceable rules.
- Keep implementation verification in the owning app’s `design-qa.md` and token mechanics in `brand-assets/`.

### Reasoning

The previous discovery, implementation, and token documents each contained useful information but did not define ownership. Separating current truth, current rules, historical rationale, implementation evidence, and change indexing prevents competing sources of truth. The root change index links to canonical detail instead of synchronizing duplicated prose.

