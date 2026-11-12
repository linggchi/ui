// Catalogue content is derived from the settled Accura sources:
//   docs/rules/*.md · docs/change-log/DECISIONS.md · CHANGELOG.md
//   apps/accura-prototype/design-qa.md (QA iterations)
// "ready" = has an approved rule + decision + QA evidence.
// "draft" = built and consistent, but not yet settled or recently changed.

export type EntryStatus = "ready" | "draft";

export type CatalogueSource = {
  label: string;
  where: string;
};

export type CatalogueEntry = {
  appliedIn: string[];
  consistency: string;
  group: string;
  id: string;
  rules: string[];
  sources: CatalogueSource[];
  status: EntryStatus;
  statusNote?: string;
  summary: string;
  title: string;
};

export type CatalogueGroup = {
  description: string;
  id: string;
  title: string;
};

export const groups: CatalogueGroup[] = [
  {
    description:
      "Tokens and primitives every surface inherits: color, icons, type, brand assets.",
    id: "foundations",
    title: "Foundations",
  },
  {
    description:
      "The application frame — navigation rail, top bar, and content canvas.",
    id: "shell",
    title: "Shell & Navigation",
  },
  {
    description:
      "Reusable interface controls with a defined look and behavior.",
    id: "components",
    title: "Components",
  },
  {
    description: "Composed blocks of information that recur across modules.",
    id: "patterns",
    title: "Patterns",
  },
  {
    description:
      "Lifecycle and task flows. Most are in flux while PRD-002 settles.",
    id: "behaviors",
    title: "Behaviors",
  },
];

