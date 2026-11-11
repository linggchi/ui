"use client";

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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@coss/ui/components/dialog";
import { Field, FieldDescription } from "@coss/ui/components/field";
import { Input } from "@coss/ui/components/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@coss/ui/components/input-group";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@coss/ui/components/segmented-control";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@coss/ui/components/select";
import {
  ArrowLeft as ArrowLeftIcon,
  ArrowSeparateVertical as ChevronsUpDownIcon,
  ShieldCheck as ControlledIcon,
  Globe as ExternalIcon,
  Page as FileTextIcon,
  Attachment as PaperclipIcon,
  Plus as PlusIcon,
  Upload as UploadIcon,
  WarningTriangle as WarningIcon,
  Xmark as XIcon,
} from "iconoir-react";
import { useState } from "react";
import {
  FormLabel,
  Hint,
  RECESSED_INPUT,
  SectionCard,
  SectionHeading,
} from "@/components/accura-form";
import { departments, people } from "@/components/document-directory";
import {
  type ReferenceCandidate,
  type ReferenceLink,
  ReferencePicker,
} from "@/components/reference-picker";

// US-007 AC-02: Document Type options come from Settings > Documents >
// Document Types. External Document (EXT) is excluded here because PRD-002
// fixes it to External Documents, which US-010 covers.
const controlledDocumentTypes = [
  "Batch Record (BR)",
  "Design Specification (DS)",
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

// US-007 AC-02: Department options come from Settings > Organisation >
// Departments. US-009 is not built, so these mirror the mockup's list.

// The signed-in user, per the prototype's session.
const AUTHOR = "Amit Kothari";

// Reviewers and the Approver may belong to any department (US-007 AC-02), so
// one roster serves both; the Author is excluded because they must be a
// different person.

const reviewerOptions = people.map((value) => ({ label: value, value }));

// US-007 AC-02 builds the Document ID from Settings > Organisation > Record
// Numbering. US-008 is not built, so these are the mockup's saved values and
// reproduce PRD-002's worked example, `ACME-BR-2026-000001`.
const recordNumbering = {
  includeYear: true,
  organisationPrefix: "ACME",
  separator: "-",
  sequenceLength: 6,
};

const MAX_PRIMARY_FILE_MB = 50;
const MAX_ATTACHMENTS = 5;

function abbreviationOf(documentType: string) {
  return documentType.match(/\(([^)]+)\)$/)?.[1] ?? "";
}

function nextDocumentId(documentType: string, sequence: number) {
  const { includeYear, organisationPrefix, separator, sequenceLength } =
    recordNumbering;
  return [
    organisationPrefix,
    abbreviationOf(documentType),
    ...(includeYear ? [String(new Date().getFullYear())] : []),
    String(sequence).padStart(sequenceLength, "0"),
  ].join(separator);
}

type UploadedFile = { name: string; sizeMb: number };

// US-010 AC-02 gives each attachment an optional Name and Description,
// 0–100 characters each.
type Attachment = UploadedFile & { description: string; title: string };

export type CreatedDocument = {
  approver: string;
  attachments: { description: string; fileName: string; name: string }[];
  department: string;
  documentId: string;
  effectiveDate: string | null;
  name: string;
  // Everything the form collected reaches the saved record. Until 2026-11-11
  // only six fields did, so tags, references and the approval route were
  // entered, validated — and then dropped on save.
  related: ReferenceLink[];
  referred: ReferenceLink[];
  reviewers: string[];
  status: "Approved" | "Draft" | "In Review";
  tags: string[];
  type: string;
};

const EXTERNAL_TYPE = "External Document (EXT)";

