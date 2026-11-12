"use client";

import { Avatar, AvatarFallback } from "@coss/ui/components/avatar";
import { Badge } from "@coss/ui/components/badge";
import { Button } from "@coss/ui/components/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@coss/ui/components/input-group";
import { Kbd } from "@coss/ui/components/kbd";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuTrigger,
} from "@coss/ui/components/menu";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@coss/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@coss/ui/components/table";
import { toastManager } from "@coss/ui/components/toast";
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from "@coss/ui/components/tooltip";
import {
  Reports as BarChart3Icon,
  BellNotification as BellIcon,
  OpenBook as BookOpenIcon,
  NavArrowLeft as ChevronLeftIcon,
  NavArrowRight as ChevronRightIcon,
  HelpCircle as CircleHelpIcon,
  ClipboardCheck as ClipboardCheckIcon,
  ClockRotateRight as FileClockIcon,
  PageSearch as FileSearchIcon,
  MultiplePages as FilesIcon,
  Page as FileTextIcon,
  GraduationCap as GraduationCapIcon,
  ViewGrid as LayoutDashboardIcon,
  LogOut as LogOutIcon,
  MoreHoriz as MoreHorizontalIcon,
  SidebarCollapse as PanelLeftCloseIcon,
  SidebarExpand as PanelLeftOpenIcon,
  Plus as PlusIcon,
  RefreshDouble as RefreshCwIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  FilterList as SlidersHorizontalIcon,
  WarningTriangle as TriangleAlertIcon,
  DeliveryTruck as TruckIcon,
  Tools as WrenchIcon,
} from "iconoir-react";
import Image from "next/image";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CreateDocumentScreen,
  type CreatedDocument,
} from "./create-document-screen";
import { DashboardScreen } from "./dashboard-screen";
import {
  DocumentFlowScreen,
  type DocumentFlowView,
} from "./document-flow-screens";
import { statusBadgeLook } from "./document-status";
import {
  type DepartmentSetting,
  type DocumentTypeSetting,
  initialDepartments,
  initialDocumentTypes,
  initialNumbering,
  type NumberingSetting,
} from "./organisation-settings";
import {
  initialsOf,
  type ProtoRole,
  RoleSwitcher,
  roleIdentity,
} from "./prototype-role";
import { SettingsScreen } from "./settings-screens";

type AppModule = "dashboard" | "documents" | "settings";

/**
 * A horizontally scrollable table whose trailing action column stays pinned.
 *
 * The register has more columns than a laptop viewport holds, and clipping
 * them put Author and Effective date out of reach entirely. Scrolling brings
 * them back, but a row's actions must not scroll away with them — so the
 * action cell sticks to the trailing edge.
 *
 * At rest that cell shows nothing at all: raising it on every row drew a
 * permanent band down the register and covered the Author column no one had
 * asked it to cover. The action appears on the one row the pointer or keyboard
 * is on, as a raised chip; the cell behind it only takes the row's hover
 * surface, to mask the columns passing underneath.
 *
 * The elevation is on the chip, not on the cell. Spread across a full-height
 * cell against a near-white row it measured correctly and could not be seen,
 * twice. The header's trailing cell is not pinned at all — a header is never
 * hovered and holds no action, so pinning it only clipped the last heading.
 */
