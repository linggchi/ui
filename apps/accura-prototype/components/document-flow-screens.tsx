"use client";

import { Avatar, AvatarFallback } from "@coss/ui/components/avatar";
import { Badge } from "@coss/ui/components/badge";
import { Button } from "@coss/ui/components/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxTrigger,
  ComboboxValue,
} from "@coss/ui/components/combobox";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@coss/ui/components/dialog";
import {
  Drawer,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
} from "@coss/ui/components/drawer";
import { Field, FieldDescription } from "@coss/ui/components/field";
import { Input } from "@coss/ui/components/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@coss/ui/components/input-group";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@coss/ui/components/menu";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@coss/ui/components/select";
import { Textarea } from "@coss/ui/components/textarea";
import {
  WarningTriangle as AlertTriangleIcon,
  Archive as ArchiveIcon,
  ArrowLeft as ArrowLeftIcon,
  CheckCircle as CheckCircleIcon,
  Check as CheckIcon,
  NavArrowDown as ChevronsUpDownIcon,
  Clock as ClockIcon,
  Download as DownloadIcon,
  Expand as ExpandIcon,
  Page as FileTextIcon,
  Lock as LockIcon,
  MoreHoriz as MoreIcon,
  Attachment as PaperclipIcon,
  Printer as PrinterIcon,
  RefreshDouble as RefreshIcon,
  FloppyDisk as SaveIcon,
  ShieldCheck as ShieldCheckIcon,
  Upload as UploadIcon,
  User as UserIcon,
  Xmark as XIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from "iconoir-react";
import { useEffect, useState } from "react";
import {
  FormLabel,
  RECESSED_INPUT,
  SectionCard,
  SectionHeading,
} from "@/components/accura-form";
import { people } from "@/components/document-directory";
import {
  type DocumentStatusName,
  statusBadgeLook,
} from "@/components/document-status";
import {
  type DocumentTypeSetting,
  frequencyForType,
} from "@/components/organisation-settings";
import {
  canManage,
  type ProtoRole,
  roleIdentity,
} from "@/components/prototype-role";
import {
  type ReferenceCandidate,
  ReferencePicker,
} from "@/components/reference-picker";

export type DocumentFlowView =
  | "create"
  | "draft"
  | "review"
  | "qa"
  | "approved"
  | "superseded"
  | "obsolete";

/**
 * The record the details view renders. `US-011` AC-01 opens the details "for
 * that document", so the screen is driven by the selected row rather than by
 * the hard-coded sample it carried until 2026-11-11.
 *
 * Declared here rather than imported from `documents-prototype.tsx`, which
 * imports this module; the list's `DocumentRecord` is assignable to it.
 */
export type DocumentAttachment = {
  description: string;
  fileName: string;
  name: string;
};

export type DocumentReference = {
  id: string;
  name: string;
  version: string;
};

/**
 * `US-012` AC-02: every Reviewer assigned to the document must approve before
 * it moves to In Approval, so a single decision is not enough — the screen has
 * to carry one decision per assigned Reviewer and count them.
 */
export type DocumentReviewer = {
  // Set when the decision was recorded by a user with Read and Write All
  // Records permission rather than by the assigned Reviewer themselves, so the
  // acting identity in AC-02 is never lost behind the assignment.
  by?: string;
  decision: "Approved" | "Awaiting";
  name: string;
};

/**
 * `US-012` AC-03 and `US-011` AC-03: a Draft returned by a rejection shows the
 * rejecting role, user, date and time, and reason.
 */
export type DocumentRejection = {
  at: string;
  reason: string;
  role: string;
  user: string;
};

export type DocumentSummary = {
  approver?: string;
  attachments?: DocumentAttachment[];
  author: string;
  category: "Controlled" | "External";
  department: string;
  effectiveDate: string | null;
  id: string;
  name: string;
  // US-011 AC-02: Related and Referred links belong to a Controlled Document;
  // an External Document has no References section at all.
  related?: DocumentReference[];
  referred?: DocumentReference[];
  /** `US-015` AC-02: the change summary saved with this version. */
  revisionHistory?: string;
  reviewers?: DocumentReviewer[];
  status: string;
  tags?: string[];
  type: string;
  version: string;
};

/**
 * `US-007` (PRD-001) AC-01 and AC-03: every Document Type carries a periodic
 * review frequency in whole years, configured in Settings > Documents, and a
 * type without its own value uses three years. That screen is not built, so
 * the prototype has only the default to read.
 */

/**
 * `US-013` AC-02: an approved Controlled Document becomes effective 10 days
 * after approval, so the approval date is the effective date less 10 days.
 * `US-010` AC-04: an External Document is approved at registration, so its
 * effective date *is* the approval date.
 */
function approvalDateOf(document: DocumentSummary): Date | null {
  if (!document.effectiveDate) return null;
  const effective = new Date(document.effectiveDate);
  if (Number.isNaN(effective.getTime())) return null;
  if (document.category === "External") return effective;
  effective.setDate(effective.getDate() - 10);
  return effective;
}

// Written out rather than taken from toLocaleDateString, whose en-GB "short"
// month gives "Sept" while every date already in the register reads "Sep".
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const formatDate = (date: Date) =>
  `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

/**
 * `US-011` AC-02: before approval the review date is not known; after it, the
 * date is the approval date plus the type's frequency. Past that date the
 * document is Overdue for Periodic Review — a displayed state only, which
 * AC-06 and AC-07 are explicit does not change Approved or Effective.
 */
function periodicReview(
  document: DocumentSummary,
  documentTypes: DocumentTypeSetting[],
) {
  const approved = approvalDateOf(document);
  if (!approved) return { label: "Set after approval", overdue: false };
  const due = new Date(approved);
  // US-007 (PRD-001) AC-04: the frequency configured for this document's type
  // in Settings > Documents, which was a hard-coded 3 until 2026-11-11.
  due.setFullYear(
    due.getFullYear() + frequencyForType(documentTypes, document.type),
  );
  return { label: formatDate(due), overdue: due.getTime() < Date.now() };
}

// PRD-002 defers electronic signature from the initial Document Module
// implementation, so a decision is recorded without one. Rejection still needs
// a required reason, which is the only dialog left on this path.
type DecisionAction = "approve" | "reject" | "submit" | null;

/**
 * `US-012` AC-01 gates the Review stage on being an assigned Reviewer or
 * holding Read and Write All Records. `US-011` AC-05 gates the Approval stage
 * on the assigned Approver or the same permission.
 */
function canDecide(role: ProtoRole, view: DocumentFlowView) {
  if (role === "all-records") return true;
  if (view === "review") return role === "reviewer";
  if (view === "qa") return role === "approver";
  return false;
}

/** The acting identity a recorded decision is attributed to (AC-02). */
/**
 * Who is acting. The top bar names a person per role, so the decision is
 * recorded under *that* person — not under whoever the document happens to
 * have outstanding. If the shell says you are Sarah Johnson and the approval
 * lands under someone else, the record is lying about who acted.
 */
function actingUser(role: ProtoRole) {
  return roleIdentity(role).user;
}

/** The document's assigned Reviewers, or the two the mockup's route shows. */
function reviewersOf(document: DocumentSummary): DocumentReviewer[] {
  return (
    document.reviewers?.map((item) => ({ ...item })) ?? [
      { decision: "Awaiting", name: "Amit Kothari" },
      { decision: "Awaiting", name: "Priya Shah" },
    ]
  );
}

/**
 * `US-012` AC-02 records the decision under the acting user's identity, and
 * the story's note keeps the transition gated on *every assigned* Reviewer.
 * So one approval clears one assigned slot: the actor's own when they are
 * assigned, otherwise the first outstanding one, annotated with who acted.
 */
function recordApproval(
  reviewers: DocumentReviewer[],
  actor: string,
): DocumentReviewer[] {
  const own = reviewers.findIndex(
    (item) => item.name === actor && item.decision === "Awaiting",
  );
  const index =
    own === -1
      ? reviewers.findIndex((item) => item.decision === "Awaiting")
      : own;
  if (index === -1) return reviewers;
  return reviewers.map((item, position) =>
    position === index
      ? {
          decision: "Approved" as const,
          name: item.name,
          ...(own === -1 ? { by: actor } : {}),
        }
      : item,
  );
}

/** `3 Nov 2026, 10:42 AM` — the format the audit trail already uses. */
function formatDateTime(date: Date) {
  const hours = date.getHours();
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  const suffix = hours < 12 ? "AM" : "PM";
  const hour = hours % 12 === 0 ? 12 : hours % 12;
  return `${formatDate(date)}, ${hour}:${minutes} ${suffix}`;
}

/**
 * `US-018`: the prototype stores no uploaded bytes, so a download cannot hand
 * over the real file. It hands over a placeholder that *says* it is one, named
 * for the document and the action, rather than pretending to be the document.
 * Replace this the moment files are stored.
 */
function downloadPlaceholder(document: DocumentSummary, kind: string) {
  const body = [
    `${document.id} · ${document.version} · ${document.name}`,
    `Requested: ${kind}`,
    "",
    "This is a placeholder from the Accura prototype.",
    "No uploaded file is stored here, so no original or controlled PDF exists to download.",
  ].join("\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/plain" }));
  const link = window.document.createElement("a");
  link.download = `${document.id}-${document.version}-${kind.toLowerCase().replace(/\s+/g, "-")}-placeholder.txt`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

type DocumentFlowScreenProps = {
  /** Every document that could be linked, for `US-014` AC-02's references. */
  candidates: ReferenceCandidate[];
  departments: string[];
  document: DocumentSummary;
  /** Settings > Documents, for this document type's review frequency. */
  documentTypes: DocumentTypeSetting[];
  /** `US-013` AC-02: approve, and set the Effective Date 10 days out. */
  onApprove: (effectiveDate: string) => void;
  onBack: () => void;
  /** `US-015` AC-02: the revision is a new version row, opened as its Draft. */
  onCreateRevision: (revision: DocumentSummary) => void;
  onNotice: (message: string) => void;
  /** `US-011` AC-02: a reference is a link, so it opens that document. */
  onOpenReference: (reference: DocumentReference) => void;
  /** `US-014` and `US-016`: write a change back to the saved record. */
  onPatch: (patch: Partial<DocumentSummary>) => void;
  onViewChange: (view: DocumentFlowView) => void;
  /** Prototype chrome: the viewer the top bar is standing in for. */
  role: ProtoRole;
  view: DocumentFlowView;
};

/**
 * `US-013` AC-02: an approved Controlled Document's Effective Date is 10 days
 * after the approval date. `US-010` AC-04 approves an External Document at
 * registration, which is the create screen's path, not this one.
 */
const EFFECTIVE_DATE_LAG_DAYS = 10;

function effectiveDateFromApproval(approvedAt: Date) {
  const effective = new Date(approvedAt);
  effective.setDate(effective.getDate() + EFFECTIVE_DATE_LAG_DAYS);
  return formatDate(effective);
}

/** `US-015` AC-02: `v1.0` → `v2.0`; the integer increments, `.0` stays. */
function nextVersion(version: string) {
  const major = Number.parseInt(version.replace(/^v/, ""), 10);
  return Number.isNaN(major) ? "v2.0" : `v${major + 1}.0`;
}

const workflowSteps = [
  { key: "draft", label: "Draft" },
  { key: "review", label: "In Review" },
  { key: "qa", label: "In Approval" },
  { key: "approved", label: "Approved" },
] as const;

const stageIndex: Record<DocumentFlowView, number> = {
  approved: 3,
  create: 0,
  draft: 0,
  obsolete: 3,
  qa: 2,
  review: 1,
  superseded: 3,
};

function statusForView(view: DocumentFlowView) {
  if (view === "create" || view === "draft") return "Draft";
  if (view === "review") return "In Review";
  if (view === "qa") return "In Approval";
  if (view === "superseded") return "Superseded";
  if (view === "obsolete") return "Obsolete";
  return "Approved";
}

// One status reads the same in the register and in the details, because both
// read the same map. See `components/document-status.ts`.
function statusLook(view: DocumentFlowView) {
  return statusBadgeLook(statusForView(view) as DocumentStatusName);
}

/**
 * The caption under each stage says who completed it. A stage with exactly one
 * actor names that person; the Review stage can have several, so it states a
 * count instead of a list.
 *
 * Naming one reviewer and hiding the rest behind "+1" asks the reader to work
 * out what the +1 counts and leaves a surname truncated, which is the wrong
 * thing to abbreviate in a QMS. The Approval card beside the stepper already
 * names every reviewer with their decision, so repeating the roster here would
 * give one fact two sources — and the narrow one would be the first to lie.
 */
function stageCaption(
  stageKey: string,
  document: DocumentSummary,
  reviewers: DocumentReviewer[],
) {
  if (stageKey === "draft") return `Completed by ${document.author}`;
  if (stageKey === "review") {
    if (reviewers.length === 0) return "Completed";
    if (reviewers.length === 1) return `Approved by ${reviewers[0].name}`;
    return `Approved by ${reviewers.length} Reviewers`;
  }
  if (stageKey === "qa")
    return `Approved by ${document.approver ?? "the Approver"}`;
  return "Completed";
}

function WorkflowStepper({
  document,
  reviewers,
  view,
}: {
  document: DocumentSummary;
  reviewers: DocumentReviewer[];
  view: DocumentFlowView;
}) {
  const current = stageIndex[view];
  return (
    <section
      aria-label="Document workflow"
      className="rounded-xl border bg-background px-4 py-4 shadow-xs"
    >
      <ol className="grid grid-cols-4 gap-2">
        {workflowSteps.map((step, index) => {
          const complete = index < current;
          const active = index === current;
          return (
            <li
              className="relative flex min-w-0 flex-col items-center gap-2 text-center"
              key={step.key}
            >
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className={`absolute end-1/2 top-3 h-px w-full ${index <= current ? "bg-primary" : "bg-border"}`}
                />
              )}
              <span
                className={`relative z-1 flex size-6 items-center justify-center rounded-full border text-xs ${
                  complete
                    ? "border-primary bg-primary text-primary-foreground"
                    : active
                      ? "border-primary bg-background text-primary ring-4 ring-primary/12"
                      : "border-border bg-background text-muted-foreground"
                }`}
              >
                {complete ? (
                  <CheckIcon aria-hidden="true" className="size-3.5" />
                ) : (
                  index + 1
                )}
              </span>
              {/* The stage names carry the weight and the brand colour; the
                  line under each one stays muted, so the stepper reads as a
                  row of stages rather than a row of sentences. */}
              <span className="truncate font-semibold text-primary text-xs">
                {step.label}
              </span>
              {/* 11px sat below the smallest size anything else in Accura
                  uses and read as noise rather than as information. */}
              <span className="text-muted-foreground text-xs max-md:hidden">
                {complete
                  ? stageCaption(step.key, document, reviewers)
                  : active
                    ? "Current stage"
                    : "Not started"}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/**
 * A role and the people in it. The Approval route has two stages that do
 * different jobs, and a flat column of names hides that: the Approver becomes
 * the last row rather than the next gate.
 */
function AssigneeGroup({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-semibold text-sm">{label}</p>
      {children}
    </div>
  );
}

function Assignee({
  decision,
  initials,
  label,
  roleLabel,
}: {
  // US-012 AC-02: the review progress reflects the recorded decision, so each
  // assigned Reviewer carries their own state rather than a shared one.
  decision?: "Approved" | "Awaiting";
  initials: string;
  label: string;
  roleLabel?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-background p-3">
      <Avatar className="[--avatar-size:--spacing(8)]">
        <AvatarFallback className="bg-secondary text-secondary-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-sm">{label}</p>
        {roleLabel && (
          <p className="truncate text-muted-foreground text-xs">{roleLabel}</p>
        )}
      </div>
      {decision && (
        <Badge variant={decision === "Approved" ? "success" : "secondary"}>
          {decision}
        </Badge>
      )}
    </div>
  );
}

function RejectDialog({
  action,
  onComplete,
  onOpenChange,
}: {
  action: DecisionAction;
  onComplete: (reason: string) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const [reason, setReason] = useState("");
  const [prompted, setPrompted] = useState(false);
  const [wasOpen, setWasOpen] = useState(false);
  const open = action === "reject";
  const empty = reason.trim().length === 0;

  // A reason belongs to one rejection. The dialog is opened by setting state
  // rather than by a trigger, so `onOpenChange` never reports the opening and
  // cannot clear the last reason — the transition is read here instead.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setReason("");
      setPrompted(false);
    }
  }

  // US-012 AC-03: Reject with an empty Reason is *not submitted* and the user
  // is prompted for a reason. A disabled control would prevent the attempt
  // instead of answering it, so the control stays live and the field reports.
  const submit = () => {
    if (empty) {
      setPrompted(true);
      return;
    }
    onComplete(reason.trim());
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPopup className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reject document</DialogTitle>
          <DialogDescription>
            The document returns to Draft immediately and the current review
            cycle ends. The reason is recorded on the Draft and in the audit
            trail.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel className="flex flex-col gap-4">
          <Field>
            <FormLabel>Reason for rejection</FormLabel>
            <Textarea
              aria-describedby="reject-reason-hint"
              aria-invalid={prompted && empty}
              aria-label="Reason for rejection"
              onChange={(event) => {
                setReason(event.target.value);
                if (prompted) setPrompted(false);
              }}
              placeholder="Explain what must change before this document can advance"
              value={reason}
            />
            {prompted && empty ? (
              <FieldDescription
                className="text-destructive"
                id="reject-reason-hint"
              >
                Enter a reason before rejecting this document.
              </FieldDescription>
            ) : (
              <FieldDescription id="reject-reason-hint">
                Required — a rejection cannot be recorded without a reason.
              </FieldDescription>
            )}
          </Field>
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <Button onClick={submit} variant="destructive">
            Reject document
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

/**
 * `US-016` AC-02 and AC-03: marking a document Obsolete is confirmed first, in
 * a dialog that says what becomes true, and the choices are **Keep document**
 * and **Mark as Obsolete** — not a generic Cancel/OK, so neither button can be
 * pressed without reading which one it is.
 */
/**
 * Approving is confirmed before it is recorded.
 *
 * `US-012` AC-02 and `US-013` AC-02 say the decision is submitted **without an
 * electronic-signature prompt**, and electronic signature is deferred from the
 * initial implementation. A confirmation is not a signature: it asks nothing
 * of the user beyond reading what they are about to do, captures no credential
 * and adds no identity check. With the signature step gone there is otherwise
 * nothing at all between a single click and a recorded, auditable decision —
 * and in a QMS that decision is the point of the whole module.
 *
 * Added at the user's direction on 2026-11-11 and recorded as a divergence,
 * because the ACs do not ask for it.
 */
function ApproveDialog({
  consequence,
  document,
  onConfirm,
  onOpenChange,
  open,
  user,
}: {
  consequence: string;
  document: DocumentSummary;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  user: string;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPopup className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record your approval?</DialogTitle>
          <DialogDescription>
            Your approval of {document.id} {document.version} is recorded
            against <strong className="font-medium">{user}</strong> and appears
            in the audit trail. {consequence}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <Button onClick={onConfirm}>Approve</Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

function ObsoleteDialog({
  document,
  onConfirm,
  onOpenChange,
  open,
}: {
  document: DocumentSummary;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPopup className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Mark as obsolete?</DialogTitle>
          <DialogDescription>
            {document.id} · {document.version} becomes Obsolete. It stays
            readable and printable, and it is no longer available for active use
            or for linking from another document.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>
            Keep document
          </DialogClose>
          <Button onClick={onConfirm} variant="destructive">
            Mark as obsolete
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

/**
 * `US-015` AC-02 and AC-03: a revision starts from the approved version, needs
 * a replacement primary file and a **required** Revision History summary, and
 * carries everything else over. The source version stays Approved (AC-04).
 */
function RevisionDialog({
  document,
  onConfirm,
  onOpenChange,
  open,
}: {
  document: DocumentSummary;
  onConfirm: (summary: string) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const [summary, setSummary] = useState("");
  const [fileAdded, setFileAdded] = useState(false);
  const [prompted, setPrompted] = useState(false);
  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSummary("");
      setFileAdded(false);
      setPrompted(false);
    }
  }
  const missingSummary = summary.trim().length === 0;

  const submit = () => {
    if (missingSummary || !fileAdded) {
      setPrompted(true);
      return;
    }
    onConfirm(summary.trim());
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPopup className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Upload revision</DialogTitle>
          <DialogDescription>
            {document.id} {nextVersion(document.version)} starts as a Draft from{" "}
            {document.version}. Its information, references and approval route
            are carried over. {document.version} stays Approved until the
            revision is approved.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel className="flex flex-col gap-4">
          <Field>
            <FormLabel>Replacement primary document</FormLabel>
            <button
              className={`flex w-full flex-col items-center gap-1 rounded-xl border border-dashed p-6 text-center ${
                prompted && !fileAdded
                  ? "border-destructive/56 bg-destructive/4"
                  : "hover:bg-secondary/48"
              }`}
              onClick={() => {
                setFileAdded(true);
                if (prompted) setPrompted(false);
              }}
              type="button"
            >
              <UploadIcon aria-hidden="true" className="size-5" />
              <span className="font-medium text-sm">
                {fileAdded
                  ? `${document.id}-${nextVersion(document.version)}.docx`
                  : "Upload a document"}
              </span>
              <span className="text-muted-foreground text-xs">
                PDF, DOCX or XLSX, up to 50 MB
              </span>
            </button>
            {prompted && !fileAdded && (
              <FieldDescription className="text-destructive">
                A replacement primary document is required.
              </FieldDescription>
            )}
          </Field>
          <Field>
            <FormLabel>Revision history</FormLabel>
            <Textarea
              aria-invalid={prompted && missingSummary}
              aria-label="Revision history"
              onChange={(event) => {
                setSummary(event.target.value);
                if (prompted) setPrompted(false);
              }}
              placeholder="Summarise what changed in this version"
              value={summary}
            />
            {prompted && missingSummary ? (
              <FieldDescription className="text-destructive">
                Enter a change summary for this revision.
              </FieldDescription>
            ) : (
              <FieldDescription>
                Required — saved with the new version. Plain text here; the
                rich-text editor US-015 asks for is not built.
              </FieldDescription>
            )}
          </Field>
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <Button onClick={submit}>Create revision draft</Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

function AuditDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const events = [
    ["Approved", "In Approval → Approved", "3 Nov 2026, 10:42 AM"],
    ["Review approved", "In Review → In Approval", "2 Nov 2026, 4:18 PM"],
    ["Submitted for review", "Draft → In Review", "2 Nov 2026, 9:05 AM"],
    ["Document created", "Created as Draft", "1 Nov 2026, 3:31 PM"],
  ];
  return (
    <Drawer onOpenChange={onOpenChange} open={open} position="right">
      <DrawerPopup position="right" showCloseButton>
        <DrawerHeader>
          <DrawerTitle>Audit Trail Record</DrawerTitle>
          <DrawerDescription>
            ACME-FRM-2026-000006 · Equipment Introduction Form
          </DrawerDescription>
        </DrawerHeader>
        <DrawerPanel className="pb-6">
          <ol className="relative flex flex-col gap-4 before:absolute before:inset-y-4 before:start-3.5 before:w-px before:bg-border">
            {events.map(([title, transition, time]) => (
              <li className="relative ps-11" key={title}>
                <span className="absolute start-0 top-3 z-1 flex size-7 items-center justify-center rounded-full border-4 border-popover bg-primary text-primary-foreground shadow-xs">
                  <CheckIcon aria-hidden="true" className="size-3" />
                </span>
                <article className="min-w-0 rounded-xl border bg-background p-4 shadow-xs">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-medium text-sm">{title}</p>
                    <Badge variant="success">Verified</Badge>
                  </div>
                  <p className="mt-2 text-sm">{transition}</p>
                  <p className="mt-2 text-muted-foreground text-xs">
                    Amit Kothari · {time} · GMT+7
                  </p>
                </article>
              </li>
            ))}
          </ol>
        </DrawerPanel>
        <DrawerFooter>
          <Button className="w-full">
            <DownloadIcon aria-hidden="true" />
            Export audit report
          </Button>
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  );
}

/**
 * `US-014` Edit Draft Document.
 *
 * The editor is the Draft's own record, not a sample of one: every field is
 * seeded from the opened document and written back on save. `view` still
 * carries "create" for the type's sake, but the create path is served by
 * `CreateDocumentScreen`, so this screen only ever renders a Draft.
 */
function EditorScreen({
  canEdit,
  candidates,
  departments,
  document,
  onBack,
  onPatch,
  onNotice,
  onSubmit,
  rejection,
}: {
  canEdit: boolean;
  candidates: ReferenceCandidate[];
  departments: string[];
  document: DocumentSummary;
  onBack: () => void;
  onNotice: (message: string) => void;
  onPatch: (patch: Partial<DocumentSummary>) => void;
  onSubmit: () => void;
  rejection?: DocumentRejection;
}) {
  const [name, setName] = useState(document.name);
  const [department, setDepartment] = useState(document.department);
  const [tags, setTags] = useState<string[]>(document.tags ?? []);
  const [tagDraft, setTagDraft] = useState("");
  const [attachments, setAttachments] = useState<DocumentAttachment[]>(
    document.attachments ?? [],
  );
  const [related, setRelated] = useState<DocumentReference[]>(
    document.related ?? [],
  );
  const [referred, setReferred] = useState<DocumentReference[]>(
    document.referred ?? [],
  );
  const [reviewers, setReviewers] = useState<string[]>(
    reviewersOf(document).map((item) => item.name),
  );
  const [approver, setApprover] = useState(document.approver ?? "Nina Patel");
  // US-014 AC-02: a Draft carries a primary file. The prototype stores no
  // bytes, so this records only whether one is present.
  const [primaryFile, setPrimaryFile] = useState(true);
  // US-009: the list comes from Settings > Organisation > Departments.
  const departmentOptions = departments.map((value) => ({
    label: value,
    value,
  }));
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const touched = <T,>(set: (value: T) => void) => {
    return (value: T) => {
      set(value);
      setDirty(true);
      setError(null);
    };
  };

  // US-014 AC-07: the browser's own leave-page prompt, which only appears
  // while there is something to lose.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const reviewerOptions = people.map((value) => ({ label: value, value }));

  /**
   * `US-014` AC-05: a save is refused and the form says what to correct.
   * `US-007` AC-02's rule that the Author, every Reviewer and the Approver are
   * different people still holds on an edit.
   */
  const validate = (forSubmission: boolean) => {
    if (!name.trim()) return "Enter a document name.";
    if (name.trim().length > 100)
      return "The document name cannot exceed 100 characters.";
    if (!primaryFile) return "A primary document is required.";
    if (reviewers.length === 0) return "Assign at least one Reviewer.";
    if (reviewers.includes(document.author))
      return "The Author cannot also be a Reviewer.";
    if (approver === document.author)
      return "The Approver must be someone other than the Author.";
    if (reviewers.includes(approver))
      return "The Approver cannot also be a Reviewer.";
    if (forSubmission && attachments.length > 5)
      return "A Draft can carry at most five attachments.";
    return null;
  };

  const collect = (): Partial<DocumentSummary> => ({
    approver,
    attachments,
    department: department as DocumentSummary["department"],
    name: name.trim(),
    related,
    referred,
    reviewers: reviewers.map((person) => ({
      decision: "Awaiting" as const,
      name: person,
    })),
    tags,
  });

  const save = () => {
    const problem = validate(false);
    if (problem) {
      setError(problem);
      return;
    }
    onPatch(collect());
    setDirty(false);
    onNotice(`${document.id} ${document.version} saved as Draft.`);
  };

  const submit = () => {
    const problem = validate(true);
    if (problem) {
      setError(problem);
      return;
    }
    onPatch(collect());
    setDirty(false);
    onSubmit();
  };

  const leave = () => {
    if (dirty) {
      setLeaveOpen(true);
      return;
    }
    onBack();
  };

  const addTag = () => {
    const value = tagDraft.trim();
    if (!value || tags.includes(value)) return;
    setTags([...tags, value]);
    setTagDraft("");
    setDirty(true);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button
            className="-ms-2 mb-2"
            onClick={leave}
            size="sm"
            variant="ghost"
          >
            <ArrowLeftIcon aria-hidden="true" />
            Back to Documents
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-bold text-2xl leading-tight">
              {canEdit ? "Edit Document" : "Document"} — {document.id}
            </h1>
            <Badge variant="secondary">Draft</Badge>
            <Badge variant="outline">{document.version}</Badge>
          </div>
          <p className="mt-1 text-muted-foreground text-sm">
            {canEdit
              ? "Complete the record and route it for technical review."
              : "You can view this Draft. Editing belongs to its Author."}
          </p>
        </div>
        {/* US-014 AC-03 and AC-06: the indicator is the save state, so it
            cannot read "Saved just now" over unsaved edits. */}
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <ClockIcon aria-hidden="true" className="size-4" />
          {dirty ? "Unsaved changes" : "All changes saved"}
        </div>
      </div>

      <WorkflowStepper
        document={document}
        reviewers={reviewersOf(document)}
        view="draft"
      />

      {/* US-012 AC-03 and US-011 AC-03: a Draft returned by a rejection shows
          the rejecting role, user, date and time, and the reason. */}
      {rejection && (
        <section
          aria-label="Rejection notice"
          className="flex items-start gap-3 rounded-xl border border-destructive/32 bg-destructive/8 p-4"
        >
          <AlertTriangleIcon
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-destructive"
          />
          <div className="min-w-0">
            <p className="font-medium text-sm">
              Returned to Draft after rejection
            </p>
            <p className="mt-1 text-muted-foreground text-xs">
              {rejection.role} · {rejection.user} · {rejection.at}
            </p>
            <p className="mt-2 text-sm">{rejection.reason}</p>
          </div>
        </section>
      )}

      {/* US-014 AC-01: a user who is neither the Author nor holds Read and
          Write All Records sees the Draft read-only. */}
      {!canEdit && (
        <div className="flex items-center gap-3 rounded-xl border bg-muted/40 px-4 py-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-background text-muted-foreground">
            <LockIcon aria-hidden="true" className="size-4" />
          </span>
          <div>
            <p className="font-medium text-sm">Read-only</p>
            <p className="text-muted-foreground text-xs">
              This Draft can be edited by {document.author} or by a user with
              Read and Write All Records permission.
            </p>
          </div>
        </div>
      )}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-5">
          <SectionCard>
            <SectionHeading
              hint="PDF, DOCX or XLSX, up to 50 MB."
              required
              title="Primary Document"
            />
            <div className="p-5">
              {primaryFile ? (
                <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-secondary/24 p-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-background">
                    <FileTextIcon aria-hidden="true" className="size-4" />
                  </span>
                  <div className="min-w-44 flex-1">
                    <p className="identifier truncate font-medium text-sm">
                      {document.id}-{document.version}.docx
                    </p>
                    <p className="text-muted-foreground text-xs">
                      3.1 MB · Ready
                    </p>
                  </div>
                  {canEdit && (
                    <Button
                      aria-label="Replace primary document"
                      onClick={() => touched(setPrimaryFile)(false)}
                      size="icon-sm"
                      variant="ghost"
                    >
                      <XIcon aria-hidden="true" />
                    </Button>
                  )}
                </div>
              ) : (
                <button
                  className="flex min-h-44 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-secondary/24 text-center hover:bg-secondary/48"
                  disabled={!canEdit}
                  onClick={() => touched(setPrimaryFile)(true)}
                  type="button"
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-background text-primary shadow-xs">
                    <UploadIcon aria-hidden="true" className="size-5" />
                  </span>
                  <span>
                    <span className="block font-medium text-sm">
                      Upload a document
                    </span>
                    <span className="mt-1 block text-muted-foreground text-xs">
                      Drag and drop or choose a file
                    </span>
                  </span>
                </button>
              )}
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeading
              action={
                canEdit && (
                  <Button
                    disabled={attachments.length >= 5}
                    onClick={() => {
                      setAttachments([
                        ...attachments,
                        {
                          description: "Added while editing the Draft",
                          fileName: `supporting-${attachments.length + 1}.pdf`,
                          name: `Supporting file ${attachments.length + 1}`,
                        },
                      ]);
                      setDirty(true);
                    }}
                    size="sm"
                    variant="outline"
                  >
                    <PaperclipIcon aria-hidden="true" />
                    Add attachment
                  </Button>
                )
              }
              hint="Supporting files, maximum 5. Attachments do not receive separate Document IDs."
              title="Attachments"
            />
            <div className="flex flex-col gap-3 p-5">
              {attachments.length === 0 ? (
                <p className="rounded-lg border border-dashed p-6 text-center text-muted-foreground text-sm">
                  No attachments added.
                </p>
              ) : (
                attachments.map((attachment, index) => (
                  <div
                    className="flex flex-wrap items-center gap-3 rounded-lg border bg-secondary/24 p-3"
                    key={attachment.fileName}
                  >
                    <span className="flex size-9 items-center justify-center rounded-lg bg-background">
                      <FileTextIcon aria-hidden="true" className="size-4" />
                    </span>
                    <div className="min-w-44 flex-1">
                      <p className="truncate font-medium text-sm">
                        {attachment.name}
                      </p>
                      <p className="truncate text-muted-foreground text-xs">
                        {attachment.fileName} · {attachment.description}
                      </p>
                    </div>
                    {canEdit && (
                      <Button
                        aria-label={`Remove ${attachment.name}`}
                        onClick={() => {
                          setAttachments(
                            attachments.filter((_, at) => at !== index),
                          );
                          setDirty(true);
                        }}
                        size="icon-sm"
                        variant="ghost"
                      >
                        <XIcon aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>

        <aside className="flex flex-col gap-5">
          <SectionCard>
            <SectionHeading title="Document Information" />
            <div className="flex flex-col gap-4 p-5">
              <Field>
                <FormLabel>Document name</FormLabel>
                <Input
                  disabled={!canEdit}
                  maxLength={100}
                  onChange={(event) => touched(setName)(event.target.value)}
                  placeholder="Enter a clear document name"
                  type="text"
                  value={name}
                />
                <FieldDescription>
                  Renaming never changes the Document ID, and every reference to
                  this document keeps pointing at it.
                </FieldDescription>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                {/* US-014 AC-02: Document Type is tied to the assigned
                    Document ID and cannot be changed. */}
                <Field>
                  <FormLabel>Type</FormLabel>
                  <Input
                    className={RECESSED_INPUT}
                    disabled
                    readOnly
                    type="text"
                    value={document.type}
                  />
                </Field>
                <Field>
                  <FormLabel>Department</FormLabel>
                  <Select
                    disabled={!canEdit}
                    items={departmentOptions}
                    onValueChange={(value) =>
                      touched(setDepartment)(String(value))
                    }
                    value={department}
                  >
                    <SelectTrigger aria-label="Department">
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
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FormLabel>Author</FormLabel>
                  <Input
                    className={RECESSED_INPUT}
                    disabled
                    readOnly
                    type="text"
                    value={document.author}
                  />
                </Field>
                <Field>
                  <FormLabel>Version</FormLabel>
                  <Input
                    className={RECESSED_INPUT}
                    disabled
                    readOnly
                    type="text"
                    value={document.version}
                  />
                </Field>
              </div>
              {/* Tags are a field of Document Information on the create form
                  and in the details view, so they are one here too. A card of
                  their own made the Draft the only screen where Tags were a
                  section. */}
              <Field>
                <FormLabel optional>Tags</FormLabel>
                {canEdit && (
                  <InputGroup>
                    <InputGroupInput
                      onChange={(event) => setTagDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="Add a keyword and press Enter"
                      type="text"
                      value={tagDraft}
                    />
                    <InputGroupAddon align="inline-end">
                      <Button
                        disabled={tagDraft.trim().length === 0}
                        onClick={addTag}
                        size="sm"
                        variant="ghost"
                      >
                        Add
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                )}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                        {canEdit && (
                          <button
                            aria-label={`Remove ${tag}`}
                            className="ms-1 cursor-pointer opacity-64 hover:opacity-100"
                            onClick={() => {
                              setTags(tags.filter((item) => item !== tag));
                              setDirty(true);
                            }}
                            type="button"
                          >
                            <XIcon aria-hidden="true" className="size-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                )}
                {!canEdit && tags.length === 0 && (
                  <FieldDescription>No tags.</FieldDescription>
                )}
              </Field>
              <p className="flex items-center gap-2 text-muted-foreground text-xs">
                <LockIcon aria-hidden="true" className="size-3.5" />
                Document ID, type, author, version and status are fixed on a
                Draft.
              </p>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeading
              hint="A Superseded document can be cited — it stays in use until its successor takes effect. An Obsolete one cannot, and neither can a document still In Approval."
              title="Reference Documents"
            />
            <div className="flex flex-col gap-5 p-5">
              <ReferencePicker
                canEdit={canEdit}
                candidates={candidates}
                excludeId={document.id}
                label="Related Documents"
                onChange={(next) => {
                  setRelated(next);
                  setDirty(true);
                }}
                selected={related}
              />
              <ReferencePicker
                canEdit={canEdit}
                candidates={candidates}
                excludeId={document.id}
                label="Referred Documents"
                onChange={(next) => {
                  setReferred(next);
                  setDirty(true);
                }}
                selected={referred}
              />
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeading title="Approval" />
            <div className="flex flex-col gap-4 p-5">
              <Field>
                <FormLabel>Reviewers</FormLabel>
                <Combobox
                  disabled={!canEdit}
                  items={reviewerOptions}
                  multiple
                  onValueChange={(value: { label: string; value: string }[]) =>
                    touched(setReviewers)(value.map((item) => item.value))
                  }
                  value={reviewerOptions.filter((option) =>
                    reviewers.includes(option.value),
                  )}
                >
                  <ComboboxChips
                    endAddon={
                      <ComboboxTrigger
                        aria-label="Show reviewers"
                        className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md opacity-80 outline-none transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <ChevronsUpDownIcon aria-hidden="true" />
                      </ComboboxTrigger>
                    }
                  >
                    <ComboboxValue>
                      {(value: { label: string; value: string }[]) => (
                        <>
                          {value.map((item) => (
                            <ComboboxChip
                              aria-label={item.label}
                              key={item.value}
                            >
                              {item.label}
                            </ComboboxChip>
                          ))}
                          <ComboboxChipsInput
                            aria-label="Reviewers"
                            placeholder={
                              value.length > 0 ? undefined : "Select reviewers…"
                            }
                          />
                        </>
                      )}
                    </ComboboxValue>
                  </ComboboxChips>
                  <ComboboxPopup>
                    <ComboboxEmpty>No people found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item: { label: string; value: string }) => (
                        <ComboboxItem key={item.value} value={item}>
                          {item.label}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxPopup>
                </Combobox>
              </Field>
              <Field>
                <FormLabel>Approver</FormLabel>
                <Select
                  disabled={!canEdit}
                  items={reviewerOptions}
                  onValueChange={(value) => touched(setApprover)(String(value))}
                  value={approver}
                >
                  <SelectTrigger aria-label="Approver">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    {reviewerOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
                <FieldDescription>
                  The Author, every Reviewer and the Approver must be different
                  people.
                </FieldDescription>
              </Field>
            </div>
          </SectionCard>
        </aside>
      </div>

      {canEdit && (
        <footer className="sticky bottom-2 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background p-3 shadow-lg/8">
          {/* US-014 AC-05: the form says what to correct, on the attempt. */}
          <p
            className={`text-sm ${error ? "font-medium text-destructive" : "text-muted-foreground"}`}
          >
            {error ?? "All required information is ready."}
          </p>
          {/* Divergence from `US-014` AC-01, which reads "no Cancel action is
              available for the Draft", settled by the user on 2026-11-11: a
              Draft editor with only Save and Submit gives a user who opened it
              by mistake no way out but the breadcrumb. Cancel is the same exit
              as Back to Documents and runs the same discard confirmation, so
              it can never lose work silently — which is what the rule was
              guarding against. See DECISIONS.md. */}
          <div className="flex items-center gap-2">
            <Button onClick={leave} variant="ghost">
              Cancel
            </Button>
            <Button onClick={save} variant="outline">
              <SaveIcon aria-hidden="true" />
              Save as draft
            </Button>
            <Button onClick={submit}>Submit for review</Button>
          </div>
        </footer>
      )}

      {/* US-014 AC-06: leaving with unsaved edits is confirmed, and staying
          keeps the unsaved values intact. */}
      <Dialog onOpenChange={setLeaveOpen} open={leaveOpen}>
        <DialogPopup className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Discard unsaved changes?</DialogTitle>
            <DialogDescription>
              {document.id} {document.version} has edits that have not been
              saved. Leaving now discards them; the saved Draft is unchanged.
              Cancel and Back to Documents both arrive here, so neither can lose
              work without asking.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>
              Continue editing
            </DialogClose>
            <Button
              onClick={() => {
                setLeaveOpen(false);
                setDirty(false);
                onBack();
              }}
              variant="destructive"
            >
              Discard and leave
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </div>
  );
}

const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const ZOOM_STEP = 25;

function DocumentPreview({
  document,
  zoom = 100,
}: {
  document?: DocumentSummary;
  zoom?: number;
}) {
  return (
    // Scaling from the top keeps the first line of the page where it was, and
    // the wrapper takes the scaled height so the container scrolls to the
    // whole document rather than clipping it.
    <div
      className="mx-auto max-w-3xl origin-top transition-transform"
      style={{
        transform: `scale(${zoom / 100})`,
        width: `${10000 / zoom}%`,
        maxWidth: `${(768 * 100) / zoom}px`,
      }}
    >
      <div className="mx-auto min-h-[720px] max-w-3xl bg-white p-10 text-zinc-950 shadow-sm sm:p-14">
        <div className="border-b pb-5 text-center">
          <p className="identifier text-xs">
            {document
              ? `${document.id} · ${document.version}`
              : "ACME-FRM-2026-000006 · v1.0"}
          </p>
          <h2 className="mt-4 font-bold text-2xl">
            {document?.name ?? "Equipment Introduction Form"}
          </h2>
        </div>
        <div className="mt-8 grid grid-cols-[160px_1fr] border border-zinc-300 text-sm">
          {[
            "Equipment name",
            "Model / catalogue",
            "Serial number",
            "Manufacturer",
            "Department",
            "Intended use",
          ].map((label) => (
            <div className="contents" key={label}>
              <div className="border-zinc-300 border-e border-b bg-zinc-100 p-3 font-medium">
                {label}
              </div>
              <div className="border-zinc-300 border-b p-3 text-zinc-500">
                Enter controlled information
              </div>
            </div>
          ))}
        </div>
        <h3 className="mt-10 font-semibold text-base">
          Section 2 · Qualification details
        </h3>
        <p className="mt-3 text-sm text-zinc-600 leading-6">
          Confirm that the equipment has been received, installed, and assessed
          against the approved specification. Record deviations through the
          linked quality workflow.
        </p>
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

/**
 * A reference points at another document, so it is identified the way the
 * register identifies one — the name over the Document ID and version — and
 * it opens that document, because that is what a link is for.
 *
 * Related and Referred are not two halves of one list: one says what supports
 * this document, the other what it cites. The group heading therefore carries
 * the same weight as a heading rather than sitting in muted 12px above its
 * own items, where it read as a caption on the first row.
 */
function ReferenceList({
  items,
  label,
  onOpen,
}: {
  items?: DocumentReference[];
  label: string;
  onOpen: (reference: DocumentReference) => void;
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 px-5 py-4">
      <p className="font-semibold text-sm">{label}</p>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={`${item.id}-${item.version}`}>
            <button
              className="flex w-full flex-col gap-0.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-secondary/40 focus-visible:bg-secondary/40 focus-visible:outline-none"
              onClick={() => onOpen(item)}
              type="button"
            >
              <span className="truncate font-medium text-[var(--accura-brand-900)] text-sm underline decoration-transparent underline-offset-2 transition-colors hover:decoration-current">
                {item.name}
              </span>
              <span className="identifier truncate text-muted-foreground text-xs">
                {item.id} · {item.version}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DetailScreen({
  document,
  documentTypes,
  onAudit,
  onBack,
  onDecision,
  onDownload,
  onNewVersion,
  onObsolete,
  onOpenReference,
  onPrint,
  reviewers,
  role,
  view,
}: {
  document: DocumentSummary;
  onAudit: () => void;
  onBack: () => void;
  onDecision: (action: Exclude<DecisionAction, null>) => void;
  onDownload: (kind: string) => void;
  onNewVersion: () => void;
  documentTypes: DocumentTypeSetting[];
  onObsolete: () => void;
  onOpenReference: (reference: DocumentReference) => void;
  onPrint: () => void;
  reviewers: DocumentReviewer[];
  role: ProtoRole;
  view: Exclude<DocumentFlowView, "create" | "draft">;
}) {
  const isApproved = view === "approved";
  const isExternal = document.category === "External";
  const isClosed = view === "superseded" || view === "obsolete";
  const review = periodicReview(document, documentTypes);
  // US-011 AC-02: Print is enabled only for Approved, Superseded, or Obsolete.
  const canPrint = isApproved || isClosed;
  // US-011 AC-07: an External Document carries no review or approval progress,
  // and AC-02 gives it no References section.
  const showWorkflow = !isExternal;
  // US-012 AC-01: Approve and Reject belong to an assigned Reviewer or a user
  // with Read and Write All Records; everyone else sees read-only details.
  const isOpenStage = !isApproved && !isClosed;
  const mayDecide = isOpenStage && canDecide(role, view);
  // US-015 AC-01 and US-016: starting a revision or marking a document
  // Obsolete belongs to its Author or a Read and Write All Records user.
  // US-016's exact permission is an open question in PRD-002.
  const mayManage = canManage(role);
  const awaiting = reviewers.filter((item) => item.decision === "Awaiting");
  // The preview sits in a 360px-narrower column than the document it shows,
  // so it needs its own zoom and a way out of the column entirely.
  const [zoom, setZoom] = useState(100);
  const [fullPreview, setFullPreview] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button
            className="-ms-2 mb-2"
            onClick={onBack}
            size="sm"
            variant="ghost"
          >
            <ArrowLeftIcon aria-hidden="true" />
            Back to Documents
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-bold text-2xl leading-tight">
              {document.name}
            </h1>
            <Badge
              className={statusLook(view).className}
              variant={statusLook(view).variant}
            >
              {statusForView(view)}
            </Badge>
            {/* US-011 AC-01: Category identifies Controlled or External
                separately from Document Type, so it is an outline metadata
                badge beside the filled status one. */}
            <Badge variant="outline">{document.category}</Badge>
          </div>
          <p className="identifier mt-1 text-muted-foreground text-xs">
            {document.id} · {document.version}
          </p>
        </div>
        {/* Six outline buttons in a row gave every action the same weight
            and wrapped onto two lines on a laptop. The audit trail is the one
            a QMS reader reaches for on any document in any status, so it
            stays named and visible; the rest — which come and go with status
            and permission — collapse into one menu. */}
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onAudit} size="sm" variant="outline">
            <ShieldCheckIcon aria-hidden="true" />
            View audit trail
          </Button>
          <Menu>
            <MenuTrigger
              render={<Button size="sm" variant="outline" />}
              aria-label="More actions"
            >
              <MoreIcon aria-hidden="true" />
              More actions
            </MenuTrigger>
            <MenuPopup align="end">
              {/* US-017 AC-01: Print only for Approved, Superseded or
                  Obsolete. A status-gated action is disabled rather than
                  hidden here, because the menu is also where a reader looks
                  to find out that printing exists. */}
              <MenuItem disabled={!canPrint} onClick={onPrint}>
                <PrinterIcon aria-hidden="true" />
                Print
              </MenuItem>
              {/* US-018 AC-01 and AC-02: the native original always, and the
                  official controlled PDF only while Approved. */}
              <MenuItem onClick={() => onDownload("Original")}>
                <DownloadIcon aria-hidden="true" />
                Download original
              </MenuItem>
              {isApproved && (
                <MenuItem onClick={() => onDownload("Controlled PDF")}>
                  <DownloadIcon aria-hidden="true" />
                  Download controlled PDF
                </MenuItem>
              )}
              {/* US-015 AC-01 and US-016 AC-01: only on an Approved document,
                  and only for its Author or a Read and Write All Records
                  user — so these are absent, not disabled. */}
              {isApproved && mayManage && (
                <>
                  <MenuSeparator />
                  <MenuItem onClick={onNewVersion}>
                    <RefreshIcon aria-hidden="true" />
                    {isExternal ? "Upload new version" : "Upload revision"}
                  </MenuItem>
                  <MenuItem onClick={onObsolete}>
                    <ArchiveIcon aria-hidden="true" />
                    Mark as obsolete
                  </MenuItem>
                </>
              )}
            </MenuPopup>
          </Menu>
        </div>
      </div>

      {/* Prototype chrome, not a mockup screen: authentication is not built,
          so US-012 AC-01's gate is demonstrated by choosing the viewer. */}
      {isOpenStage && (
        <div
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
            mayDecide
              ? "border-primary/20 bg-secondary/72"
              : "bg-muted/40 text-muted-foreground"
          }`}
        >
          <span
            className={`flex size-9 items-center justify-center rounded-full bg-background ${
              mayDecide ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {mayDecide ? (
              <UserIcon aria-hidden="true" className="size-4" />
            ) : (
              <LockIcon aria-hidden="true" className="size-4" />
            )}
          </span>
          <div>
            <p className="font-medium text-foreground text-sm">
              {mayDecide
                ? `Your ${view === "review" ? "technical review" : "approval"} is required`
                : "Read-only"}
            </p>
            <p className="text-muted-foreground text-xs">
              {mayDecide
                ? "Review the document and record a decision."
                : `You are not ${view === "review" ? "an assigned Reviewer for" : "the assigned Approver of"} this document, so no decision can be recorded.`}
            </p>
          </div>
        </div>
      )}

      {/* US-011 AC-08 asks only for status and saved information on a closed
          document. The stepper would mark Approved as the *current* stage,
          which a Superseded or Obsolete version is no longer at. */}
      {showWorkflow && !isClosed && (
        <WorkflowStepper
          document={document}
          reviewers={reviewers}
          view={view}
        />
      )}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* US-017 AC-02: Print prepares the document content, not the app
            around it. The preview is the print root; its own heading is
            chrome and is left off the page. */}
        <SectionCard data-print-root>
          <div data-print-hidden>
            <SectionHeading
              action={
                <div className="flex items-center gap-1">
                  <Button
                    aria-label="Zoom out"
                    disabled={zoom <= MIN_ZOOM}
                    onClick={() =>
                      setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP))
                    }
                    size="icon-sm"
                    variant="ghost"
                  >
                    <ZoomOutIcon aria-hidden="true" />
                  </Button>
                  {/* The percentage is the readout for the two controls, so
                      it sits between them and resets the zoom when pressed. */}
                  <Button
                    aria-label={`Zoom is ${zoom} percent. Reset to 100 percent`}
                    className="min-w-14 tabular-nums"
                    onClick={() => setZoom(100)}
                    size="sm"
                    variant="ghost"
                  >
                    {zoom}%
                  </Button>
                  <Button
                    aria-label="Zoom in"
                    disabled={zoom >= MAX_ZOOM}
                    onClick={() =>
                      setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP))
                    }
                    size="icon-sm"
                    variant="ghost"
                  >
                    <ZoomInIcon aria-hidden="true" />
                  </Button>
                  <Button
                    aria-label="Open the preview full screen"
                    onClick={() => setFullPreview(true)}
                    size="icon-sm"
                    variant="outline"
                  >
                    <ExpandIcon aria-hidden="true" />
                  </Button>
                </div>
              }
              description={`${document.category} document · Page 1 of 2`}
              title="Preview"
            />
          </div>
          <div
            className="max-h-[760px] overflow-auto bg-zinc-200 p-5"
            data-print-page
          >
            <DocumentPreview document={document} zoom={zoom} />
          </div>
        </SectionCard>

        <aside className="flex flex-col gap-5 xl:sticky xl:top-24">
          <SectionCard>
            <SectionHeading title="Document Information" />
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 p-5 text-sm">
              <DetailField label="Document ID" value={document.id} />
              <DetailField label="Status" value={statusForView(view)} />
              <DetailField label="Name" value={document.name} />
              <DetailField label="Version" value={document.version} />
              <DetailField label="Category" value={document.category} />
              <DetailField label="Document type" value={document.type} />
              <DetailField label="Department" value={document.department} />
              <DetailField label="Author" value={document.author} />
              {/* US-011 AC-02: "Not set" before approval, rather than a dash. */}
              <DetailField
                label="Effective date"
                value={document.effectiveDate ?? "Not set"}
              />
              <DetailField
                label="Next periodic review"
                value={
                  review.overdue ? (
                    <span className="flex flex-wrap items-center gap-1.5">
                      {review.label}
                      <Badge variant="warning">Overdue</Badge>
                    </span>
                  ) : (
                    review.label
                  )
                }
              />
            </dl>
            {document.tags && document.tags.length > 0 && (
              <div className="flex flex-col gap-2 border-t px-5 py-4">
                <p className="text-muted-foreground text-xs">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>

          {/* US-011 AC-02: attachments are listed and can be opened; viewing
              never changes or removes the saved file, so there is no remove
              control here — that belongs to the Draft editor. */}
          {document.attachments && document.attachments.length > 0 && (
            <SectionCard>
              {/* The attachment's own name is the link, so the row has one
                  target instead of a name and a button that do the same
                  thing — and the list reads as content, not as a toolbar. */}
              <SectionHeading title="Attachments" />
              <ul className="flex flex-col divide-y">
                {document.attachments.map((file) => (
                  <li key={file.fileName}>
                    <button
                      className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-secondary/40 focus-visible:bg-secondary/40 focus-visible:outline-none"
                      onClick={() => onDownload(`Attachment ${file.name}`)}
                      type="button"
                    >
                      <PaperclipIcon
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-[var(--accura-brand-900)]"
                      />
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate font-medium text-[var(--accura-brand-900)] text-sm underline decoration-transparent underline-offset-2 transition-colors group-hover:decoration-current">
                          {file.name}
                        </span>
                        <span className="truncate text-muted-foreground text-xs">
                          {file.description}
                        </span>
                        <span className="identifier truncate text-muted-foreground text-xs">
                          {file.fileName}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {/* US-011 AC-02: an External Document has no References section. */}
          {!isExternal &&
            ((document.related && document.related.length > 0) ||
              (document.referred && document.referred.length > 0)) && (
              <SectionCard>
                <SectionHeading
                  hint="Related documents support this one. Referred documents are cited by it."
                  title="Reference Documents"
                />
                <div className="flex flex-col divide-y">
                  <ReferenceList
                    items={document.related}
                    label="Related Documents"
                    onOpen={onOpenReference}
                  />
                  <ReferenceList
                    items={document.referred}
                    label="Referred Documents"
                    onOpen={onOpenReference}
                  />
                </div>
              </SectionCard>
            )}

          {/* US-015 AC-02: the change summary is saved with the version, so
              it belongs on that version's details. */}
          {document.revisionHistory && (
            <SectionCard>
              <SectionHeading title="Revision History" />
              <p className="whitespace-pre-line p-5 text-sm">
                {document.revisionHistory}
              </p>
            </SectionCard>
          )}

          {showWorkflow && (
            <SectionCard>
              <SectionHeading title="Approval" />
              {/* US-012 AC-02: the route is two stages with different jobs, so
                  the card groups by role rather than listing five people in a
                  flat column where the Approver is simply the last row. The
                  per-person role caption is then redundant and is dropped —
                  the group heading already says it. */}
              <div className="flex flex-col gap-5 p-5">
                <AssigneeGroup label="Reviewers">
                  {reviewers.map((reviewer) => (
                    <Assignee
                      decision={reviewer.decision}
                      initials={initialsOf(reviewer.name)}
                      key={reviewer.name}
                      label={reviewer.name}
                      roleLabel={
                        reviewer.by ? `Recorded by ${reviewer.by}` : undefined
                      }
                    />
                  ))}
                  {view === "review" && awaiting.length > 0 && (
                    <p className="text-muted-foreground text-xs">
                      {awaiting.length} of {reviewers.length} still to approve
                      before this document moves to In Approval.
                    </p>
                  )}
                </AssigneeGroup>
                <AssigneeGroup label="Approver">
                  <Assignee
                    decision={isApproved || isClosed ? "Approved" : "Awaiting"}
                    initials={initialsOf(document.approver ?? "Nina Patel")}
                    label={document.approver ?? "Nina Patel"}
                  />
                </AssigneeGroup>
              </div>
            </SectionCard>
          )}
        </aside>
      </div>

      {/* US-012 AC-01: a user without eligibility gets no action bar at all,
          rather than a disabled one that still implies the decision is
          theirs. */}
      {mayDecide && (
        <footer className="sticky bottom-2 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background p-3 shadow-lg/8">
          <p className="text-muted-foreground text-sm">
            {view === "review"
              ? awaiting.length > 0
                ? `Awaiting review by ${awaiting.map((item) => item.name).join(", ")}.`
                : "All assigned Reviewers have approved."
              : `Awaiting approval by ${document.approver ?? "Nina Patel"}.`}
          </p>
          <div className="flex items-center gap-2">
            <Button onClick={() => onDecision("reject")} variant="destructive">
              Reject
            </Button>
            <Button onClick={() => onDecision("approve")}>Approve</Button>
          </div>
        </footer>
      )}
      {/* The decision footer on In Review and In Approval is sticky, so the
          status strip on a closed or approved document is too. One element in
          one place, whatever the status — it was the only thing on the screen
          whose position depended on which document you had opened. */}
      {!mayDecide && (
        <footer className="sticky bottom-2 z-10 flex flex-wrap items-center gap-3 rounded-xl border bg-background px-4 py-3 text-sm shadow-lg/8">
          {isApproved ? (
            <>
              <CheckCircleIcon
                aria-hidden="true"
                className="size-5 text-primary"
              />
              <span>This document is approved and effective.</span>
            </>
          ) : isClosed ? (
            <>
              <ArchiveIcon
                aria-hidden="true"
                className="size-5 text-muted-foreground"
              />
              <span>
                {view === "superseded"
                  ? "This version has been superseded. It stays in use until its replacement takes effect."
                  : "This document is obsolete and is no longer available for active use or linking."}
              </span>
            </>
          ) : (
            <>
              <LockIcon
                aria-hidden="true"
                className="size-5 text-muted-foreground"
              />
              <span>
                No decision is yours to record on this document right now.
              </span>
            </>
          )}
        </footer>
      )}

      {/* Reading the document is the main job of this screen, and the preview
          column is 360px narrower than the page it shows. Full screen gives
          the document the whole width without the side panel beside it. */}
      <Dialog onOpenChange={setFullPreview} open={fullPreview}>
        <DialogPopup className="flex h-[92vh] max-h-none w-[96vw] max-w-[1400px] flex-col overflow-hidden p-0">
          <DialogHeader className="border-b px-5 py-4">
            <DialogTitle>{document.name}</DialogTitle>
            <DialogDescription className="identifier">
              {document.id} · {document.version} · {statusForView(view)}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-1 border-b bg-[var(--accura-zinc-50)] px-5 py-2">
            <Button
              aria-label="Zoom out"
              disabled={zoom <= MIN_ZOOM}
              onClick={() =>
                setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP))
              }
              size="icon-sm"
              variant="ghost"
            >
              <ZoomOutIcon aria-hidden="true" />
            </Button>
            <Button
              aria-label={`Zoom is ${zoom} percent. Reset to 100 percent`}
              className="min-w-14 tabular-nums"
              onClick={() => setZoom(100)}
              size="sm"
              variant="ghost"
            >
              {zoom}%
            </Button>
            <Button
              aria-label="Zoom in"
              disabled={zoom >= MAX_ZOOM}
              onClick={() =>
                setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP))
              }
              size="icon-sm"
              variant="ghost"
            >
              <ZoomInIcon aria-hidden="true" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto bg-zinc-200 p-6">
            <DocumentPreview document={document} zoom={zoom} />
          </div>
        </DialogPopup>
      </Dialog>
    </div>
  );
}

export function DocumentFlowScreen({
  candidates,
  departments,
  document,
  documentTypes,
  onApprove,
  onBack,
  onCreateRevision,
  onNotice,
  onOpenReference,
  onPatch,
  onViewChange,
  role,
  view,
}: DocumentFlowScreenProps) {
  const [decision, setDecision] = useState<DecisionAction>(null);
  const [auditOpen, setAuditOpen] = useState(false);
  const [rejection, setRejection] = useState<DocumentRejection | undefined>();
  const [approveOpen, setApproveOpen] = useState(false);
  const [obsoleteOpen, setObsoleteOpen] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);

  // One tally per document: opening a different row must not inherit the
  // decisions recorded against the last one.
  const [tally, setTally] = useState<{
    id: string;
    reviewers: DocumentReviewer[];
  }>(() => ({ id: document.id, reviewers: reviewersOf(document) }));
  if (tally.id !== document.id) {
    setTally({ id: document.id, reviewers: reviewersOf(document) });
    setRejection(undefined);
  }
  const reviewers =
    tally.id === document.id ? tally.reviewers : reviewersOf(document);

  const applyDecision = (
    action: Exclude<DecisionAction, null>,
    reason?: string,
  ) => {
    if (action === "submit") {
      // A new review cycle starts clean, and the rejection it answers is spent.
      setTally({ id: document.id, reviewers: reviewersOf(document) });
      setRejection(undefined);
      onPatch({ status: "In Review" });
      onViewChange("review");
    }
    if (action === "approve" && view === "review") {
      // US-012 AC-02: the document stays In Review until every assigned
      // Reviewer has approved; only the final one advances it.
      const next = recordApproval(reviewers, actingUser(role));
      setTally({ id: document.id, reviewers: next });
      if (next.every((item) => item.decision === "Approved")) {
        onViewChange("qa");
      }
    }
    if (action === "approve" && view === "qa") {
      // US-013 AC-02: approving sets the Effective Date to 10 days out, and
      // US-015 AC-04 supersedes the previous version at the same moment.
      const effectiveDate = effectiveDateFromApproval(new Date());
      onApprove(effectiveDate);
      onNotice(
        `${document.id} ${document.version} approved. Effective ${effectiveDate}.`,
      );
      onViewChange("approved");
    }
    if (action === "reject") {
      setRejection({
        at: formatDateTime(new Date()),
        reason: reason ?? "",
        role:
          role === "all-records"
            ? "Read and Write All Records"
            : view === "review"
              ? "Reviewer"
              : "Approver",
        user: actingUser(role),
      });
      onPatch({ status: "Draft" });
      onViewChange("draft");
    }
    setDecision(null);
  };

  // Submitting a Draft takes effect directly. A rejection opens a dialog
  // because PRD-002 requires a reason, and an approval opens one because it
  // is the decision the module exists to record — see ApproveDialog.
  const onDecision = (action: Exclude<DecisionAction, null>) => {
    if (action === "reject") setDecision("reject");
    else if (action === "approve") setApproveOpen(true);
    else applyDecision(action);
  };

  /** What the reader is about to cause, in the dialog, before they cause it. */
  const approvalConsequence = () => {
    if (view === "qa") {
      return `The document becomes Approved, and its Effective Date is set to ${effectiveDateFromApproval(new Date())}.`;
    }
    const remaining = reviewers.filter(
      (item) => item.decision === "Awaiting" && item.name !== actingUser(role),
    ).length;
    if (remaining === 0) {
      return "It is the last review outstanding, so the document moves to In Approval.";
    }
    return `${remaining} other ${remaining === 1 ? "Reviewer" : "Reviewers"} must still approve before the document moves to In Approval.`;
  };

  return (
    <>
      {view === "create" || view === "draft" ? (
        <EditorScreen
          canEdit={canManage(role)}
          candidates={candidates}
          departments={departments}
          document={document}
          // Every field is seeded from the document, so a different row must
          // start a fresh editor rather than keep the last one's unsaved edits.
          key={`${document.id}-${document.version}`}
          onBack={onBack}
          onNotice={onNotice}
          onPatch={onPatch}
          onSubmit={() => onDecision("submit")}
          rejection={rejection}
        />
      ) : (
        <DetailScreen
          document={document}
          documentTypes={documentTypes}
          onAudit={() => setAuditOpen(true)}
          onBack={onBack}
          onDecision={onDecision}
          onDownload={(kind) => {
            downloadPlaceholder(document, kind);
            onNotice(
              `${kind} requested for ${document.id} ${document.version}. The prototype stores no file, so a placeholder was downloaded.`,
            );
          }}
          onNewVersion={() => setRevisionOpen(true)}
          onObsolete={() => setObsoleteOpen(true)}
          onOpenReference={onOpenReference}
          onPrint={() => window.print()}
          reviewers={reviewers}
          role={role}
          view={view}
        />
      )}
      <ApproveDialog
        consequence={approvalConsequence()}
        document={document}
        onConfirm={() => {
          setApproveOpen(false);
          applyDecision("approve");
        }}
        onOpenChange={setApproveOpen}
        open={approveOpen}
        user={actingUser(role)}
      />
      <ObsoleteDialog
        document={document}
        onConfirm={() => {
          setObsoleteOpen(false);
          onPatch({ status: "Obsolete" });
          onNotice(`${document.id} ${document.version} marked as Obsolete.`);
          onViewChange("obsolete");
        }}
        onOpenChange={setObsoleteOpen}
        open={obsoleteOpen}
      />
      <RevisionDialog
        document={document}
        onConfirm={(summary) => {
          setRevisionOpen(false);
          const version = nextVersion(document.version);
          onCreateRevision({
            ...document,
            effectiveDate: null,
            revisionHistory: summary,
            // US-015 AC-03: the route is carried over, but the new version has
            // not been reviewed — every decision starts Pending again.
            reviewers: reviewersOf(document).map((item) => ({
              decision: "Awaiting" as const,
              name: item.name,
            })),
            status: "Draft",
            version,
          });
          onNotice(
            `${document.id} ${version} created as a Draft. ${document.version} stays Approved until the revision is approved.`,
          );
        }}
        onOpenChange={setRevisionOpen}
        open={revisionOpen}
      />
      <RejectDialog
        action={decision}
        onComplete={(reason) => applyDecision("reject", reason)}
        onOpenChange={(open) => {
          if (!open) setDecision(null);
        }}
      />
      <AuditDrawer onOpenChange={setAuditOpen} open={auditOpen} />
    </>
  );
}