export const entries: CatalogueEntry[] = [
  // ---------------- Foundations ----------------
  {
    appliedIn: [
      "Every prototype surface (sidebar, top bar, content islands).",
      "brand-assets generated adapter + app/globals.css overrides.",
    ],
    consistency:
      "Consistent. Applied through generated tokens plus a single globals.css override layer, shared by every app.",
    group: "foundations",
    id: "color-theme",
    rules: [
      "Brand 950 for the navigation surface and principal action.",
      "Zinc 100 for the recessed canvas; white for principal content surfaces.",
      "Zinc 100 / Zinc 900 foreground for selected or hovered navigation.",
      "Brand 950 focus ring on content; Brand 150 focus on the dark nav.",
      "Colour never carries meaning alone.",
    ],
    sources: [
      { label: "Rule", where: "docs/rules/visual-system.md §Color And Theme" },
      {
        label: "Decision",
        where: "DECISIONS.md · 2026-11-04 Brand 950 navigation and primary",
      },
      { label: "Mapping", where: "brand-assets/README.md" },
    ],
    status: "ready",
    summary: "Brand 950 nav + primary, Zinc 100 canvas, white content islands.",
    title: "Color & Theme",
  },
  {
    appliedIn: [
      "All prototype icons via iconoir-react.",
      "Table row actions, buttons, nav, status markers.",
    ],
    consistency:
      "Consistent. Stroke-2 and the icon-only exception are enforced in layout.tsx + globals.css and indexed in prototype-overrides.md.",
    group: "foundations",
    id: "icons",
    rules: [
      "Iconoir at stroke width 2 (not the 1.5 default) on a 24×24 grid.",
      "Icon beside a visible label sits at 80% emphasis.",
      "Icon-only button keeps the icon at full strength — it is the whole affordance.",
      "Decorative icons use aria-hidden; icon-only controls need an accessible name.",
    ],
    sources: [
      { label: "Rule", where: "docs/rules/ui-hierarchy.md §Icons" },
      { label: "Override", where: "docs/rules/prototype-overrides.md" },
      { label: "QA", where: "design-qa.md · Iteration 6 — Iconoir system" },
    ],
    status: "ready",
    summary:
      "Iconoir, stroke width 2, with a full-strength icon-only exception.",
    title: "Icons",
  },
  {
    appliedIn: ["All interface copy and headings across both apps."],
    consistency:
      "Consistent. Variation-settings roles are set once in globals.css (GEOM 25 body, GEOM 50 headings, GEOM 0 identifiers).",
    group: "foundations",
    id: "typography",
    rules: [
      "Cal Sans roles; no added letter-spacing.",
      "font-optical-sizing: auto, never a hard-coded opsz.",
      "One GEOM value per role; no synthesized bold or italic.",
      "Typeset punctuation (’ – − “ ”) in UI strings.",
    ],
    sources: [
      { label: "Rule", where: "docs/rules/visual-system.md §Typography" },
      { label: "Guide", where: "packages/ui/src/fonts/font-guide.md" },
    ],
    status: "ready",
    summary:
      "Cal Sans with role-specific GEOM; no letter-spacing or synthesis.",
    title: "Typography",
  },
  {
    appliedIn: [
      "Expanded sidebar (horizontal logo) and collapsed sidebar (mark).",
    ],
    consistency:
      "Consistent. Only the official SVGs are used; the mark doubles as the expand control.",
    group: "foundations",
    id: "brand-assets",
    rules: [
      "Horizontal logo when expanded, standalone mark when collapsed.",
      "Cropping via viewBox is allowed; redrawing the logo is not.",
      "In collapsed nav render one visual inside the target — no layered second icon.",
    ],
    sources: [
      { label: "Rule", where: "docs/rules/visual-system.md §Brand Assets" },
      { label: "QA", where: "design-qa.md · Iteration 5 — logo crop" },
    ],
    status: "ready",
    summary:
      "Official SVG logo/mark; crop-not-redraw; mark is the expand control.",
    title: "Brand Assets & Logo",
  },

  // ---------------- Shell & Navigation ----------------
  {
    appliedIn: [
      "App shell of accura-prototype (Documents, Settings, Dashboard).",
    ],
    consistency:
      "Consistent. One AppSidebar drives every module; collapse behavior and selection styling are shared.",
    group: "shell",
    id: "sidebar",
    rules: [
      "Selection communicates location — it must not compete with the page's primary action.",
      "Collapsed items name themselves on hover and keyboard focus; expanded items show no tooltip.",
      "The brand mark doubles as the expand control and reveals the expand icon by swapping (never cross-fading).",
      "Keep visible focus independent from selected state.",
    ],
    sources: [
      {
        label: "Rule",
        where: "docs/rules/ui-hierarchy.md §Navigation Selection",
      },
      {
        label: "Decision",
        where: "DECISIONS.md · 2026-11-04 Collapsed navigation names itself",
      },
      { label: "QA", where: "design-qa.md · Iteration 10 / 5" },
    ],
    status: "ready",
    summary:
      "Collapsible rail; tooltip-on-collapse; mark is the expand toggle.",
    title: "Sidebar",
  },
  {
    appliedIn: ["Top bar of every prototype module."],
    consistency:
      "Built and consistent, but documented only through QA iterations, not a dedicated rule.",
    group: "shell",
    id: "topbar",
    rules: [
      "Border-only top bar — no separate fill plane.",
      "Global search with a ⌘K shortcut affordance.",
      "Notification bell with a count badge; identity cluster at the inline end, which follows the prototype role switcher beside it.",
      "A single Getting started card in the lime pop colour sits at the foot of the rail, above the support links, and is hidden when the rail is collapsed.",
    ],
    sources: [{ label: "QA", where: "design-qa.md · Iteration 13 / 14 / 17" }],
    status: "draft",
    statusNote:
      "No dedicated rule yet — behavior lives only in QA iterations. Needs a rule entry before it is a standard.",
    summary:
      "Border-only bar: global search ⌘K, notifications, identity cluster.",
    title: "Top Bar",
  },
  {
    appliedIn: ["The outer layout of every prototype screen."],
    consistency:
      "Consistent. The Zinc canvas + rounded white islands pattern is applied uniformly.",
    group: "shell",
    id: "app-canvas",
    rules: [
      "Zinc 100 recessed canvas behind rounded white content islands.",
      "Content, sidebar, and panels float as separate rounded surfaces.",
    ],
    sources: [
      { label: "Rule", where: "docs/rules/visual-system.md §Color And Theme" },
      {
        label: "QA",
        where: "design-qa.md · Iteration 11 — Zinc canvas with white islands",
      },
    ],
    status: "ready",
    summary: "Zinc 100 canvas with rounded white content islands.",
    title: "App Canvas",
  },

  // ---------------- Components ----------------
  {
    appliedIn: [
      "Create Document / Continue / Submit (primary).",
      "Download, Export, Filter, View Audit Trail (outline).",
      "Cancel, Close, row menus (ghost); Reject, Mark as Obsolete (destructive).",
    ],
    consistency:
      "Consistent. A five-tier table in the rule governs every action; one primary per context.",
    group: "components",
    id: "action-priority",
    rules: [
      "At most one solid primary action per task context (a dialog is its own context).",
      "Primary = advance the task; Secondary = quieter support / selected state.",
      "Outline = utilities & lifecycle that stay discoverable; Ghost = low-emphasis/reversible.",
      "Destructive = harmful, irreversible, or lifecycle-ending.",
    ],
    sources: [
      { label: "Rule", where: "docs/rules/ui-hierarchy.md §Action Priority" },
      {
        label: "Decision",
        where: "DECISIONS.md · 2026-11-03 Primary and secondary hierarchy",
      },
      { label: "QA", where: "design-qa.md · Iteration 11 — hierarchy" },
    ],
    status: "ready",
    summary: "Five-tier button hierarchy, one primary action per context.",
    title: "Action Priority (Buttons)",
  },
  {
    appliedIn: [
      "Settings > Users.",
      "Settings > Organization.",
      "Settings > Documents.",
      "The Dashboard's Records section.",
    ],
    consistency:
      "Settled by Settings > Users; the Dashboard's Records section was brought onto it on 2026-11-11, having been built before the pattern existed. Where the action sits was reworked across Settings on 2026-11-12; the Dashboard has not been revisited since, so it is the one tabbed card still carrying a description in its heading band.",
    group: "patterns",
    id: "list-screen",
    rules: [
      "One card holds the heading band, the tabs, the filter row and the table — not a heading loose on the canvas above a separate table card.",
      "A tabbed card's heading band holds the section name and nothing else - an action scoped to one tab would be absent on the other, leaving the heading row lurching between two layouts.",
      "Table + action with no filter row: a band under the tab line, description left, action right, vertically centred (SectionToolbar).",
      "Filter row + table + action: the action joins the filter row, pushed right, and no description is written.",
      "No action: add nothing. A band holding only a sentence is a divider the panel did not need.",
      "A filter belongs in the filter row, never in the heading band.",
      "The filter row carries the count of what is currently shown.",
      "The table sits behind a border-t, with the Zinc 50 header row.",
      "The row action is a “…” menu, never a bare icon button — so a second action can be added without redesigning the column.",
      "An identifier and a name are two columns, never stacked in one cell: stacked, neither can be scanned down the page.",
      "A setting screen owns the value the modules read: one module (components/organisation-settings.ts) holds it, Settings edits it, and the feature reads it. A hard-coded twin in the consuming screen is the drift to avoid.",
      "The identifier carries the register's link treatment — Brand 900, underline on hover — wherever it appears.",
      "Status and priority badges use the 8% semantic tints, the same as the register.",
    ],
    sources: [
      { label: "Rule", where: "docs/rules/ui-hierarchy.md §List screens" },
      {
        label: "Reference",
        where:
          "Atlassian §Tabs/Hierarchy, Primer PageHeader, GitHub Issues - scanned 2026-11-12",
      },
      { label: "QA", where: "design-qa.md · Iteration 51" },
      {
        label: "Prototype",
        where:
          "components/settings-screens.tsx, components/dashboard-screen.tsx",
      },
    ],
    status: "draft",
    summary:
      "One card per list section: heading, tabs, filter row with a count, table, “…” row menu.",
    title: "List Screen",
  },
  {
    appliedIn: ["The Dashboard's Overview grid of quality modules."],
    consistency:
      "Reworked twice on 2026-11-11: first the lime rule became state-coloured, then it was removed altogether. One coloured mark per card now.",
    group: "patterns",
    id: "metric-card",
    rules: [
      "One coloured mark per card: the status badge, which states the state in words. No coloured rule, no tinted icon — three marks for one fact is what made the grid noisy.",
      "Making a decoration meaningful is not the same as needing it: a state-coloured rule was defensible and still removed.",
      "Before adding a decorative accent, grep the token: a colour used in exactly one place reads as a mistake, not as a system.",
      "Radius 20px; one border colour and no ring, on every card in the grid.",
      "Only a card whose click does something is a button. The rest are plain cards.",
      "A selected state that nothing reads is not a state — it was giving one card a different border for no reason.",
      "The metric owns its own line, above the module name, with the detail muted beneath.",
      "Status badges use the 8% semantic tints, the same as the register — not saturated destructive, which shouts over the numbers it labels.",
      "The metric and its caption never repeat each other: a detail string starting with the metric renders as “0 0 overdue”.",
      "The grid keeps its natural wrap. Five cards in three columns leave a gap in the second row, and that is accepted: narrowing the columns to close it would truncate the detail strings.",
    ],
    sources: [
      { label: "Rule", where: "docs/rules/ui-hierarchy.md §Metric cards" },
      { label: "QA", where: "design-qa.md · Iteration 49" },
      { label: "Prototype", where: "components/dashboard-screen.tsx" },
    ],
    status: "ready",
    summary:
      "Dashboard module cards: state-coloured rule, metric on its own line, soft semantic badges.",
    title: "Metric Card",
  },
  {
    appliedIn: [
      "Status in the Documents list and detail (filled, semantic).",
      "Role / module / document-type tags (outline, metadata).",
    ],
    consistency:
      "Filled-vs-outline rule is settled, and the six document statuses each have their own filled tint as of 2026-11-11. Both the register and the details view read one shared map, components/document-status.ts.",
    group: "components",
    id: "badges",
    rules: [
      "One size across the product: 22px tall, 12px text, so filled status badges and outline metadata badges line up in the same row.",
      "Filled semantic badge = actual status / severity / lifecycle meaning.",
      "Outline badge = categorical metadata (role, module, document-type).",
      "Status colour must not be replaced by primary/secondary styling.",
      "Every status has its own hue; no status borrows the outline treatment, because outline means metadata. Superseded used to, and “Superseded · Controlled” in one row then read as two badges of the same kind.",
      "Document statuses: Draft secondary · In Review warning · In Approval info · Approved success · Superseded violet (purple-100 on purple-800) · Obsolete error.",
      "Superseded is violet, not amber or red: it is a handover state and the document is still in use until its successor takes effect, so a cautionary colour would misread it.",
      "One map, one place: components/document-status.ts. Two screens each holding their own copy is how Superseded stayed outline in both.",
    ],
    sources: [
      {
        label: "Rule",
        where: "docs/rules/ui-hierarchy.md §Semantic Actions And Status",
      },
      {
        label: "Decision",
        where:
          "DECISIONS.md · 2026-11-04 Metadata badges use outline hierarchy",
      },
      { label: "QA", where: "design-qa.md · Iteration 20 — outline badges" },
      { label: "QA", where: "design-qa.md · Iteration 46 — status palette" },
      { label: "Component", where: "components/document-status.ts" },
    ],
    status: "ready",
    summary:
      "Filled badges for status, outline badges for categorical metadata.",
    title: "Badges",
  },
  {
    appliedIn: ["Settings tabs and Dashboard tabs via AccuraTabs."],
    consistency:
      "Consistent. One shared AccuraTabs wrapper enforces the underline style everywhere.",
    group: "components",
    id: "tabs",
    rules: [
      "Use the shared AccuraTabs underline wrapper.",
      "Transparent backgrounds in default, selected, and hover states.",
      "Brand 950 for selected underline, selected text, and hover text.",
      "Give the tab row space; tabs are navigation, not primary actions.",
    ],
    sources: [
      { label: "Rule", where: "docs/rules/ui-hierarchy.md §Tabs" },
      { label: "Component", where: "components/accura-tabs.tsx" },
      { label: "QA", where: "design-qa.md · Iteration 22 — Settings tabs" },
    ],
    status: "ready",
    summary: "Shared AccuraTabs underline tabs with Brand 950 selection.",
    title: "Tabs",
  },
  {
    appliedIn: [
      "Create Document, the Edit Draft editor, and the Settings user and role forms.",
    ],
    consistency:
      "Consistent. FormLabel and RECESSED_INPUT live in components/accura-form.tsx and are imported, not re-derived — they were duplicated per screen until 2026-11-10, which is how a screen drifted off them.",
    group: "components",
    id: "form-fields",
    rules: [
      "Every field marks required (red *) or optional (muted “(Optional)”).",
      "Buttons and menu items are sentence case; the only later capitals are proper nouns — module names, role names and PRD-002's defined terms.",
      "A Save button is disabled until its section changes, and says the verb only — the card heading above it already names the section.",
      "No helper text that only repeats the label or control.",
      "Disabled control changes surface (Zinc 100 recessed), not only opacity.",
      "A system-filled field is disabled with RECESSED_INPUT, not readOnly — readOnly renders as an ordinary editable field.",
      "References are picked, never typed: a search field lists matching documents with their status, and clicking one adds it.",
      "Linkable statuses are Draft, In Review, Approved and Superseded. Obsolete is withdrawn (US-016 AC-04); In Approval is excluded because the mockup omits it.",
      "A picker never offers the document itself, and never the same document and version twice.",
      "The same content keeps the same rank on every screen: Tags are a field of Document Information on the create form, the Draft editor and the details view — never a section on one of them.",
      "An empty-state line (“None linked.”) is for saved content. On a form the input underneath already says the list is empty, so it is hidden while editing.",
      "Scoped to Tags: the Add control sits inside the input as an inline-end addon. It is a convenience for typing several short free-text values in a row, not a general form pattern — a field that picks from a known set (Reviewers, Departments, references) uses a combobox instead.",
    ],
    sources: [
      { label: "Rule", where: "docs/rules/ui-hierarchy.md §Form fields" },
      {
        label: "Decision",
        where: "DECISIONS.md · 2026-11-04 Form fields state required/optional",
      },
      { label: "Component", where: "components/accura-form.tsx" },
      { label: "QA", where: "design-qa.md · Iterations 33, 34, 39" },
    ],
    status: "ready",
    summary: "Required/optional always marked; disabled = recessed surface.",
    title: "Form Fields",
  },
  {
    appliedIn: [
      "Status / type / department selects, department multi-select, role radios.",
    ],
    consistency:
      "Consistent. Behavior lives in the shared COSS ComboboxItem primitive, inherited by all consumers.",
    group: "components",
    id: "selection-controls",
    rules: [
      "Option content at the inline start, selection indicator at the inline end.",
      "No empty indicator gutter before unselected options.",
      "Implemented in the shared ComboboxItem AND SelectItem so every consumer inherits it; never re-implemented per screen.",
      "Picking several from a roster is ComboboxChips: chips inside the input, typing filters, trailing chevron — never a Select plus an Add button plus a chip row.",
      "A segmented control's track stays neutral (Zinc 200); the white indicator marks the choice.",
      "Rejected and not to be retried: a Brand 25 track (the unselected half looks chosen), a Brand 100 indicator, and a lime --accura-pop indicator (both outshout the page's primary action).",
    ],
    sources: [
      {
        label: "Rule",
        where: "docs/rules/ui-hierarchy.md §Selection controls",
      },
      {
        label: "Decision",
        where: "DECISIONS.md · 2026-11-04 Selection indicators trail content",
      },
      { label: "QA", where: "design-qa.md · Iteration 24 — Combobox" },
      { label: "QA", where: "design-qa.md · Iteration 33 — Select parity" },
      {
        label: "QA",
        where: "design-qa.md · Iteration 39 — Reviewers use ComboboxChips",
      },
    ],
    status: "ready",
    summary: "Content leads, selection indicator trails; no empty gutter.",
    title: "Selection Controls",
  },
  {
    appliedIn: ["The Settings invitation-email note."],
    consistency:
      "Consistent. One AccuraInformationPanel component; distinct from selectable cards.",
    group: "components",
    id: "information-panel",
    rules: [
      "Use AccuraInformationPanel for persistent explanatory content (not validation/warning/success).",
      "Information-blue surface, uniform thin border, icon, title, description.",
      "No close or collapse control by default.",
    ],
    sources: [
      { label: "Rule", where: "docs/rules/ui-hierarchy.md §System feedback" },
      { label: "Component", where: "components/accura-information-panel.tsx" },
      { label: "QA", where: "design-qa.md · Iteration 25 — info panel" },
    ],
    status: "ready",
    summary: "Persistent blue info panel, thin border, no dismiss by default.",
    title: "Information Panel",
  },
  {
    appliedIn: [
      "Settings save / invitation confirmation (toast).",
      "Documents save, register and approve confirmations (toast).",
      "Document filters & required next steps (inline alert).",
    ],
    consistency:
      "Consistent. Toast vs inline alert roles are separated by the rule.",
    group: "components",
    id: "system-feedback",
    rules: [
      "Bottom-right toast for brief, non-blocking confirmation; auto-dismiss + dismiss control.",
      "Every module uses it — Documents kept its own inline save banner until 2026-11-11, so one kind of message appeared two ways.",
      "The toast clears any sticky footer on the screen; raise its bottom offset, not --toast-inset, which also drives width and the animations.",
      "Inline alert for persistent, blocking, or actionable information beside its content.",
      "Never replace validation errors with an ephemeral toast.",
    ],
    sources: [
      { label: "Rule", where: "docs/rules/ui-hierarchy.md §System feedback" },
      {
        label: "Decision",
        where: "DECISIONS.md · 2026-11-04 Saves use toasts",
      },
      { label: "QA", where: "design-qa.md · Iteration 24 — toast feedback" },
    ],
    status: "ready",
    summary:
      "Bottom-right toast for confirmations, inline alert for blocking info.",
    title: "System Feedback",
  },
  {
    appliedIn: [
      "Settings user rows; document author/reviewer/approver clusters.",
    ],
    consistency:
      "Consistent. The avatar→name→email order and sizing are defined in a dedicated rule.",
    group: "components",
    id: "user-identity",
    rules: [
      "Present a person as one cluster: avatar, name, then email.",
      "Real image if available, else two-letter initials fallback.",
      "32px avatar and 12px gap in tables; status beside the name, never a third line.",
    ],
    sources: [
      { label: "Rule", where: "docs/rules/user-identity.md" },
      { label: "QA", where: "design-qa.md · Iteration 22 — user identity" },
    ],
    status: "ready",
    summary: "Avatar → name → email cluster; status beside the name.",
    title: "User Identity Cluster",
  },
  {
    appliedIn: ["Documents list; Settings user & role lists."],
    consistency:
      "Used consistently, but the card/table visual restyle is deliberately deferred — not a settled standard yet.",
    group: "components",
    id: "table",
    rules: [
      "Secondary/neutral header; row hover on a secondary surface.",
      "Row action uses the 28px icon button (not 24px).",
      "More columns than the viewport holds? Scroll — never hide columns at breakpoints.",
      "The trailing action cell is pinned, so a row's actions never scroll out of reach.",
      "That cell shows nothing at rest; it appears only on the hovered or keyboard-focused row.",
      "The elevation sits on the action — a white, bordered, shadowed chip — not on the cell.",
      "The cell only masks the columns scrolling under it; the header's trailing cell is not pinned at all.",
      "Scrolled to the end: every row shows a plain action, with no chip, border or shadow.",
      "While a row's menu is open, that row stays revealed — held in state, since the popup is portalled out of the row.",
      "Truncate a long cell value with its full text on hover; never let it set the column width.",
      "Pagination selection uses the secondary surface, not primary.",
      "Empty state gives a clear message and a recovery action.",
    ],
    sources: [
      { label: "Rule", where: "docs/rules/ui-hierarchy.md §Icons / Color" },
      { label: "Rule", where: "docs/rules/ui-hierarchy.md §Wide tables" },
      {
        label: "Decision",
        where: "DECISIONS.md · 2026-11-04 Card-table visual treatment deferred",
      },
      { label: "QA", where: "design-qa.md · Iteration 37 / 38" },
      {
        label: "Reference",
        where: "docs/visual-references/table-compositions.md",
      },
    ],
    status: "draft",
    statusNote:
      "Row-action size and header/hover colors are settled. The horizontal scroll, the pinned action cell and its hover reveal were built on 2026-11-10 and revised three times the same day — they are not signed off. The overall card-table treatment remains deferred pending a coordinated scope.",
    summary:
      "Neutral header, horizontal scroll, row actions revealed on hover.",
    title: "Data Table",
  },

  // ---------------- Patterns ----------------
  {
    appliedIn: ["Settings › Users & Roles → Role details dialog."],
    consistency:
      "Most-settled pattern. Multiple decisions converged on the one-row-per-item matrix; read-only details disable every control.",
    group: "patterns",
    id: "permission-matrix",
    rules: [
      "One row per item with its current value visible — never hide items behind tabs.",
      "Inclusion is its own control (a switch); reveal the value only once included.",
      "Keep every item label at the same emphasis whether included or not.",
      "A selection label repeats the wording that explains it.",
      "View-only surface: disable every field and control.",
    ],
    sources: [
      {
        label: "Rule",
        where:
          "docs/rules/ui-hierarchy.md §Permission and configuration matrices",
      },
      {
        label: "Decision",
        where: "DECISIONS.md · 2026-11-06 Role details are read-only",
      },
      { label: "QA", where: "design-qa.md · Iteration 26 / 27" },
    ],
    status: "ready",
    summary:
      "One row per module, all access levels visible, switch to include.",
    title: "Permission / Config Matrix",
  },
  {
    appliedIn: [
      "Every Settings section, plus the Create Document and Edit Draft form cards.",
    ],
    consistency:
      "Consistent. SectionCard and SectionHeading live in components/accura-form.tsx; no screen builds its own heading.",
    group: "patterns",
    id: "settings-section-header",
    rules: [
      "Zinc 50 header holds the title, the primary section action, and either a description or a hint.",
      "gap-0.5 between title and description; the description never floats away from its title.",
      "Prefer a hint (ⓘ beside the title) over a paragraph: a paragraph under every title pushes the first control down the page.",
      "Reserve either for something the user cannot infer from the label and the control — never to repeat them.",
      "Tabs, controls, and data sit on the white body below one divider.",
      "Do not repeat gray bands for nested content.",
    ],
    sources: [
      { label: "Rule", where: "docs/rules/ui-hierarchy.md §Color Hierarchy" },
      {
        label: "Decision",
        where: "DECISIONS.md · 2026-11-04 Settings section headers",
      },
      { label: "QA", where: "design-qa.md · Iteration 21 — section header" },
    ],
    status: "ready",
    summary: "Zinc 50 context header above a white content body, one divider.",
    title: "Settings Section Header",
  },
  {
    appliedIn: ["Documents module list screen (US-006)."],
    consistency:
      "Just rebuilt for US-006 (Category + Type columns, status set, version grouping). Not yet QA-logged or decision-recorded.",
    group: "patterns",
    id: "document-list",
    rules: [
      "Filter toolbar (search + status/type/department) above the table.",
      "Columns: ID, Name, Status, Version, Category, Type, Department, Author, Effective date.",
      "Rows of the same Document ID stay consecutive; page sizes 10/20/50.",
      "Empty state reads “No documents found.”",
    ],
    sources: [
      { label: "Story", where: "US-006 — View Document List" },
      { label: "Prototype", where: "components/documents-prototype.tsx" },
    ],
    status: "draft",
    statusNote:
      "Freshly aligned to US-006 this session; awaiting a QA iteration and a decision entry before it is a standard.",
    summary:
      "Filter toolbar → multi-column register → pagination → empty state.",
    title: "Document List",
  },
  {
    appliedIn: ["Create Document, as the first row of the form."],
    consistency:
      "Consistent. One row for one choice between two; the form below adapts in place.",
    group: "patterns",
    id: "create-category-chooser",
    rules: [
      "The category is a segmented control inline with its own label, not a dialog before the page and not a pair of cards.",
      "Track on Zinc 200, white moving indicator — see Selection Controls for the colours that were rejected.",
      "Choosing External fixes the Document Type to External Document (EXT) and hides References and Approval.",
      "Switching away from entered approval assignments confirms first; switching with nothing entered is immediate.",
    ],
    sources: [
      { label: "PRD", where: "PRD-002 §Create document" },
      { label: "Story", where: "US-007 AC-01 · US-010 AC-01" },
      {
        label: "Mockup",
        where: "Accura Mockup · createDocumentView .create-mode",
      },
      { label: "Prototype", where: "components/create-document-screen.tsx" },
      { label: "QA", where: "design-qa.md · Iterations 31, 35, 36" },
    ],
    status: "ready",
    summary: "Controlled-vs-External segmented control inline with its label.",
    title: "Create Category Chooser",
  },

  {
    appliedIn: [
      "Primary Document, Attachments, References, Approval and Document category on Create Document; Primary document, Attachments and References on the Edit Draft editor.",
    ],
    consistency:
      "Consistent. One Hint component in components/accura-form.tsx, rendered by SectionHeading and by any row that needs it.",
    group: "components",
    id: "section-hint",
    rules: [
      "An ⓘ sits beside the section title and holds the rule the user cannot infer from the label and the control.",
      "It is a popover, not a tooltip: a tooltip opens on hover and focus only, so an icon that looks pressable did nothing when pressed and could not be opened at all on touch.",
      "Never use it to repeat the label, the marker, or what the control already states.",
    ],
    sources: [
      { label: "Rule", where: "docs/rules/ui-hierarchy.md §Form fields" },
      { label: "Component", where: "components/accura-form.tsx" },
      { label: "QA", where: "design-qa.md · Iterations 35, 36" },
    ],
    status: "ready",
    summary:
      "ⓘ beside a section title, opening on click, for a rule the UI cannot show.",
    title: "Section Hint",
  },
  {
    appliedIn: ["Create Document, beside the page title."],
    consistency:
      "Built on the create screen only; the Edit Draft editor still shows a static “Saved just now”.",
    group: "behaviors",
    id: "unsaved-indicator",
    rules: [
      "A persistent badge beside the page title whenever the form holds unsaved input.",
      "It supplements the discard confirmation, it does not replace it: US-007 AC-04 only confirms on leaving, which tells the user about unsaved work at the moment they are about to lose it.",
    ],
    sources: [
      { label: "Story", where: "US-007 AC-04" },
      { label: "Reference", where: "Mobbin · Shopify unsaved-changes bar" },
      { label: "Prototype", where: "components/create-document-screen.tsx" },
      { label: "QA", where: "design-qa.md · Iteration 33" },
    ],
    status: "draft",
    statusNote:
      "Apply it to the Edit Draft editor when US-014 is built, and replace that screen's static “Saved just now”.",
    summary: "Persistent “Unsaved changes” badge beside the page title.",
    title: "Unsaved Changes Indicator",
  },

  {
    appliedIn: ["The Documents detail screen, all statuses."],
    consistency:
      "Built against US-011 on 2026-11-11; replaced three hand-rolled cards with the shared SectionCard and SectionHeading, so it now matches every other screen.",
    group: "behaviors",
    id: "document-details",
    rules: [
      "The screen renders the selected record — never a hard-coded sample; the preview's letterhead shows that document's own ID and version.",
      "Category is shown separately from Document Type: an outline badge beside the filled status badge, and its own field.",
      "Effective Date reads “Not set” before approval; Next Periodic Review reads “Set after approval”.",
      "Next Periodic Review is derived from the approval date plus the type's frequency (default 3 years), not stored.",
      "Overdue for Periodic Review is a displayed state only — status stays Approved and Effective.",
      "Print is enabled only for Approved, Superseded, or Obsolete.",
      "No workflow stepper on an External document, or on a Superseded or Obsolete one: neither is at a current stage.",
      "Status badges reuse the register's variants, so one status reads the same in the list and in the details.",
      "Side panel order follows the mockup: Document Information → Attachments → Reference Documents → Approval.",
      "No count badge on a section heading in the read-only panel: the items are listed directly underneath. Added 2026-11-11, removed the same day.",
      "An item whose only action is to open it has no button: its own name is the link, in the register's Brand 900.",
      "A reference opens the version it names, or the newest row carrying that ID if that version has gone.",
      "Related and Referred are group headings with counts, not muted captions — one says what supports the document, the other what it cites.",
      "The Approval card groups by role (Reviewers with an approved/total badge, then Approver); the per-person role caption is then redundant.",
      "The preview carries its own zoom (50–200%) and a full-screen view, because the column is narrower than the page it renders.",
      "An attachment lists name, description and file name with an Open action and no remove control — viewing never changes the saved file.",
      "A reference shows the document name over its ID and version, in the identifier treatment.",
      "No Reference documents and no Approval card on an External document.",
      "Superseded and Obsolete are not two shades of finished: Superseded stays the version to follow until its successor's Effective Date, Obsolete is withdrawn outright.",
    ],
    sources: [
      {
        label: "Rule",
        where: "docs/rules/ui-hierarchy.md §Containers / Badges",
      },
      {
        label: "Decision",
        where: "DECISIONS.md · 2026-11-11 The Document ID opens a document",
      },
      { label: "QA", where: "design-qa.md · Iteration 40" },
      {
        label: "Prototype",
        where: "components/document-flow-screens.tsx · DetailScreen",
      },
    ],
    status: "draft",
    statusNote:
      "Built 2026-11-11. The returned-Draft rejection notice and the eligibility gate arrived with US-012; real permissions have not, and a Superseded version does not yet show that it is still in use during the 10-day handover. See docs/agent-worklog.md.",
    summary:
      "Details render the selected record; derived review date; Print and stepper gated by status.",
    title: "Document Details",
  },

  {
    appliedIn: [
      "The Documents detail screen, In Review and In Approval.",
      "The rejection dialog and the returned Draft editor.",
    ],
    consistency:
      "Built against US-012 on 2026-11-11. Replaces a single Approve that advanced the document on its own, and a disabled Reject that answered nothing.",
    group: "behaviors",
    id: "review-decision",
    rules: [
      "Progress is held per assigned Reviewer, not as one shared flag: each carries their own Pending or Approved badge.",
      "One approval clears one assigned slot — the actor's own, or the first outstanding one annotated “by <name>”.",
      "Approve opens a confirmation naming the document, the person it is recorded against, and the consequence. It is not an electronic signature; it replaces nothing and is replaced by one when that is built.",
      "A reviewer who has not decided is Awaiting, not Pending — the stored value, not just the label.",
      "The document stays In Review until every assigned Reviewer has approved; only the final one advances it.",
      "The outstanding count is stated in words beneath the route, and the action bar names who is still awaited.",
      "A user who is not entitled to decide gets no action bar at all — not a disabled one — and a banner saying why.",
      "The required Reason keeps its submit control live: pressing it empty marks the field invalid and states what is missing.",
      "A dialog opened by state, not by a trigger, resets its per-use fields on the open transition; Base UI reports no opening.",
      "A rejection returns the document to Draft with a notice naming the rejecting role, user, date and time, and reason.",
      "Resubmitting clears the notice and resets the route: a new review cycle starts clean.",
      "The tally is keyed by document, so opening another row never inherits the last row's decisions.",
    ],
    sources: [
      {
        label: "Rule",
        where: "docs/rules/ui-hierarchy.md §Gated actions and decision dialogs",
      },
      {
        label: "Decision",
        where: "DECISIONS.md · 2026-11-11 One approval clears one slot",
      },
      {
        label: "Decision",
        where:
          "DECISIONS.md · 2026-11-11 A rejection dialog prompts rather than disables",
      },
      { label: "QA", where: "design-qa.md · Iteration 41" },
      {
        label: "Prototype",
        where:
          "components/document-flow-screens.tsx · DetailScreen, RejectDialog",
      },
    ],
    status: "draft",
    statusNote:
      "Needs sign-off. The “Viewing as” switcher is prototype chrome standing in for a permission model; US-012's own open question — the exact permissions for actions other than viewing — is still with the BA.",
    summary:
      "Per-Reviewer approval tally, an absent action bar when ineligible, and a rejection that is recorded on the Draft.",
    title: "Review Decision & Rejection",
  },

  {
    appliedIn: [
      "The Draft editor.",
      "The Upload Revision dialog.",
      "The Mark as Obsolete confirmation.",
    ],
    consistency:
      "Built against US-013 to US-018 on 2026-11-11. The flow screens write to the record now; before this they could only change which view was shown.",
    group: "behaviors",
    id: "document-lifecycle-actions",
    rules: [
      "A status change writes to the record, so it survives going back to the register — not just to the view.",
      "Approving sets the Effective Date 10 days out and supersedes the previous Approved version at that same moment.",
      "An editor's save indicator reads the save state — “Unsaved changes” or “All changes saved” — never a fixed “Saved just now”.",
      "A Draft's identity is fixed: Document ID, type, author, version and status are read-only; its content is not.",
      "An invalid save is refused and the footer names the one correction to make.",
      "A destructive confirmation names the outcome in its buttons — “Keep document” and “Mark as Obsolete”, not Cancel and OK.",
      "A dialog that creates something requires every mandatory field at once and reports on all of them, not the first.",
      "Print reduces the page to the document: the preview is the print root, chrome is dropped, and the scrolling container is unwrapped.",
      "An action the prototype cannot really perform hands over something labelled as a placeholder and says so, rather than imitating the real thing.",
      "A Draft's footer carries Cancel beside Save and Submit; it runs the same discard confirmation as the breadcrumb, so it cannot lose work.",
      "A section heading never carries a counter against a maximum — “0/5” reads as a quota to fill. The limit lives in the hint and in the disabled Add control.",
      "The identifier that opens a record carries a link colour at rest (Brand 900), not the foreground of every other cell.",
    ],
    sources: [
      { label: "QA", where: "design-qa.md · Iteration 42" },
      {
        label: "Rule",
        where: "docs/rules/ui-hierarchy.md §Gated actions and decision dialogs",
      },
      {
        label: "Prototype",
        where:
          "components/document-flow-screens.tsx · EditorScreen, RevisionDialog, ObsoleteDialog",
      },
    ],
    status: "draft",
    statusNote:
      "Needs sign-off. Nothing persists across a reload, files are presence-only, and Revision History is plain text where US-015 asks for rich text — see the Refine pass backlog in docs/agent-worklog.md.",
    summary:
      "Approve, edit, revise, obsolete, print and download — each writing to the record and gated by status.",
    title: "Document Lifecycle Actions",
  },

  {
    appliedIn: ["The Documents register."],
    consistency:
      "Built on the Documents table; apply it to any later register with more columns than a viewport holds.",
    group: "behaviors",
    id: "wide-table-scroll",
    rules: [
      "A wide register scrolls horizontally; it does not hide columns at fixed breakpoints.",
      "The trailing action cell stays pinned so a row's actions never scroll out of reach.",
      "While the row can still scroll, the action shows on the hovered or keyboard-focused row only — never on every row at once.",
      "The elevation is on the action, as a white bordered chip with a shadow; the cell behind it only masks what scrolls underneath.",
      "At the end of the row every row shows a plain action, with no chip, border or shadow: nothing is being covered.",
      "Reveal answers to :focus-visible, not :focus-within — closing a menu by mouse must not leave a second action raised.",
      "A row whose action menu is open stays revealed, held in state: the popup is portalled out of the row, so CSS cannot see it.",
      "The header's trailing cell is not pinned at all: a header is never hovered and holds no action.",
    ],
    sources: [
      { label: "Rule", where: "docs/rules/ui-hierarchy.md §Wide tables" },
      { label: "Reference", where: "User screen recording, 2026-11-10" },
      {
        label: "Prototype",
        where: "components/documents-prototype.tsx · ScrollableTable",
      },
      { label: "QA", where: "design-qa.md · Iteration 37 / 38" },
    ],
    status: "draft",
    statusNote:
      "Built 2026-11-10 and revised three times the same day — the hover reveal, the chip elevation, the open-menu state and the flat end-of-row behaviour are all from that day's review and are not signed off.",
    summary:
      "Wide registers scroll; the hovered row's action lifts as a chip, and flattens at the end of the row.",
    title: "Wide Table Scroll & Pinned Actions",
  },

  // ---------------- Behaviors ----------------
  {
    appliedIn: ["Document lifecycle screens (Draft → Approved)."],
    consistency:
      "Settled 2026-11-11: label treatment signed off and the Superseded / Obsolete question answered — a closed document shows no stepper.",
    group: "behaviors",
    id: "workflow-stepper",
    rules: [
      "Four stages: Draft → In Review → In Approval → Approved.",
      "Stage names are semibold in the brand colour at every stage — completed, current and future alike.",
      "The caption under each stage (“Completed by…”, “Current stage”) stays muted and regular at 12px.",
      "The caption is derived per stage: Draft names the Author, Review counts the Reviewers, Approval names the Approver.",
      "A stage with several actors states a count (“Approved by 2 Reviewers”), never a name plus “+1” — the Approval card holds the roster.",
      "Completed / current / future states must not rely on connector colour alone; the marker carries them.",
      "No stepper on an External document, or on a Superseded or Obsolete one: neither is at a current stage.",
    ],
    sources: [
      { label: "PRD", where: "PRD-002 §Lifecycle" },
      { label: "Rule", where: "docs/rules/ui-hierarchy.md §Workflow stepper" },
      { label: "Prototype", where: "components/document-flow-screens.tsx" },
      { label: "QA", where: "design-qa.md · Iteration 44" },
    ],
    status: "ready",
    summary:
      "Four-stage lifecycle stepper with completed/current/future states.",
    title: "Workflow Stepper",
  },
  {
    appliedIn: ["Submit / Approve / Reject actions in the document flow."],
    consistency:
      "Not aligned to current scope. PRD-002 defers electronic signature from the first implementation.",
    group: "behaviors",
    id: "e-signature",
    rules: [
      "Regulated confirmation records identity, role, signature meaning, and timestamp.",
      "Rejection requires a reason.",
    ],
    sources: [
      { label: "PRD", where: "PRD-002 §Out of Scope (deferred)" },
      { label: "Prototype", where: "components/document-flow-screens.tsx" },
    ],
    status: "draft",
    statusNote:
      "Removed from the prototype on 2026-11-10. PRD-002 defers it from the initial Document Module; if it returns it is a step in FRONT of the decision actions, not a restored dialog. The rejection reason survives on its own.",
    summary:
      "Signed confirmation for state transitions — removed, deferred by PRD-002.",
    title: "Electronic Signature",
  },
  {
    appliedIn: ["View audit trail on a document detail."],
    consistency:
      "Built as a right drawer with a newest-first timeline, but missing the hash/verification detail the spec calls for.",
    group: "behaviors",
    id: "audit-trail-drawer",
    rules: [
      "Right drawer preserves page context; newest-first chronology.",
      "State-transition pills make before/after scannable.",
      "Move focus on open, close with Escape, return focus to the trigger.",
    ],
    sources: [
      { label: "Prototype", where: "components/document-flow-screens.tsx" },
      { label: "Audit", where: "documents/flow-audit.md · Step 6" },
    ],
    status: "draft",
    statusNote:
      "No cryptographic hash / verification detail yet; timezone is hard-coded.",
    summary:
      "Right-drawer audit timeline, newest first, with transition pills.",
    title: "Audit Trail Drawer",
  },
  {
    appliedIn: ["Approval route in Create/Edit and the detail rail."],
    consistency:
      "Fixed single reviewer + approver. PRD-002 requires at least one reviewer and one approver, with multiple reviewers possible.",
    group: "behaviors",
    id: "approval-route",
    rules: [
      "Assignee rows render as the standard identity cluster with a role label.",
      "Author, every reviewer, and the approver must be different people.",
    ],
    sources: [
      { label: "PRD", where: "PRD-002 §Create document" },
      { label: "Prototype", where: "components/document-flow-screens.tsx" },
    ],
    status: "draft",
    statusNote:
      "Hard-coded to one reviewer + one approver; needs add/remove and multi-reviewer support.",
    summary: "Reviewer + approver assignee clusters on the approval route.",
    title: "Approval Route & Assignees",
  },
  {
    appliedIn: ["Create/Edit Document primary file and attachments."],
    consistency:
      "Built generically; file-type and count constraints are not yet branched by Controlled vs External.",
    group: "behaviors",
    id: "file-uploader",
    rules: [
      "One primary file plus up to five attachments.",
      "Controlled: PDF/DOCX/XLSX; External: PDF only; max 50 MB.",
      "Primary file required for BOTH Save as Draft and Submit for Review (US-007 AC-03).",
      "Once uploaded, the file shows as a preview whose own chrome carries the name, size, zoom and remove — no separate control row above it.",
      "Attachments carry an optional Name and Description, 0–100 characters (US-010 AC-02).",
    ],
    sources: [
      { label: "PRD", where: "PRD-002 §Create document" },
      { label: "Story", where: "US-007 AC-02/AC-03 · US-010 AC-02" },
      { label: "Prototype", where: "components/create-document-screen.tsx" },
      { label: "QA", where: "design-qa.md · Iteration 33" },
    ],
    status: "ready",
    summary:
      "Primary file + up to five attachments, branched by category, with preview chrome.",
    title: "File Uploader & Attachments",
  },
  {
    appliedIn: ["Create/Edit Document right rail."],
    consistency:
      "Built as a sticky readiness panel; the percentage model is illustrative, not yet tied to real validation.",
    group: "behaviors",
    id: "readiness-summary",
    rules: [
      "Surface missing required items before submit, not only on submit.",
      "Keep the summary within reach as the form scrolls.",
    ],
    sources: [
      { label: "Audit", where: "documents/flow-audit.md · Step 2" },
      { label: "Prototype", where: "components/document-flow-screens.tsx" },
    ],
    status: "draft",
    statusNote:
      "Removed from the create screen on 2026-11-10: the percentage was invented and gated Submit on a number no requirement defines. Replaced by real field-level validation that names the one correction needed, plus a persistent “Unsaved changes” badge beside the page title.",
    summary:
      "Superseded by field-level validation and an unsaved-changes indicator.",
    title: "Readiness Summary",
  },
];