function ScrollableTable({
  children,
}: {
  children: (atEnd: boolean) => React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [atEnd, setAtEnd] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => {
      const remaining =
        element.scrollWidth -
        element.clientWidth -
        Math.abs(element.scrollLeft);
      setAtEnd(remaining <= 1);
    };

    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      element.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  // The register has more columns than a laptop viewport holds. Scrolling
  // keeps every column reachable, and the trailing action cell stays pinned so
  // a row's actions never scroll out of reach. While there is more of the row
  // to see it is a raised chip on the hovered or focused row, over a cell that
  // masks what scrolls underneath. At the end of the row the actions sit in
  // their own column with nothing behind them, so every row shows a plain one
  // and the rows read as a register again — hence `atEnd` reaching the rows.
  //
  // `Table` renders its own `overflow-x-auto` container, which is neutralised
  // here so this element is the single scroller whose state can be read.
  return (
    <div
      className="overflow-x-auto [&>[data-slot=table-container]]:overflow-visible"
      data-scroll-end={atEnd}
      ref={ref}
    >
      <Table className="min-w-[1240px]">{children(atEnd)}</Table>
    </div>
  );
}

type DocumentStatus =
  | "Approved"
  | "Draft"
  | "In Approval"
  | "In Review"
  | "Obsolete"
  | "Superseded";

type DocumentCategory = "Controlled" | "External";

type DocumentRecord = {
  // US-012 assigns an Approver alongside the Reviewers; US-013 acts on it.
  approver?: string;
  // US-011 AC-02 shows attachments and references on the detail screen. The
  // mockup's own read-only panel carries exactly one document's content; the
  // other ten rows were seeded in this repository on 2026-11-11 so that every
  // status demonstrates the panel, and are not traceable to the mockup.
  attachments?: { description: string; fileName: string; name: string }[];
  author: string;
  category: DocumentCategory;
  department: "Engineering" | "Manufacturing" | "Quality Control";
  effectiveDate: string | null;
  id: string;
  name: string;
  related?: { id: string; name: string; version: string }[];
  referred?: { id: string; name: string; version: string }[];
  // US-012 AC-02: every assigned Reviewer must approve before the document
  // moves to In Approval, so the route is per-reviewer, not a single flag.
  reviewers?: { decision: "Approved" | "Awaiting"; name: string }[];
  // US-015 AC-02: the change summary saved with this version.
  revisionHistory?: string;
  status: DocumentStatus;
  tags?: string[];
  // The twelve document types configured in Settings (US-007 AC-01), written
  // "Name (ABBR)" exactly as the mockup stores and renders them, so the column
  // and the filter both carry the abbreviation that drives Document IDs.
  type:
    | "Batch Record (BR)"
    | "Design Specification (DS)"
    | "External Document (EXT)"
    | "Functional Specification (FS)"
    | "Material Specification (MS)"
    | "Product Specification (PS)"
    | "Record (REC)"
    | "Report (REP)"
    | "Template (TMP)"
    | "Test Method (TM)"
    | "User Requirements Specification (URS)"
    | "Validation Master Plan (VMP)";
  version: string;
};

const documentsOnly = process.env.NEXT_PUBLIC_ACCURA_DOCUMENTS_ONLY === "true";

// The eleven sample rows from the mockup's `documentRows`
// (`01 Research/Accura Mockup.html`), kept verbatim apart from the project's
// "9 Oct 2026" date format. They are the only traceable document sample: every
// row uses one of the twelve configured types, and the two repeated Document IDs
// are the same-ID version pairs US-006 AC-01 requires to group consecutively.
const documents: DocumentRecord[] = [
  {
    approver: "Nina Patel",
    // The mockup's detail panel is this document. Its attachments, references
    // and tags are the mockup's own, including both referenced documents,
    // which are rows 7 and 8 below.
    attachments: [
      {
        description: "Pre-use inspection checklist",
        fileName: "Equipment-Checklist.pdf",
        name: "Equipment checklist",
      },
      {
        description: "Equipment handling risks",
        fileName: "Risk-Assessment.xlsx",
        name: "Risk assessment",
      },
    ],
    author: "Amit Kothari",
    category: "Controlled",
    department: "Engineering",
    effectiveDate: "9 Oct 2026",
    id: "ACME-FRM-2026-000006",
    name: "Equipment Introduction Form",
    related: [
      {
        id: "ACME-DS-2026-000013",
        name: "Equipment Design Specification",
        version: "v1.0",
      },
    ],
    referred: [
      {
        id: "ACME-FS-2026-000004",
        name: "Data Integrity Functional Specification",
        version: "v1.0",
      },
    ],
    reviewers: [
      { decision: "Approved", name: "Sarah Johnson" },
      { decision: "Approved", name: "Priya Shah" },
    ],
    status: "Approved",
    tags: ["Equipment", "Controlled"],
    type: "Record (REC)",
    version: "v1.0",
  },
  {
    approver: "Nina Patel",
    attachments: [
      {
        description: "What v2.0 changes against v1.0",
        fileName: "URS-Change-Summary.docx",
        name: "Change summary",
      },
    ],
    author: "Amit Kothari",
    category: "Controlled",
    department: "Quality Control",
    effectiveDate: null,
    id: "ACME-URS-2026-000005",
    name: "Document Control Requirements",
    related: [
      {
        id: "ACME-DS-2026-000013",
        name: "Equipment Design Specification",
        version: "v1.0",
      },
    ],
    referred: [
      {
        id: "ACME-FS-2026-000004",
        name: "Data Integrity Functional Specification",
        version: "v1.0",
      },
    ],
    reviewers: [
      { decision: "Approved", name: "Sarah Johnson" },
      { decision: "Awaiting", name: "Priya Shah" },
    ],
    status: "In Review",
    tags: ["Document control", "Requirements"],
    type: "User Requirements Specification (URS)",
    version: "v2.0",
  },
  {
    approver: "Nina Patel",
    attachments: [
      {
        description: "Signed-off requirements baseline",
        fileName: "URS-Approval-Record.pdf",
        name: "Approval record",
      },
    ],
    author: "Amit Kothari",
    category: "Controlled",
    department: "Quality Control",
    effectiveDate: "9 Oct 2026",
    id: "ACME-URS-2026-000005",
    name: "Document Control Requirements",
    related: [
      {
        id: "ACME-FS-2026-000004",
        name: "Data Integrity Functional Specification",
        version: "v1.0",
      },
    ],
    reviewers: [
      { decision: "Approved", name: "Sarah Johnson" },
      { decision: "Approved", name: "Priya Shah" },
    ],
    status: "Approved",
    tags: ["Document control", "Requirements"],
    type: "User Requirements Specification (URS)",
    version: "v1.0",
  },
  {
    approver: "Nina Patel",
    attachments: [
      {
        description: "Qualification activities and owners",
        fileName: "VMP-Schedule.xlsx",
        name: "Validation schedule",
      },
      {
        description: "Open validation risks",
        fileName: "VMP-Risk-Log.xlsx",
        name: "Risk log",
      },
    ],
    author: "Amit Kothari",
    category: "Controlled",
    department: "Engineering",
    effectiveDate: "28 Oct 2026",
    id: "ACME-VMP-2026-000001",
    name: "Equipment Validation Master Plan",
    related: [
      {
        id: "ACME-FRM-2026-000006",
        name: "Equipment Introduction Form",
        version: "v1.0",
      },
    ],
    referred: [
      {
        id: "ACME-DS-2026-000013",
        name: "Equipment Design Specification",
        version: "v1.0",
      },
    ],
    reviewers: [
      { decision: "Approved", name: "Sarah Johnson" },
      { decision: "Approved", name: "Emily Chen" },
    ],
    status: "Approved",
    tags: ["Validation", "Equipment"],
    type: "Validation Master Plan (VMP)",
    version: "v3.0",
  },
  {
    approver: "Nina Patel",
    attachments: [
      {
        description: "Superseded by v3.0",
        fileName: "VMP-Schedule-v2.xlsx",
        name: "Validation schedule",
      },
    ],
    author: "Amit Kothari",
    category: "Controlled",
    department: "Engineering",
    effectiveDate: "5 Oct 2026",
    id: "ACME-VMP-2026-000001",
    name: "Equipment Validation Master Plan",
    related: [
      {
        id: "ACME-FRM-2026-000006",
        name: "Equipment Introduction Form",
        version: "v1.0",
      },
    ],
    reviewers: [
      { decision: "Approved", name: "Sarah Johnson" },
      { decision: "Approved", name: "Emily Chen" },
    ],
    status: "Superseded",
    tags: ["Validation", "Equipment"],
    type: "Validation Master Plan (VMP)",
    version: "v2.0",
  },
  {
    approver: "Nina Patel",
    attachments: [
      {
        description: "Blank record for each run",
        fileName: "Batch-Template.docx",
        name: "Batch template",
      },
    ],
    author: "Amit Kothari",
    category: "Controlled",
    department: "Quality Control",
    effectiveDate: null,
    id: "BR-2026-000001",
    name: "Laboratory Batch Record",
    related: [
      {
        id: "ACME-MS-2026-000006",
        name: "Raw Material Specification",
        version: "v1.0",
      },
    ],
    reviewers: [
      { decision: "Awaiting", name: "Sarah Johnson" },
      { decision: "Awaiting", name: "Priya Shah" },
    ],
    status: "Draft",
    tags: ["Batch record", "Laboratory"],
    type: "Batch Record (BR)",
    version: "v1.0",
  },
  {
    approver: "Nina Patel",
    attachments: [
      {
        description: "General arrangement and interfaces",
        fileName: "DS-Drawings.pdf",
        name: "Design drawings",
      },
    ],
    author: "Amit Kothari",
    category: "Controlled",
    department: "Quality Control",
    effectiveDate: null,
    id: "ACME-DS-2026-000013",
    name: "Equipment Design Specification",
    related: [
      {
        id: "ACME-URS-2026-000005",
        name: "Document Control Requirements",
        version: "v1.0",
      },
    ],
    referred: [
      {
        id: "ACME-VMP-2026-000001",
        name: "Equipment Validation Master Plan",
        version: "v3.0",
      },
    ],
    reviewers: [
      { decision: "Approved", name: "Sarah Johnson" },
      { decision: "Approved", name: "Ravi Patel" },
    ],
    status: "In Approval",
    tags: ["Design", "Equipment"],
    type: "Design Specification (DS)",
    version: "v1.0",
  },
  {
    approver: "Nina Patel",
    attachments: [
      {
        description: "Requirements to functions",
        fileName: "FS-Traceability.xlsx",
        name: "Traceability matrix",
      },
    ],
    author: "Sarah Johnson",
    category: "Controlled",
    department: "Quality Control",
    effectiveDate: "13 Oct 2026",
    id: "ACME-FS-2026-000004",
    name: "Data Integrity Functional Specification",
    related: [
      {
        id: "ACME-URS-2026-000005",
        name: "Document Control Requirements",
        version: "v1.0",
      },
    ],
    reviewers: [
      { decision: "Approved", name: "Priya Shah" },
      { decision: "Approved", name: "Ravi Patel" },
    ],
    status: "Approved",
    tags: ["Data integrity", "Functional"],
    type: "Functional Specification (FS)",
    version: "v1.0",
  },
  {
    approver: "Nina Patel",
    attachments: [
      {
        description: "Acceptance criteria per attribute",
        fileName: "MS-Test-Limits.pdf",
        name: "Test limits",
      },
    ],
    author: "Amit Kothari",
    category: "Controlled",
    department: "Quality Control",
    effectiveDate: "13 Oct 2026",
    id: "ACME-MS-2026-000006",
    name: "Raw Material Specification",
    related: [
      {
        id: "ACME-TM-2026-000014",
        name: "Cleaning Validation Test Method",
        version: "v1.0",
      },
    ],
    reviewers: [
      { decision: "Approved", name: "Emily Chen" },
      { decision: "Approved", name: "Ravi Patel" },
    ],
    status: "Approved",
    tags: ["Material", "Specification"],
    type: "Material Specification (MS)",
    version: "v1.0",
  },
  {
    attachments: [
      {
        description: "Supplier-issued, superseded lot",
        fileName: "CoA-Reagent-Lot-88421.pdf",
        name: "Certificate of analysis",
      },
    ],
    author: "James O’Brien",
    category: "External",
    department: "Manufacturing",
    effectiveDate: "4 Oct 2026",
    id: "ACME-EXT-2026-000016",
    name: "Supplier Certificate of Analysis",
    status: "Obsolete",
    tags: ["Supplier", "Certificate"],
    type: "External Document (EXT)",
    version: "v1.0",
  },
  {
    approver: "Nina Patel",
    attachments: [
      {
        description: "Swab recovery per surface",
        fileName: "TM-Recovery-Study.xlsx",
        name: "Recovery study",
      },
    ],
    author: "Sarah Johnson",
    category: "Controlled",
    department: "Manufacturing",
    effectiveDate: null,
    id: "ACME-TM-2026-000014",
    name: "Cleaning Validation Test Method",
    related: [
      {
        id: "ACME-VMP-2026-000001",
        name: "Equipment Validation Master Plan",
        version: "v3.0",
      },
    ],
    reviewers: [
      { decision: "Awaiting", name: "Amit Kothari" },
      { decision: "Awaiting", name: "Emily Chen" },
    ],
    status: "In Review",
    tags: ["Cleaning", "Validation"],
    type: "Test Method (TM)",
    version: "v1.0",
  },
];

const navItems = [
  { icon: LayoutDashboardIcon, label: "Dashboard", module: "dashboard" },
  { icon: FilesIcon, label: "Documents", module: "documents" },
  { icon: GraduationCapIcon, label: "Training" },
  { icon: TriangleAlertIcon, label: "Deviations" },
  { icon: WrenchIcon, label: "Asset Management" },
  { icon: ClipboardCheckIcon, label: "CAPA" },
  { icon: RefreshCwIcon, label: "Change Control" },
  { icon: TruckIcon, label: "Supplier Management" },
  { icon: BarChart3Icon, label: "Reports" },
].filter((item) => !(documentsOnly && item.module === "dashboard"));

const secondaryNavItems: {
  icon: typeof BookOpenIcon;
  label: string;
  module?: AppModule;
}[] = [
  { icon: BookOpenIcon, label: "Knowledge Hub" },
  { icon: CircleHelpIcon, label: "Help Center" },
  { icon: SettingsIcon, label: "Settings", module: "settings" },
  { icon: LogOutIcon, label: "Log out" },
];

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Draft", value: "Draft" },
  { label: "In Review", value: "In Review" },
  { label: "In Approval", value: "In Approval" },
  { label: "Approved", value: "Approved" },
  { label: "Superseded", value: "Superseded" },
  { label: "Obsolete", value: "Obsolete" },
];