// US-010 AC-03 makes an External Document effective on its registration date.
function registrationDate() {
  return new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function CreateDocumentScreen({
  candidates,
  nextSequence,
  onBack,
  onSaved,
}: {
  /** Every document that could be linked, for `US-007` AC-02's references. */
  candidates: ReferenceCandidate[];
  nextSequence: number;
  onBack: () => void;
  onSaved: (created: CreatedDocument) => void;
}) {
  const [name, setName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [department, setDepartment] = useState("");
  const [tagDraft, setTagDraft] = useState("");
  const [related, setRelated] = useState<ReferenceLink[]>([]);
  const [referred, setReferred] = useState<ReferenceLink[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [primaryFile, setPrimaryFile] = useState<UploadedFile | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [reviewers, setReviewers] = useState<string[]>([]);
  const [approver, setApprover] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  // The mockup puts the record-type choice inside the create view as a
  // switchable control, not in a dialog before it.
  const [category, setCategory] = useState<"controlled" | "external">(
    "controlled",
  );
  const [pendingCategory, setPendingCategory] = useState<
    "controlled" | "external" | null
  >(null);

  const isDirty =
    name.trim() !== "" ||
    documentType !== "" ||
    department !== "" ||
    tags.length > 0 ||
    primaryFile !== null ||
    attachments.length > 0 ||
    related.length > 0 ||
    referred.length > 0 ||
    reviewers.length > 0 ||
    approver !== "";

  // The prototype has no file system, so "uploading" records a plausible
  // file of a valid format and size rather than reading one from disk.
  const attachPrimary = () =>
    setPrimaryFile(
      category === "external"
        ? { name: "external-document.pdf", sizeMb: 3.2 }
        : { name: "controlled-document-v1.0.docx", sizeMb: 2.4 },
    );

  const addAttachment = () =>
    setAttachments((current) =>
      current.length >= MAX_ATTACHMENTS
        ? current
        : [
            ...current,
            {
              description: "",
              name: `supporting-file-${current.length + 1}.pdf`,
              sizeMb: 1.1,
              title: "",
            },
          ],
    );

  const addTag = () => {
    const value = tagDraft.trim();
    if (!value || tags.includes(value)) return;
    setTags((current) => [...current, value]);
    setTagDraft("");
  };

  // US-007 AC-03: both Save as Draft and Submit for Review run the same
  // validation. A valid Primary File is required for either action.
  const validate = () => {
    if (!name.trim()) return "Enter a document name (maximum 100 characters).";
    if (category === "external") {
      if (!department) return "Select a department.";
      if (!primaryFile)
        return `Upload a PDF primary document of up to ${MAX_PRIMARY_FILE_MB} MB.`;
      if (!primaryFile.name.toLowerCase().endsWith(".pdf"))
        return "The primary document of an External Document must be a PDF.";
      return null;
    }
    if (!documentType) return "Select a document type.";
    if (!department) return "Select a department.";
    if (!primaryFile)
      return `Upload a primary document — PDF, DOCX, or XLSX up to ${MAX_PRIMARY_FILE_MB} MB.`;
    if (reviewers.length === 0) return "Assign at least one reviewer.";
    if (!approver) return "Select one approver.";
    if (reviewers.includes(AUTHOR))
      return "The Author cannot also be a Reviewer. Remove them from the reviewer list.";
    if (approver === AUTHOR)
      return "The Author cannot also be the Approver. Select a different person.";
    if (reviewers.includes(approver))
      return "The Approver cannot also be a Reviewer. Assign different people.";
    return null;
  };

  const save = (status: "Approved" | "Draft" | "In Review") => {
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    setError(null);
    const type = category === "external" ? EXTERNAL_TYPE : documentType;
    onSaved({
      approver,
      attachments: attachments.map((file) => ({
        description: file.description || "Supporting file",
        fileName: file.name,
        name: file.title || file.name,
      })),
      department,
      documentId: nextDocumentId(type, nextSequence),
      // US-010 AC-03: an External Document is effective from its registration
      // date. A controlled document has no effective date until it is approved.
      effectiveDate: status === "Approved" ? registrationDate() : null,
      name: name.trim(),
      related,
      referred,
      reviewers,
      status,
      tags,
      type,
    });
  };

  // Controlled-only fields do not carry over to an External Document, which
  // PRD-002 gives no References or Approval. Switching away from entered values
  // is a discard, so it is confirmed in the spirit of US-007 AC-04.
  const controlledOnlyEntered = reviewers.length > 0 || approver !== "";

  const requestCategory = (next: "controlled" | "external") => {
    if (next === category) return;
    if (next === "external" && controlledOnlyEntered) {
      setPendingCategory(next);
      return;
    }
    setCategory(next);
    setError(null);
  };

  const applyPendingCategory = () => {
    if (!pendingCategory) return;
    setReviewers([]);
    setApprover("");
    setCategory(pendingCategory);
    setPendingCategory(null);
    setError(null);
  };

  // US-007 AC-04: leaving with unsaved changes asks for confirmation first.
  // The AC also says there is no Cancel action; the footer has one anyway, by
  // the 2026-11-11 decision, and it routes here so it cannot lose work.
  const leave = () => (isDirty ? setConfirmDiscard(true) : onBack());

  const typeField = (
    <Field>
      <FormLabel>Document type</FormLabel>
      {category === "external" ? (
        <>
          <Input
            className={RECESSED_INPUT}
            disabled
            readOnly
            type="text"
            value={EXTERNAL_TYPE}
          />
          <FieldDescription>Fixed for external documents.</FieldDescription>
        </>
      ) : (
        <Select
          items={controlledDocumentTypes.map((value) => ({
            label: value,
            value,
          }))}
          onValueChange={(value) => setDocumentType(String(value))}
          value={documentType}
        >
          <SelectTrigger aria-label="Document Type">
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectPopup>
            {controlledDocumentTypes.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
      )}
    </Field>
  );

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5">
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
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-bold text-2xl leading-tight">Create Document</h1>
          {/* A persistent unsaved-changes indicator: US-007 AC-04 only
              confirms on leaving, which tells the user about unsaved work at
              the moment they are about to lose it. */}
          {isDirty && <Badge variant="warning">Unsaved changes</Badge>}
        </div>
        <p className="mt-1 text-muted-foreground text-sm">
          A unique Document ID will be assigned when this document is first
          saved.
        </p>
      </div>

      {error && (
        <div
          className="flex items-start gap-3 rounded-xl border border-destructive/32 bg-destructive/8 px-4 py-3 text-sm"
          role="alert"
        >
          <WarningIcon
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-destructive"
          />
          <span>{error}</span>
        </div>
      )}

      {/* The category is one choice between two, so it reads as a switch on
          the same line as its label rather than a pair of cards that take a
          whole band of the page. */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-5 py-3 shadow-xs">
        <div className="flex items-center gap-1.5">
          <h2 className="font-bold text-base leading-tight">
            Document Category
          </h2>
          <Hint label="Document Category">
            A Controlled Document goes through review and approval and is
            version-controlled. An External Document is issued outside the
            organisation and is registered as Approved straight away.
          </Hint>
        </div>
        {/* Accura override: COSS's `bg-muted` track is too close to the page
            canvas for the control to read as a control. The track takes
            Zinc 200, one step darker, so it separates from the surface while
            the white moving indicator still marks the chosen segment. */}
        <SegmentedControl
          aria-label="Document category"
          className="bg-[var(--accura-zinc-200)]"
          size="lg"
        >
          {(
            [
              {
                Icon: ControlledIcon,
                title: "Controlled",
                value: "controlled",
              },
              { Icon: ExternalIcon, title: "External", value: "external" },
            ] as const
          ).map(({ Icon, title, value }) => (
            <SegmentedControlItem
              className="data-checked:font-semibold data-checked:[&_svg]:opacity-100"
              data-checked={category === value ? "" : undefined}
              key={value}
              onClick={() => requestCategory(value)}
            >
              <Icon aria-hidden="true" />
              {title} Document
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
        <div className="flex flex-col gap-5">
          <SectionCard>
            <SectionHeading
              hint={
                category === "external"
                  ? "Required to register an External Document."
                  : "Required both to save a Draft and to submit for review."
              }
              required
              title="Primary Document"
            />
            <div className="p-5">
              {primaryFile ? (
                <figure className="overflow-hidden rounded-lg border">
                  {/* The preview carries its own chrome — file name, zoom and
                      remove — instead of a separate control row floating above
                      it, so every preview control belongs to the preview. */}
                  <figcaption className="flex items-center gap-2 border-b bg-[var(--accura-zinc-50)] px-3 py-2">
                    <FileTextIcon aria-hidden="true" className="size-4" />
                    <span className="min-w-0 flex-1 truncate font-medium text-sm">
                      {primaryFile.name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {primaryFile.sizeMb} MB
                    </span>
                    <span className="h-4 w-px bg-border" />
                    <span className="text-muted-foreground text-xs">100%</span>
                    <Button
                      aria-label="Remove primary document"
                      onClick={() => setPrimaryFile(null)}
                      size="icon-sm"
                      variant="ghost"
                    >
                      <XIcon aria-hidden="true" />
                    </Button>
                  </figcaption>
                  <div className="flex min-h-72 items-center justify-center bg-[var(--accura-canvas)] p-6">
                    <div className="w-full max-w-sm rounded-md bg-white p-6 shadow-xs">
                      <p className="identifier text-xs text-zinc-500">
                        Document ID assigned on save
                      </p>
                      <p className="mt-3 font-bold text-lg text-zinc-950">
                        {name.trim() || "Untitled document"}
                      </p>
                      <div className="mt-4 flex flex-col gap-2">
                        {[90, 76, 84, 60].map((width) => (
                          <span
                            className="h-2 rounded-full bg-zinc-200"
                            key={width}
                            style={{ width: `${width}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </figure>
              ) : (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center">
                  <UploadIcon aria-hidden="true" className="size-5" />
                  <p className="font-medium text-sm">
                    Upload a primary document
                  </p>
                  <Button onClick={attachPrimary} size="sm" variant="outline">
                    Choose file
                  </Button>
                  <p className="text-muted-foreground text-xs">
                    {category === "external"
                      ? "PDF only"
                      : "PDF, DOCX, or XLSX"}{" "}
                    · up to {MAX_PRIMARY_FILE_MB} MB.
                  </p>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeading
              action={
                <Button
                  disabled={attachments.length >= MAX_ATTACHMENTS}
                  onClick={addAttachment}
                  size="sm"
                  variant="outline"
                >
                  <PlusIcon aria-hidden="true" />
                  Add Attachment
                </Button>
              }
              hint={`Maximum ${MAX_ATTACHMENTS} files. Attachments do not receive separate Document IDs.`}
              title="Attachments"
            />
            <div className="p-5">
              {attachments.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {attachments.map((file, index) => (
                    <li
                      className="flex flex-col gap-3 rounded-lg border p-3"
                      key={file.name}
                    >
                      <div className="flex items-center gap-3">
                        <PaperclipIcon aria-hidden="true" className="size-4" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-sm">
                            {file.name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {file.sizeMb} MB
                          </p>
                        </div>
                        <Button
                          aria-label={`Remove ${file.name}`}
                          onClick={() =>
                            setAttachments((current) =>
                              current.filter(
                                (_, position) => position !== index,
                              ),
                            )
                          }
                          size="icon-sm"
                          variant="ghost"
                        >
                          <XIcon aria-hidden="true" />
                        </Button>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input
                          aria-label={`Name for ${file.name}`}
                          maxLength={100}
                          onChange={(event) =>
                            setAttachments((current) =>
                              current.map((item, position) =>
                                position === index
                                  ? { ...item, title: event.target.value }
                                  : item,
                              ),
                            )
                          }
                          placeholder="Name (Optional)"
                          type="text"
                          value={file.title}
                        />
                        <Input
                          aria-label={`Description for ${file.name}`}
                          maxLength={100}
                          onChange={(event) =>
                            setAttachments((current) =>
                              current.map((item, position) =>
                                position === index
                                  ? { ...item, description: event.target.value }
                                  : item,
                              ),
                            )
                          }
                          placeholder="Description (Optional)"
                          type="text"
                          value={file.description}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-lg border border-dashed p-6 text-center text-muted-foreground text-sm">
                  No attachments added.
                </p>
              )}
            </div>
          </SectionCard>
        </div>

        <div className="flex flex-col gap-5">
          <SectionCard>
            <SectionHeading title="Document Information" />
            <div className="flex flex-col gap-4 p-5">
              <Field>
                <FormLabel>Document name</FormLabel>
                <Input
                  maxLength={100}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter document name"
                  type="text"
                  value={name}
                />
                <FieldDescription>
                  {name.length}/100 characters.
                </FieldDescription>
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                {typeField}

                <Field>
                  <FormLabel>Department</FormLabel>
                  <Select
                    items={departments.map((value) => ({
                      label: value,
                      value,
                    }))}
                    onValueChange={(value) => setDepartment(String(value))}
                    value={department}
                  >
                    <SelectTrigger aria-label="Department">
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectPopup>
                      {departments.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectPopup>
                  </Select>
                </Field>
              </div>

              {category === "external" && (
                <Field>
                  <FormLabel>Author</FormLabel>
                  <Input
                    className={RECESSED_INPUT}
                    disabled
                    readOnly
                    type="text"
                    value={`${AUTHOR} (you)`}
                  />
                </Field>
              )}

              <Field>
                <FormLabel optional>Tags</FormLabel>
                {/* Tags are free text, not a list to pick from, so this
                    stays an input — but the Add control sits inside it rather
                    than beside it. InputGroupAddon keeps focus on the input
                    when the padding around the button is clicked. */}
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
                {tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                        <button
                          aria-label={`Remove tag ${tag}`}
                          className="ms-1 cursor-pointer"
                          onClick={() =>
                            setTags((current) =>
                              current.filter((value) => value !== tag),
                            )
                          }
                          type="button"
                        >
                          <XIcon aria-hidden="true" className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <FieldDescription>
                  Keywords for finding and identifying documents.
                </FieldDescription>
              </Field>
            </div>
          </SectionCard>

          {category === "controlled" && (
            <>
              <SectionCard>
                <SectionHeading
                  hint="A Superseded document can be cited — it stays in use until its successor takes effect. An Obsolete one cannot, and neither can a document still In Approval."
                  title="Reference Documents"
                />
                {/* US-007 AC-02: References are optional, and until
                    2026-11-11 these were two search boxes that did nothing. */}
                <div className="flex flex-col gap-5 p-5">
                  <ReferencePicker
                    canEdit
                    candidates={candidates}
                    label="Related Documents"
                    onChange={setRelated}
                    selected={related}
                  />
                  <ReferencePicker
                    canEdit
                    candidates={candidates}
                    label="Referred Documents"
                    onChange={setReferred}
                    selected={referred}
                  />
                </div>
              </SectionCard>

              <SectionCard>
                <SectionHeading
                  hint="The Author, every Reviewer and the Approver must be different people. Any of them may belong to any department."
                  title="Approval"
                />
                <div className="flex flex-col gap-4 p-5">
                  <Field>
                    <FormLabel>Author</FormLabel>
                    <Input
                      className={RECESSED_INPUT}
                      disabled
                      readOnly
                      type="text"
                      value={`${AUTHOR} (you)`}
                    />
                  </Field>

                  <Field>
                    <FormLabel>Reviewers</FormLabel>
                    {/* The settled multi-select: chips inside the input with a
                        trailing chevron, as the role form's Departments field
                        uses. See settings-screens.tsx and the catalogue's
                        Selection Controls entry. */}
                    <Combobox
                      items={reviewerOptions}
                      multiple
                      onValueChange={(
                        value: { label: string; value: string }[],
                      ) => setReviewers(value.map((item) => item.value))}
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
                                  value.length > 0
                                    ? undefined
                                    : "Select reviewers…"
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
                      items={people.map((value) => ({ label: value, value }))}
                      onValueChange={(value) => setApprover(String(value))}
                      value={approver}
                    >
                      <SelectTrigger aria-label="Approver">
                        <SelectValue placeholder="Select one approver" />
                      </SelectTrigger>
                      <SelectPopup>
                        {people.map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectPopup>
                    </Select>
                  </Field>
                </div>
              </SectionCard>
            </>
          )}
        </div>
      </div>

      <footer className="sticky bottom-2 z-10 flex items-center justify-between gap-4 rounded-xl border bg-background p-3 shadow-lg/8">
        {category === "external" ? (
          <>
            <p className="min-w-0 flex-1 truncate text-muted-foreground text-sm">
              Registering saves the document as Approved, effective today, with
              v1.0 assigned.
            </p>
            {/* Cancel is the same exit as Back to Documents and runs the
                same discard confirmation, so it cannot lose work. Settled on
                2026-11-11 for the Draft editor; the create form keeps the
                same shape. See DECISIONS.md. */}
            <div className="flex shrink-0 items-center gap-2">
              <Button onClick={leave} variant="ghost">
                Cancel
              </Button>
              <Button onClick={() => save("Approved")}>
                Acknowledge &amp; Register
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="min-w-0 flex-1 truncate text-muted-foreground text-sm">
              The Document ID and version v1.0 are assigned on first save.
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <Button onClick={leave} variant="ghost">
                Cancel
              </Button>
              <Button onClick={() => save("Draft")} variant="outline">
                Save as Draft
              </Button>
              <Button onClick={() => save("In Review")}>
                Submit for Review
              </Button>
            </div>
          </>
        )}
      </footer>

      <Dialog
        onOpenChange={(open) => {
          if (!open) setPendingCategory(null);
        }}
        open={pendingCategory !== null}
      >
        <DialogPopup className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Switch to an External Document?</DialogTitle>
            <DialogDescription>
              An External Document has no Reviewers or Approver, so the approval
              assignments you have entered will be removed. The document name,
              department, tags and files are kept.
            </DialogDescription>
          </DialogHeader>
          <DialogPanel />
          <DialogFooter>
            <Button onClick={() => setPendingCategory(null)} variant="ghost">
              Keep Controlled Document
            </Button>
            <Button onClick={applyPendingCategory}>Switch</Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>

      <Dialog onOpenChange={setConfirmDiscard} open={confirmDiscard}>
        <DialogPopup className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Discard unsaved changes?</DialogTitle>
            <DialogDescription>
              This document has not been saved. Leave this page and discard what
              you have entered?
            </DialogDescription>
          </DialogHeader>
          <DialogPanel />
          <DialogFooter>
            <Button onClick={() => setConfirmDiscard(false)} variant="ghost">
              Stay and continue editing
            </Button>
            <Button onClick={onBack} variant="destructive">
              Discard changes
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </div>
  );
}
