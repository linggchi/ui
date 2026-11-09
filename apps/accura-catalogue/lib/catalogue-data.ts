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
      "Notification bell with a count badge; identity cluster at the inline end.",
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
      "Status in the Documents list and detail (filled, semantic).",
      "Role / module / document-type tags (outline, metadata).",
    ],
    consistency:
      "Filled-vs-outline rule is settled. The Documents status set was extended for US-006 (Superseded, Obsolete) and is not yet QA-logged.",
    group: "components",
    id: "badges",
    rules: [
      "Filled semantic badge = actual status / severity / lifecycle meaning.",
      "Outline badge = categorical metadata (role, module, document-type).",
      "Status colour must not be replaced by primary/secondary styling.",
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
    ],
    status: "draft",
    statusNote:
      "US-006 added Superseded (outline) and Obsolete (error) to the status set; needs a QA pass to confirm the extended mapping.",
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
    appliedIn: ["Create/Edit Document forms and the Settings user form."],
    consistency:
      "Consistent where applied. Disabled styling relies on has-disabled: (see prototype-overrides notes).",
    group: "components",
    id: "form-fields",
    rules: [
      "Every field marks required (red *) or optional (muted “(Optional)”).",
      "No helper text that only repeats the label or control.",
      "Disabled control changes surface (Zinc 100 recessed), not only opacity.",
    ],
    sources: [
      { label: "Rule", where: "docs/rules/ui-hierarchy.md §Form fields" },
      {
        label: "Decision",
        where: "DECISIONS.md · 2026-11-04 Form fields state required/optional",
      },
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
      "Implemented in the shared ComboboxItem so every consumer inherits it.",
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
      "Document filters & required next steps (inline alert).",
    ],
    consistency:
      "Consistent. Toast vs inline alert roles are separated by the rule.",
    group: "components",
    id: "system-feedback",
    rules: [
      "Bottom-right toast for brief, non-blocking confirmation; auto-dismiss + dismiss control.",
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
      "Pagination selection uses the secondary surface, not primary.",
      "Empty state gives a clear message and a recovery action.",
    ],
    sources: [
      { label: "Rule", where: "docs/rules/ui-hierarchy.md §Icons / Color" },
      {
        label: "Decision",
        where: "DECISIONS.md · 2026-11-04 Card-table visual treatment deferred",
      },
      {
        label: "Reference",
        where: "docs/visual-references/table-compositions.md",
      },
    ],
    status: "draft",
    statusNote:
      "Row-action size and header/hover colors are settled, but the overall card-table treatment is deferred pending a coordinated scope.",
    summary: "Neutral header, 28px row actions, pagination, empty state.",
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
    appliedIn: ["Each Settings section (Users, Roles, Organisation…)."],
    consistency:
      "Consistent. Zinc 50 header plane over a white body with one divider.",
    group: "patterns",
    id: "settings-section-header",
    rules: [
      "Zinc 50 header holds the title, description, and primary section action.",
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
    appliedIn: ["Create Document entry point."],
    consistency:
      "Built, but the External branch of the flow it leads into is not yet spec-aligned (PRD-002).",
    group: "patterns",
    id: "create-category-chooser",
    rules: [
      "Two radio cards (Controlled vs External) explain the difference before the form.",
      "Selection routes to the matching editor and locks the category's constraints.",
    ],
    sources: [
      { label: "PRD", where: "PRD-002 §Create document" },
      { label: "Prototype", where: "components/documents-prototype.tsx" },
    ],
    status: "draft",
    statusNote:
      "The chooser exists, but the External editor still shows References/Approval and lacks “Acknowledge & Register”.",
    summary: "Controlled-vs-External radio cards before the create form.",
    title: "Create Category Chooser",
  },

  // ---------------- Behaviors ----------------
  {
    appliedIn: ["Document lifecycle screens (Draft → Approved)."],
    consistency:
      "In flux. Labels were just renamed to “In Approval”; the stepper does not yet cover Superseded / Obsolete.",
    group: "behaviors",
    id: "workflow-stepper",
    rules: [
      "Four stages: Draft → In Review → In Approval → Approved.",
      "Completed / current / future states must not rely on connector colour alone.",
    ],
    sources: [
      { label: "PRD", where: "PRD-002 §Lifecycle" },
      { label: "Prototype", where: "components/document-flow-screens.tsx" },
      { label: "Audit", where: "documents/flow-audit.md" },
    ],
    status: "draft",
    statusNote:
      "Renamed this session; needs Superseded/Obsolete coverage and a decision entry.",
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
      "Deferred by PRD-002 — do not treat as a standard. Keep as a future-reference exploration only.",
    summary: "Signed confirmation for state transitions — deferred by PRD-002.",
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
      "Primary file optional to save a draft, required to submit.",
    ],
    sources: [
      { label: "PRD", where: "PRD-002 §Create document" },
      { label: "Prototype", where: "components/document-flow-screens.tsx" },
    ],
    status: "draft",
    statusNote:
      "Accepted types are shown as a fixed string; must branch by category.",
    summary: "Primary file + up to five attachments, with type/size rules.",
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
      "Readiness percentage is a placeholder; needs real field-level validation.",
    summary: "Sticky “ready to submit” summary surfacing missing items early.",
    title: "Readiness Summary",
  },
];