// US-006 AC-03: the type filter loads from the configured list in
// Settings > Documents, not from whatever the current rows happen to use, so an
// unused type is still offered. These are the twelve of US-007 AC-01, in the
// order the mockup's `docTypeFilter` lists them. Keep in step with
// `documentTypes` in `settings-screens.tsx`, which holds the same twelve with
// their abbreviations and descriptions.
const configuredDocumentTypes: DocumentRecord["type"][] = [
  "Batch Record (BR)",
  "Design Specification (DS)",
  "External Document (EXT)",
  "Functional Specification (FS)",
  "Material Specification (MS)",
  "Product Specification (PS)",
  "Record (REC)",
  "Report (REP)",
  "Template (TMP)",
  "Test Method (TM)",
  "User Requirements Specification (URS)",
  "Validation Master Plan (VMP)",
];

// US-007 AC-03: the saved document joins the list as v1.0 with the signed-in
// user as Author and no effective date until it is approved.
function toRecord(created: CreatedDocument): DocumentRecord {
  const external = created.type === "External Document (EXT)";
  return {
    ...(created.approver ? { approver: created.approver } : {}),
    ...(created.attachments.length > 0
      ? { attachments: created.attachments }
      : {}),
    author: "Amit Kothari",
    category: external ? "External" : "Controlled",
    department: created.department as DocumentRecord["department"],
    effectiveDate: created.effectiveDate,
    id: created.documentId,
    name: created.name,
    // US-011 AC-02: an External Document has no References section at all, so
    // nothing is carried even if the form held values before the switch.
    ...(external || created.related.length === 0
      ? {}
      : { related: created.related }),
    ...(external || created.referred.length === 0
      ? {}
      : { referred: created.referred }),
    ...(created.reviewers.length > 0
      ? {
          reviewers: created.reviewers.map((name) => ({
            decision: "Awaiting" as const,
            name,
          })),
        }
      : {}),
    status: created.status,
    ...(created.tags.length > 0 ? { tags: created.tags } : {}),
    type: created.type as DocumentRecord["type"],
    version: "v1.0",
  };
}

const typeOptions = [
  { label: "All document types", value: "all" },
  ...configuredDocumentTypes.map((value) => ({ label: value, value })),
];

const pageSizeOptions = [
  { label: "10", value: "10" },
  { label: "20", value: "20" },
  { label: "50", value: "50" },
];

function StatusBadge({ status }: { status: DocumentStatus }) {
  const look = statusBadgeLook(status);
  return (
    <Badge className={look.className} size="lg" variant={look.variant}>
      {status}
    </Badge>
  );
}

function SidebarNavItem({
  active,
  collapsed,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  collapsed: boolean;
  icon: typeof BookOpenIcon;
  label: string;
  onClick: () => void;
}) {
  const button = (
    <button
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
      className={`flex h-9 w-full items-center rounded-lg text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring ${
        collapsed ? "justify-center px-0" : "gap-3 px-2.5"
      } ${
        active
          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-xs"
          : "hover:bg-white/10 hover:text-white"
      }`}
      onClick={onClick}
      type="button"
    >
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      <span className={`truncate ${collapsed ? "hidden" : "block"}`}>
        {label}
      </span>
    </button>
  );

  // Expanded, the label is already on screen. Collapsed, the icon is all there
  // is, so without this the only way to identify an item is to expand the
  // sidebar again.
  if (!collapsed) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipPopup side="right">{label}</TooltipPopup>
    </Tooltip>
  );
}

function AppSidebar({
  activeModule,
  collapsed,
  onNavigate,
  onToggle,
}: {
  activeModule: AppModule;
  collapsed: boolean;
  onNavigate: (module: AppModule) => void;
  onToggle: () => void;
}) {
  return (
    // Shared delay: the first hover waits, moving between items afterwards is
    // instant, so scanning a collapsed sidebar does not stutter.
    <TooltipProvider delay={400}>
      <aside
        className={`sticky top-2 flex h-[calc(100svh-1rem)] shrink-0 flex-col overflow-hidden rounded-xl border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm transition-[width] duration-200 ${collapsed ? "w-16" : "w-[248px]"}`}
      >
        <div
          className={`flex h-16 shrink-0 items-center ${collapsed ? "justify-center px-2" : "px-3"}`}
        >
          {collapsed ? (
            <button
              aria-label="Expand navigation"
              className="group flex size-10 items-center justify-center rounded-lg outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              onClick={onToggle}
              type="button"
            >
              {/* Swapped, not cross-faded: the mark is hidden outright while the
                expand icon shows, so the two are never visible at once. A
                silent logo gives no sign it is the control that expands the
                sidebar. */}
              <Image
                alt=""
                aria-hidden="true"
                className="size-8 object-contain brightness-0 invert group-hover:hidden group-focus-visible:hidden"
                height={32}
                priority
                src="/brand/accura-mark.svg"
                width={32}
              />
              <PanelLeftOpenIcon
                aria-hidden="true"
                className="hidden size-5 text-sidebar-foreground group-hover:block group-focus-visible:block"
              />
            </button>
          ) : (
            <>
              <Image
                alt="Accura"
                className="h-9 w-auto object-contain object-left brightness-0 invert"
                height={59}
                priority
                src="/brand/accura-logo.svg"
                width={164}
              />
              <Button
                aria-label="Collapse navigation"
                className="ms-auto text-sidebar-foreground hover:bg-white/10 hover:text-white"
                onClick={onToggle}
                size="icon-sm"
                variant="ghost"
              >
                <PanelLeftCloseIcon aria-hidden="true" />
              </Button>
            </>
          )}
        </div>

        <nav
          aria-label="Primary navigation"
          className="flex flex-col gap-1 p-2"
        >
          {navItems.map(({ icon, label, module }) => (
            <SidebarNavItem
              active={module === activeModule}
              collapsed={collapsed}
              icon={icon}
              key={label}
              label={label}
              onClick={() => {
                if (module === "dashboard" || module === "documents") {
                  onNavigate(module);
                }
              }}
            />
          ))}
        </nav>

        {/* The lime finally has a job.
            `--accura-pop` and `--accura-pop-soft` had been defined in
            globals.css and used in exactly one place — a decorative stripe on
            the dashboard cards, removed on 2026-11-11 for looking like a
            smear. A single warm accent against the brand's dark teal is what
            the colour is for; one card in the rail is enough to make it read
            as deliberate rather than stray. */}
        {!collapsed && (
          <section
            aria-labelledby="getting-started-heading"
            className="mx-2 mt-auto mb-2 overflow-hidden rounded-xl bg-[linear-gradient(140deg,var(--accura-pop)_0%,var(--accura-pop-soft)_100%)] p-4 text-[var(--accura-brand-950-darkshade)]"
          >
            <p
              className="font-bold text-sm leading-tight"
              id="getting-started-heading"
            >
              Getting started
            </p>
            <p className="mt-1 text-xs leading-snug opacity-80">
              Set up your document types, numbering and departments before your
              team starts filing.
            </p>
            <Button
              className="mt-3 w-full bg-[var(--accura-brand-950-darkshade)] text-white hover:bg-[var(--accura-brand-950-darkshade)]/90"
              onClick={() => onNavigate("settings")}
              size="sm"
            >
              Start setup
              <ChevronRightIcon aria-hidden="true" />
            </Button>
          </section>
        )}

        <nav
          aria-label="Support navigation"
          className={`flex flex-col gap-1 border-sidebar-border border-t p-2 ${collapsed ? "mt-auto" : ""}`}
        >
          {secondaryNavItems.map(({ icon, label, module }) => (
            <SidebarNavItem
              active={module === activeModule}
              collapsed={collapsed}
              icon={icon}
              key={label}
              label={label}
              onClick={() => {
                if (module) onNavigate(module);
              }}
            />
          ))}
        </nav>
      </aside>
    </TooltipProvider>
  );
}

export function DocumentsPrototype() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState<AppModule>(
    documentsOnly ? "documents" : "dashboard",
  );
  const [globalQuery, setGlobalQuery] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [department, setDepartment] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  /**
   * Settled on 2026-11-04: a brief, non-blocking confirmation is a toast, and
   * Settings has used one since. The Documents register had kept its own
   * inline banner, so the same kind of message appeared two different ways
   * depending on which module the user was in.
   */
  const notify = (message: string) =>
    toastManager.add({ title: message, type: "success" });
  // Which row's action menu is open. The menu popup is portalled out of the
  // table, so once it opens the pointer has left the row and focus sits inside
  // the portal: neither :hover nor :focus-within still describes the row, and
  // without this the chip and its masking cell both vanish behind the open menu.
  // The row whose details are open, so the detail screen can render it.
  const [openedDocument, setOpenedDocument] = useState<DocumentRecord | null>(
    null,
  );

  const [openMenuRow, setOpenMenuRow] = useState<string | null>(null);
  /**
   * Prototype chrome. It belongs beside the signed-in user it stands in for,
   * not inside a document screen — there it sat between the document's title
   * and its workflow and read as part of the record.
   */
  const [protoRole, setProtoRole] = useState<ProtoRole>("reviewer");

  /**
   * Settings owns these, and the Document module reads them. They were three
   * separate hard-coded copies until 2026-11-11 — see
   * `components/organisation-settings.ts`.
   */
  const [documentTypes, setDocumentTypes] =
    useState<DocumentTypeSetting[]>(initialDocumentTypes);
  const [departmentSettings, setDepartmentSettings] =
    useState<DepartmentSetting[]>(initialDepartments);
  const [numbering, setNumbering] =
    useState<NumberingSetting>(initialNumbering);
  const departmentNames = departmentSettings.map(
    (department) => department.name,
  );
  /**
   * `US-006` AC-03: the filter's options come from Settings, not from the
   * rows. Derived from the sample data until 2026-11-11, which meant a
   * department added in Settings never appeared here until some document
   * already used it — and a renamed one kept its old name in the filter.
   */
  const departmentOptions = [
    { label: "All departments", value: "all" },
    ...departmentNames.map((value) => ({ label: value, value })),
  ];

  // US-007 AC-03 saves the new document and returns to the list, so the rows
  // are state rather than the module-level sample array.
  const [records, setRecords] = useState<DocumentRecord[]>(documents);
  const [activeView, setActiveView] = useState<"list" | DocumentFlowView>(
    "list",
  );
  const globalSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const focusGlobalSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        globalSearchRef.current?.focus();
      }
    };

    window.addEventListener("keydown", focusGlobalSearch);
    return () => window.removeEventListener("keydown", focusGlobalSearch);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 960) setSidebarCollapsed(true);
  }, []);

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return records.filter((document) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [document.id, document.name, document.author].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        );
      return (
        matchesQuery &&
        (status === "all" || document.status === status) &&
        (type === "all" || document.type === type) &&
        (department === "all" || document.department === department)
      );
    });
  }, [department, query, records, status, type]);

  // Each row is one saved version. Keep versions of the same Document ID
  // consecutive (US-006 AC-01), newest version first within each family,
  // without disturbing the order in which the document families appear.
  const orderedDocuments = useMemo(() => {
    const order: string[] = [];
    const families = new Map<string, DocumentRecord[]>();
    for (const document of filteredDocuments) {
      const family = families.get(document.id);
      if (family) {
        family.push(document);
      } else {
        families.set(document.id, [document]);
        order.push(document.id);
      }
    }
    return order.flatMap((id) =>
      [...(families.get(id) ?? [])].sort((a, b) =>
        b.version.localeCompare(a.version, undefined, { numeric: true }),
      ),
    );
  }, [filteredDocuments]);

  const pageCount = Math.max(1, Math.ceil(orderedDocuments.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visibleDocuments = orderedDocuments.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const hasActiveFilters =
    query.length > 0 ||
    status !== "all" ||
    type !== "all" ||
    department !== "all";

  const resetPage = () => setPage(1);
  const clearFilters = () => {
    setQuery("");
    setStatus("all");
    setType("all");
    setDepartment("all");
    setPage(1);
  };

  const navigateToView = (view: "list" | DocumentFlowView) => {
    setActiveView(view);
    window.scrollTo({ top: 0 });
  };

  // US-011 AC-01: the details open *for that document*. Until 2026-11-11 this
  // routed by status and then dropped the record, so every row opened the same
  // hard-coded sample.
  /**
   * The detail screens change the record, not just the view: `US-013` sets the
   * Effective Date on approval, `US-014` saves Draft edits, `US-015` adds a new
   * version and `US-016` marks one Obsolete. Until 2026-11-11 the flow screens
   * could only change which view was shown, so every transition was undone by
   * going back to the register.
   */
  const sameVersion = (record: DocumentRecord, target: DocumentRecord) =>
    record.id === target.id && record.version === target.version;

  const patchOpenedDocument = (patch: Partial<DocumentRecord>) => {
    const target = openedDocument;
    if (!target) return;
    const next = { ...target, ...patch };
    setOpenedDocument(next);
    setRecords((current) =>
      current.map((record) => (sameVersion(record, target) ? next : record)),
    );
  };

  /**
   * `US-013` AC-02 and `US-015` AC-04: approving sets the Effective Date to 10
   * days after approval, and any earlier Approved version of the same document
   * becomes Superseded at that moment — not before.
   */
  const approveOpenedDocument = (effectiveDate: string) => {
    const target = openedDocument;
    if (!target) return;
    const next = {
      ...target,
      effectiveDate,
      status: "Approved" as DocumentStatus,
    };
    setOpenedDocument(next);
    setRecords((current) =>
      current.map((record) => {
        if (sameVersion(record, target)) return next;
        if (
          record.id === target.id &&
          record.status === "Approved" &&
          record.version.localeCompare(target.version, undefined, {
            numeric: true,
          }) < 0
        ) {
          return { ...record, status: "Superseded" as DocumentStatus };
        }
        return record;
      }),
    );
  };

  /** `US-015` AC-02: the revision is a new row, and it opens as the Draft. */
  const createRevision = (revision: DocumentRecord) => {
    setRecords((current) => [revision, ...current]);
    setOpenedDocument(revision);
    navigateToView("draft");
  };

  const openDocument = (document: DocumentRecord) => {
    setActiveModule("documents");
    setOpenedDocument(document);
    if (document.status === "Draft") navigateToView("draft");
    else if (document.status === "In Review") navigateToView("review");
    else if (document.status === "In Approval") navigateToView("qa");
    else if (document.status === "Superseded") navigateToView("superseded");
    else if (document.status === "Obsolete") navigateToView("obsolete");
    else navigateToView("approved");
  };

  return (
    <div className="flex min-h-svh gap-2 bg-[var(--accura-canvas)] p-2">
      <AppSidebar
        activeModule={activeModule}
        collapsed={sidebarCollapsed}
        onNavigate={(module) => {
          setActiveModule(module);
          if (module === "documents") navigateToView("list");
        }}
        onToggle={() => setSidebarCollapsed((value) => !value)}
      />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center border-border border-b bg-[var(--accura-canvas)] p-3">
          {/* 300px: the global search is a shortcut, not the page's subject. At
              max-w-2xl it was the widest thing in the bar and pulled the eye
              before the module did. */}
          <InputGroup className="h-10 w-full max-w-[300px] bg-background shadow-xs">
            <InputGroupAddon>
              <SearchIcon aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Global search"
              onChange={(event) => setGlobalQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && globalQuery.trim()) {
                  setActiveModule("documents");
                  setQuery(globalQuery.trim());
                  setPage(1);
                  notify(
                    `Showing document matches for “${globalQuery.trim()}”.`,
                  );
                }
                if (event.key === "Escape") {
                  setGlobalQuery("");
                  event.currentTarget.blur();
                }
              }}
              placeholder="Search for anything…"
              ref={globalSearchRef}
              type="search"
              value={globalQuery}
            />
            <InputGroupAddon align="inline-end" className="max-sm:hidden">
              <Kbd className="whitespace-nowrap bg-[var(--accura-brand-150-lightshade)] text-[var(--accura-brand-950-darkshade)]">
                ⌘ K
              </Kbd>
            </InputGroupAddon>
          </InputGroup>
          <div className="ms-auto flex items-center gap-2">
            <RoleSwitcher onRoleChange={setProtoRole} role={protoRole} />
            <div className="mx-1 h-7 w-px bg-border max-lg:hidden" />
            <Button
              aria-label="Notifications, 3 unread"
              className="relative overflow-visible"
              size="icon"
              variant="ghost"
            >
              <BellIcon aria-hidden="true" />
              <span className="absolute end-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accura-coral)] px-1 font-medium text-[10px] text-[var(--accura-brand-950-darkshade)] ring-2 ring-background">
                3
              </span>
            </Button>
            <div className="mx-1 h-7 w-px bg-border" />
            {/* The identity follows the role the prototype is standing in
                for: saying "Assigned Reviewer" while the avatar still reads
                Amit Kothari tells the viewer two things at once. */}
            <Avatar className="[--avatar-size:--spacing(8)]">
              <AvatarFallback className="bg-[var(--accura-brand-150-lightshade)] text-[var(--accura-brand-950-darkshade)]">
                {initialsOf(roleIdentity(protoRole).user)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 max-sm:hidden">
              <p className="truncate font-medium text-sm">
                {roleIdentity(protoRole).user}
              </p>
              <p className="truncate text-muted-foreground text-xs">
                {roleIdentity(protoRole).label}
              </p>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100svh-5rem)] p-5 sm:p-6 xl:p-8">
          {activeModule === "settings" ? (
            <SettingsScreen
              departments={departmentSettings}
              documentTypes={documentTypes}
              numbering={numbering}
              onDepartmentsChange={setDepartmentSettings}
              onDocumentTypesChange={setDocumentTypes}
              onNumberingChange={setNumbering}
            />
          ) : activeModule === "dashboard" ? (
            <DashboardScreen
              onOpenDocuments={() => {
                setActiveModule("documents");
                navigateToView("list");
              }}
            />
          ) : activeView === "list" ? (
            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h1 className="font-bold text-2xl leading-tight">
                    Documents
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Find, review, and manage controlled quality documents.
                  </p>
                </div>

                <Button onClick={() => navigateToView("create")} size="lg">
                  <PlusIcon aria-hidden="true" />
                  Create document
                </Button>
              </div>

              <section
                aria-label="Document filters"
                className="flex flex-col gap-3"
              >
                <div className="grid gap-3 lg:grid-cols-[minmax(280px,1fr)_180px_180px_220px]">
                  <InputGroup>
                    <InputGroupInput
                      aria-label="Search documents"
                      onChange={(event) => {
                        setQuery(event.target.value);
                        resetPage();
                      }}
                      placeholder="Search by name, ID, or author…"
                      type="search"
                      value={query}
                    />
                    <InputGroupAddon>
                      <SearchIcon aria-hidden="true" />
                    </InputGroupAddon>
                  </InputGroup>

                  <Select
                    items={statusOptions}
                    onValueChange={(value) => {
                      setStatus(String(value));
                      resetPage();
                    }}
                    value={status}
                  >
                    <SelectTrigger aria-label="Filter by status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPopup>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectPopup>
                  </Select>

                  <Select
                    items={typeOptions}
                    onValueChange={(value) => {
                      setType(String(value));
                      resetPage();
                    }}
                    value={type}
                  >
                    <SelectTrigger aria-label="Filter by document type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPopup>
                      {typeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectPopup>
                  </Select>

                  <Select
                    items={departmentOptions}
                    onValueChange={(value) => {
                      setDepartment(String(value));
                      resetPage();
                    }}
                    value={department}
                  >
                    <SelectTrigger aria-label="Filter by department">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPopup>
                      {departmentOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectPopup>
                  </Select>
                </div>

                <div className="flex min-h-7 flex-wrap items-center gap-2 text-sm">
                  <SlidersHorizontalIcon
                    aria-hidden="true"
                    className="size-4 text-muted-foreground"
                  />
                  <span className="text-muted-foreground">
                    {filteredDocuments.length}{" "}
                    {filteredDocuments.length === 1 ? "document" : "documents"}
                  </span>
                  {hasActiveFilters && (
                    <Button onClick={clearFilters} size="xs" variant="ghost">
                      Clear filters
                    </Button>
                  )}
                </div>
              </section>

              <section
                aria-label="Documents table"
                className="overflow-hidden rounded-xl border bg-card shadow-xs"
              >
                <ScrollableTable>
                  {(atEnd) => (
                    <>
                      <TableHeader className="bg-[var(--accura-zinc-50)]">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-[220px] ps-4 text-xs">
                            Document ID
                          </TableHead>
                          <TableHead className="min-w-[240px] text-xs">
                            Name
                          </TableHead>
                          <TableHead className="w-[132px] text-xs">
                            Status
                          </TableHead>
                          <TableHead className="w-[96px] text-xs">
                            Version
                          </TableHead>
                          <TableHead className="w-[124px] text-xs">
                            Category
                          </TableHead>
                          <TableHead className="w-[150px] text-xs">
                            Document type
                          </TableHead>
                          <TableHead className="w-[170px] text-xs">
                            Department
                          </TableHead>
                          <TableHead className="w-[150px] text-xs">
                            Author
                          </TableHead>
                          <TableHead className="w-[140px] text-xs">
                            Effective date
                          </TableHead>
                          <TableHead className="w-14 pe-3 text-right text-xs">
                            <span className="sr-only">Actions</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visibleDocuments.length > 0 ? (
                          visibleDocuments.map((document) => {
                            const rowKey = `${document.id}-${document.version}`;
                            const menuOpen = openMenuRow === rowKey;

                            return (
                              <TableRow
                                key={rowKey}
                                className={`group hover:bg-secondary/48 ${
                                  menuOpen ? "bg-secondary/48" : ""
                                }`}
                              >
                                <TableCell className="ps-4">
                                  {/* The Document ID is the row's link, so it
                                      carries a link colour at rest rather than
                                      the foreground every other cell uses.
                                      `--primary` is too close to the body text
                                      at this size to read as anything; Brand
                                      900 is a clear hue shift and still 7.7:1
                                      on white. */}
                                  <button
                                    className="identifier block max-w-[196px] truncate text-left font-medium text-[var(--accura-brand-900)] text-sm underline decoration-transparent underline-offset-2 outline-none transition-colors hover:decoration-current focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
                                    onClick={() => openDocument(document)}
                                    title={document.id}
                                    type="button"
                                  >
                                    {document.id}
                                  </button>
                                </TableCell>
                                <TableCell>
                                  <span
                                    className="block max-w-[240px] truncate"
                                    title={document.name}
                                  >
                                    {document.name}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <StatusBadge status={document.status} />
                                </TableCell>
                                <TableCell>
                                  <span className="identifier">
                                    {document.version}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {document.category}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <span
                                    className="block max-w-[150px] truncate"
                                    title={document.type}
                                  >
                                    {document.type}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span
                                    className="block max-w-[170px] truncate"
                                    title={document.department}
                                  >
                                    {document.department}
                                  </span>
                                </TableCell>
                                <TableCell>{document.author}</TableCell>
                                <TableCell>
                                  {document.effectiveDate ?? "—"}
                                </TableCell>
                                <TableCell
                                  className={`sticky end-0 pe-3 text-right transition-colors duration-150 ${
                                    atEnd
                                      ? "bg-transparent"
                                      : menuOpen
                                        ? "bg-[var(--accura-zinc-50)]"
                                        : "bg-transparent group-hover:bg-[var(--accura-zinc-50)] group-has-[:focus-visible]:bg-[var(--accura-zinc-50)]"
                                  }`}
                                >
                                  <Menu
                                    onOpenChange={(open) =>
                                      setOpenMenuRow(open ? rowKey : null)
                                    }
                                  >
                                    <span
                                      className={`inline-flex transition-opacity duration-150 ${
                                        atEnd
                                          ? "opacity-100"
                                          : `rounded-lg border border-border bg-card shadow-[0_1px_2px_0_--theme(--color-black/8%),0_4px_10px_-2px_--theme(--color-black/16%),0_12px_24px_-8px_--theme(--color-black/28%)] ${
                                              menuOpen
                                                ? "opacity-100"
                                                : "opacity-0 group-hover:opacity-100 group-has-[:focus-visible]:opacity-100"
                                            }`
                                      }`}
                                    >
                                      <MenuTrigger
                                        render={
                                          <Button
                                            aria-label={`Actions for ${document.name}`}
                                            size="icon-sm"
                                            variant="ghost"
                                          />
                                        }
                                      >
                                        <MoreHorizontalIcon aria-hidden="true" />
                                      </MenuTrigger>
                                    </span>
                                    {/* View details opens the document, the
                                        same as its ID. A dialog that summarised
                                        the row and then offered "Open document"
                                        put a step in front of the only thing
                                        it could do. */}
                                    <MenuPopup align="end">
                                      <MenuItem
                                        onClick={() => openDocument(document)}
                                      >
                                        <FileTextIcon aria-hidden="true" />
                                        View details
                                      </MenuItem>
                                      <MenuItem>
                                        <FileClockIcon aria-hidden="true" />
                                        Version history
                                      </MenuItem>
                                    </MenuPopup>
                                  </Menu>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell
                              className="h-64 text-center"
                              colSpan={10}
                            >
                              <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                                  <FileSearchIcon
                                    aria-hidden="true"
                                    className="size-5 text-muted-foreground"
                                  />
                                </div>
                                <p className="font-medium">
                                  No documents found
                                </p>
                                <p className="text-muted-foreground text-sm">
                                  Adjust your search or clear the current
                                  filters.
                                </p>
                                <Button
                                  className="mt-2"
                                  onClick={clearFilters}
                                  size="sm"
                                  variant="outline"
                                >
                                  Clear filters
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </>
                  )}
                </ScrollableTable>
              </section>

              <footer className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex shrink-0 items-center gap-2 whitespace-nowrap text-muted-foreground text-sm">
                  <span className="shrink-0">Rows per page</span>
                  <Select
                    items={pageSizeOptions}
                    onValueChange={(value) => {
                      setPageSize(Number(value));
                      setPage(1);
                    }}
                    value={String(pageSize)}
                  >
                    <SelectTrigger
                      aria-label="Rows per page"
                      className="min-w-20"
                      size="sm"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPopup>
                      {pageSizeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectPopup>
                  </Select>
                  <span>{filteredDocuments.length} total</span>
                </div>

                <nav
                  aria-label="Document pages"
                  className="flex items-center gap-1"
                >
                  <Button
                    aria-label="Previous page"
                    disabled={safePage === 1}
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    size="icon"
                    variant="outline"
                  >
                    <ChevronLeftIcon aria-hidden="true" />
                  </Button>
                  {Array.from(
                    { length: pageCount },
                    (_, index) => index + 1,
                  ).map((pageNumber) => (
                    <Button
                      key={pageNumber}
                      aria-current={
                        safePage === pageNumber ? "page" : undefined
                      }
                      aria-label={`Page ${pageNumber}`}
                      onClick={() => setPage(pageNumber)}
                      size="icon"
                      variant={
                        safePage === pageNumber ? "secondary" : "outline"
                      }
                    >
                      {pageNumber}
                    </Button>
                  ))}
                  <Button
                    aria-label="Next page"
                    disabled={safePage === pageCount}
                    onClick={() =>
                      setPage((value) => Math.min(pageCount, value + 1))
                    }
                    size="icon"
                    variant="outline"
                  >
                    <ChevronRightIcon aria-hidden="true" />
                  </Button>
                </nav>
              </footer>
            </div>
          ) : activeView === "create" ? (
            <CreateDocumentScreen
              candidates={records}
              departments={departmentNames}
              documentTypes={documentTypes}
              numbering={numbering}
              nextSequence={records.length + 1}
              onBack={() => navigateToView("list")}
              onSaved={(created) => {
                setRecords((current) => [toRecord(created), ...current]);
                notify(
                  created.status === "Approved"
                    ? `${created.documentId} registered as Approved, effective ${created.effectiveDate}. Version v1.0 assigned.`
                    : `${created.documentId} saved as ${created.status}. Version v1.0 assigned.`,
                );
                setQuery("");
                setStatus("all");
                setType("all");
                setDepartment("all");
                setPage(1);
                navigateToView("list");
              }}
            />
          ) : (
            <DocumentFlowScreen
              candidates={records}
              departments={departmentNames}
              document={openedDocument ?? records[0]}
              documentTypes={documentTypes}
              onApprove={approveOpenedDocument}
              onBack={() => navigateToView("list")}
              onCreateRevision={(revision) =>
                createRevision(revision as DocumentRecord)
              }
              onNotice={notify}
              onOpenReference={(reference) => {
                // US-011 AC-02: a reference is a link. It opens the version it
                // names, or the newest one carrying that ID if that exact
                // version is no longer in the register.
                const target =
                  records.find(
                    (record) =>
                      record.id === reference.id &&
                      record.version === reference.version,
                  ) ?? records.find((record) => record.id === reference.id);
                if (target) openDocument(target);
                else
                  notify(
                    `${reference.id} ${reference.version} is no longer in the register.`,
                  );
              }}
              onPatch={(patch) =>
                patchOpenedDocument(patch as Partial<DocumentRecord>)
              }
              onViewChange={navigateToView}
              role={protoRole}
              view={activeView}
            />
          )}
        </main>
      </div>
    </div>
  );
}
