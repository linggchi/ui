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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@coss/ui/components/empty";
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
  MenuTrigger,
} from "@coss/ui/components/menu";
import { Radio, RadioGroup } from "@coss/ui/components/radio-group";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@coss/ui/components/select";
import { Switch } from "@coss/ui/components/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@coss/ui/components/table";
import { Textarea } from "@coss/ui/components/textarea";
import { toastManager } from "@coss/ui/components/toast";
import {
  Building as BuildingIcon,
  ArrowSeparateVertical as ChevronsUpDownIcon,
  ClipboardCheck as ClipboardCheckIcon,
  MultiplePages as FilesIcon,
  GraduationCap as GraduationCapIcon,
  Mail as MailIcon,
  MoreHoriz as MoreHorizontalIcon,
  EditPencil as PencilIcon,
  Plus as PlusIcon,
  RefreshDouble as RefreshCwIcon,
  Search as SearchIcon,
  WarningTriangle as TriangleAlertIcon,
  User as UserIcon,
  Tools as WrenchIcon,
} from "iconoir-react";
import { useMemo, useState } from "react";
import { AccuraInformationPanel } from "./accura-information-panel";
import { Tabs, TabsList, TabsPanel, TabsTab } from "./accura-tabs";
import {
  FormLabel,
  RECESSED_INPUT,
  SectionCard,
  SectionHeading,
  SectionToolbar,
} from "@/components/accura-form";
import {
  DEFAULT_REVIEW_YEARS,
  type DepartmentSetting,
  type DocumentTypeSetting,
  formatDocumentId,
  type NumberingSetting,
} from "@/components/organisation-settings";

type SettingsSection =
  | "asset-management"
  | "capa"
  | "change-control"
  | "deviations"
  | "documents"
  | "organization"
  | "training"
  | "users";

type AccessLevel = "read" | "write" | "write_all";

type Role = {
  access: Record<string, AccessLevel>;
  description: string;
  modules: string[];
  name: string;
  origin: "System";
};

type UserStatus = "Active" | "Inactive" | "Invitation pending";

type EditableUser = {
  departments: string[];
  email: string;
  id: string;
  name: string;
  role: string;
  status: UserStatus;
};

type UserFormState = {
  departments: string[];
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

type NavItem = {
  icon: typeof BuildingIcon;
  id: SettingsSection;
  label: string;
};

// Grouped because the eight sections are not peers: the first two configure
// the organisation itself, the rest configure one module each.
const navGroups: { items: NavItem[]; label: string }[] = [
  {
    items: [
      { icon: BuildingIcon, id: "organization", label: "Organization" },
      { icon: UserIcon, id: "users", label: "Users" },
    ],
    label: "Organisation",
  },
  {
    items: [
      { icon: FilesIcon, id: "documents", label: "Documents" },
      { icon: GraduationCapIcon, id: "training", label: "Training" },
      { icon: ClipboardCheckIcon, id: "capa", label: "CAPA" },
      { icon: RefreshCwIcon, id: "change-control", label: "Change Control" },
      { icon: TriangleAlertIcon, id: "deviations", label: "Deviations" },
      {
        icon: WrenchIcon,
        id: "asset-management",
        label: "Asset Management",
      },
    ],
    label: "Modules",
  },
];

const sectionIntro: Record<SettingsSection, string> = {
  "asset-management":
    "Asset categories, calibration intervals, and maintenance defaults.",
  capa: "CAPA classifications, due-date rules, and effectiveness checks.",
  "change-control":
    "Change categories, impact assessment, and approval routing.",
  deviations: "Deviation categories, severity levels, and escalation rules.",
  documents: "Document types, numbering, and review defaults.",
  organization:
    "Record numbering and the departments records can be assigned to.",
  training: "Curricula, assignment rules, and training record retention.",
  users: "Who can sign in to Accura and what each built-in role allows.",
};

// One vocabulary for module names across the whole app: the Settings nav, the
// role module badges, and the role filter all read the same.
const modules = [
  "Documents",
  "Training",
  "CAPA",
  "Change Control",
  "Deviations",
  "Asset Management",
  "Settings",
  "Knowledge Hub",
];

// Settings and Knowledge Hub are administrative surfaces, so the two
// non-admin built-in roles do not cover them.
const userModules = modules.filter(
  (module) => !["Knowledge Hub", "Settings"].includes(module),
);

// US-005 AC-03 wording. The PRD governs this copy, not the mockup.
const accessLevels: {
  detail: string;
  label: string;
  value: AccessLevel;
}[] = [
  {
    detail: "View approved or completed records.",
    label: "Read only",
    value: "read",
  },
  {
    detail:
      "Create new records; view, edit, review, or approve existing records only when owned or assigned to the user.",
    label: "Read and write",
    value: "write",
  },
  {
    detail:
      "Create new records; view, edit, review, or approve all existing records regardless of ownership or assignment.",
    label: "Read and write all records",
    value: "write_all",
  },
];

const _accessLabels: Record<AccessLevel, string> = Object.fromEntries(
  accessLevels.map((level) => [level.value, level.label]),
) as Record<AccessLevel, string>;

// PRD-001: built-in roles only. Nothing in this screen creates or edits them.
const roles: Role[] = [
  {
    access: Object.fromEntries(
      modules.map((module) => [module, "write_all" as AccessLevel]),
    ),
    // Descriptions carry only what the Modules column cannot: the access
    // semantics. Spelling the module list out here duplicated the badges.
    description: "Read and write access to all records.",
    modules: [...modules],
    name: "Admin",
    origin: "System",
  },
  {
    access: Object.fromEntries(
      userModules.map((module) => [module, "write" as AccessLevel]),
    ),
    description: "Read and write access to their own or assigned records.",
    modules: [...userModules],
    name: "Normal User",
    origin: "System",
  },
  {
    access: Object.fromEntries(
      userModules.map((module) => [module, "read" as AccessLevel]),
    ),
    description: "View approved or completed records.",
    modules: [...userModules],
    name: "Read-only User",
    origin: "System",
  },
];

const initialUsers: EditableUser[] = [
  {
    departments: [],
    email: "sarah.johnson@example.com",
    id: "u-1",
    name: "Sarah Johnson",
    role: "Read-only User",
    status: "Active",
  },
  {
    departments: [],
    email: "james.obrien@example.com",
    id: "u-2",
    name: "James O’Brien",
    role: "Normal User",
    status: "Active",
  },
  {
    departments: [],
    email: "amit.kothari@example.com",
    id: "u-3",
    name: "Amit Kothari",
    role: "Admin",
    status: "Active",
  },
  // Seeded so every status and the departments column are visible on load.
  {
    departments: ["Manufacturing", "Quality Assurance"],
    email: "priya.menon@example.com",
    id: "u-4",
    name: "Priya Menon",
    role: "Normal User",
    status: "Invitation pending",
  },
  {
    departments: ["Engineering"],
    email: "daniel.ferreira@example.com",
    id: "u-5",
    name: "Daniel Ferreira",
    role: "Read-only User",
    status: "Inactive",
  },
];

// The twelve built-in document types enumerated by US-007 AC-01 and shown in the
// mockup's Settings > Documents list. The mockup's Documents type filter offers
// exactly these twelve and no others, so sample documents must use them. AC-03
// lets an administrator add more at runtime; none are seeded.
// The abbreviation drives Document ID generation (e.g. SOP-001).
const separatorOptions = [
  { label: "Hyphen  ACME-BR-2026-000001", value: "-" },
  { label: "Slash  ACME/BR/2026/000001", value: "/" },
  { label: "Dot  ACME.BR.2026.000001", value: "." },
];

const sequenceOptions = [3, 4, 5, 6, 8].map((length) => ({
  label: `${length} digits`,
  value: String(length),
}));

const moduleFilterOptions = [
  { label: "All modules", value: "all" },
  ...modules.map((module) => ({ label: module, value: module })),
];

// A controlled list, not free text: typing departments by hand produced
// variants such as "Quality" and "Quality Assurance" for the same team.
const departmentOptions = [
  "Engineering",
  "Manufacturing",
  "Quality Assurance",
  "Quality Control",
].map((name) => ({ label: name, value: name }));

const statusBadgeVariant: Record<
  UserStatus,
  "secondary" | "success" | "warning"
> = {
  Active: "success",
  Inactive: "secondary",
  "Invitation pending": "warning",
};

const emptyForm: UserFormState = {
  departments: [],
  email: "",
  firstName: "",
  lastName: "",
  role: "",
};

// US-002 AC-01 captures First name and Last name, while the Users list and the
// rest of the prototype show one display name. Split on the last space so a
// multi-word given name stays in First name.
function splitUserName(name: string) {
  const trimmed = name.trim();
  const cut = trimmed.lastIndexOf(" ");
  return cut === -1
    ? { firstName: trimmed, lastName: "" }
    : { firstName: trimmed.slice(0, cut), lastName: trimmed.slice(cut + 1) };
}

function countLabel(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getUserInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function UserIdentity({ user }: { user: EditableUser }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar
        aria-hidden="true"
        className="shrink-0 [--avatar-size:--spacing(8)]"
      >
        <AvatarFallback className="bg-[var(--accura-brand-150-lightshade)] text-[var(--accura-brand-950-darkshade)]">
          {getUserInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        {/* No status badge here: the Status column now carries it, and
            user-identity.md only asks for it beside the name when the row has
            nowhere else to show it. */}
        <p className="truncate font-medium">{user.name}</p>
        <p
          className="truncate text-muted-foreground text-xs"
          title={user.email}
        >
          {user.email}
        </p>
      </div>
    </div>
  );
}

function NotSpecified({ section }: { section: NavItem }) {
  const Icon = section.icon;
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{section.label} settings are not specified yet</EmptyTitle>
        <EmptyDescription>
          {sectionIntro[section.id]} No PRD or user story covers this section,
          so nothing is built here yet.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function RoleDetailsDialog({
  onOpenChange,
  role,
}: {
  onOpenChange: (open: boolean) => void;
  role: Role | null;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={role !== null}>
      <DialogPopup className="sm:max-w-3xl">
        {role && (
          <>
            <DialogHeader>
              <DialogTitle>{role.name}</DialogTitle>
              <DialogDescription>
                View the access granted by this built-in role. Role editing is
                not available.
              </DialogDescription>
            </DialogHeader>
            <DialogPanel className="flex flex-col gap-5">
              <Field>
                <FormLabel>Role name</FormLabel>
                <Input
                  className={RECESSED_INPUT}
                  defaultValue={role.name}
                  disabled
                  key={`${role.name}-name`}
                  readOnly
                  type="text"
                />
              </Field>

              <Field>
                <FormLabel optional>Description</FormLabel>
                <Textarea
                  className="min-h-20 has-disabled:bg-[var(--accura-canvas)] has-disabled:opacity-100 has-disabled:*:text-muted-foreground"
                  defaultValue={role.description}
                  disabled
                  key={`${role.name}-description`}
                  readOnly
                />
              </Field>

              <div className="flex flex-col gap-2">
                <p className="font-medium text-base/4.5 sm:text-sm/4">
                  Module access
                </p>
                <p className="-mt-1 text-muted-foreground text-sm">
                  A switched-on module is included in this role. Switched-off
                  modules grant no access.
                </p>

                {/* Every module is listed, not only the covered ones: the
                    switch is what says whether the role reaches that module,
                    and an absent row would leave "no access" indistinguishable
                    from "module does not exist". The access level appears only
                    once the switch is on, because it has no meaning
                    otherwise. */}
                <div className="overflow-hidden rounded-xl border">
                  {modules.map((module) => {
                    const level = role.modules.includes(module)
                      ? role.access[module]
                      : null;
                    const covered = level !== null;
                    return (
                      <div className="border-b last:border-b-0" key={module}>
                        <div className="flex items-center justify-between gap-4 px-4 py-3">
                          <span className="font-medium text-sm">{module}</span>
                          <Switch checked={covered} disabled />
                        </div>

                        {covered && (
                          <div className="border-t bg-secondary/40 px-4 py-3">
                            <RadioGroup
                              aria-label={`Access level for ${module}`}
                              className="grid grid-cols-3 gap-4"
                              disabled
                              value={level}
                            >
                              {accessLevels.map((accessLevel) => (
                                <label
                                  className="flex items-center gap-2.5"
                                  key={accessLevel.value}
                                >
                                  <Radio disabled value={accessLevel.value} />
                                  <span
                                    className={
                                      level === accessLevel.value
                                        ? "font-medium text-sm"
                                        : "text-muted-foreground text-sm"
                                    }
                                  >
                                    {accessLevel.label}
                                  </span>
                                </label>
                              ))}
                            </RadioGroup>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-1 pt-1">
                  {accessLevels.map((level) => (
                    <p
                      className="text-muted-foreground text-xs leading-snug"
                      key={level.value}
                    >
                      <span className="font-medium text-foreground">
                        {level.label}
                      </span>{" "}
                      – {level.detail}
                    </p>
                  ))}
                </div>
              </div>
            </DialogPanel>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Close
              </DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogPopup>
    </Dialog>
  );
}

function UserFormDialog({
  editing,
  error,
  form,
  onOpenChange,
  onSubmit,
  open,
  setForm,
}: {
  editing: boolean;
  error: string | null;
  form: UserFormState;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  open: boolean;
  setForm: (next: UserFormState) => void;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPopup className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit user" : "Add user"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update user details, departments, and role."
              : "Add a user and assign their role."}
          </DialogDescription>
        </DialogHeader>
        <DialogPanel className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Field className="flex-1">
              <FormLabel>First name</FormLabel>
              <Input
                onChange={(event) =>
                  setForm({ ...form, firstName: event.target.value })
                }
                placeholder="Enter first name"
                type="text"
                value={form.firstName}
              />
            </Field>

            <Field className="flex-1">
              <FormLabel>Last name</FormLabel>
              <Input
                onChange={(event) =>
                  setForm({ ...form, lastName: event.target.value })
                }
                placeholder="Enter last name"
                type="text"
                value={form.lastName}
              />
            </Field>
          </div>

          <Field>
            <FormLabel>Email address</FormLabel>
            <Input
              // Input puts className on its wrapper span, which styles the
              // disabled state with has-disabled:, not disabled:. COSS only
              // dims it (opacity-64), so it reads as an empty enabled field;
              // Zinc 100 is the app's recessed plane, and full opacity keeps
              // the border crisp.
              className={RECESSED_INPUT}
              disabled={editing}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              placeholder="name@company.com"
              readOnly={editing}
              type="email"
              value={form.email}
            />
          </Field>

          <Field>
            <FormLabel optional>Departments</FormLabel>
            <Combobox
              items={departmentOptions}
              multiple
              onValueChange={(value: { label: string; value: string }[]) =>
                setForm({
                  ...form,
                  departments: value.map((item) => item.value),
                })
              }
              value={departmentOptions.filter((option) =>
                form.departments.includes(option.value),
              )}
            >
              <ComboboxChips
                endAddon={
                  <ComboboxTrigger
                    aria-label="Show departments"
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
                        <ComboboxChip aria-label={item.label} key={item.value}>
                          {item.label}
                        </ComboboxChip>
                      ))}
                      <ComboboxChipsInput
                        aria-label="Departments"
                        placeholder={
                          value.length > 0 ? undefined : "Select departments…"
                        }
                      />
                    </>
                  )}
                </ComboboxValue>
              </ComboboxChips>
              <ComboboxPopup>
                <ComboboxEmpty>No departments found.</ComboboxEmpty>
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

          <div className="flex flex-col gap-2">
            <p className="font-medium text-base/4.5 sm:text-sm/4">
              Role
              <span aria-hidden="true" className="ms-0.5 text-destructive">
                *
              </span>
            </p>
            <RadioGroup
              aria-label="Role"
              className="flex flex-col gap-2"
              onValueChange={(value: unknown) =>
                setForm({ ...form, role: String(value) })
              }
              value={form.role}
            >
              {roles.map((role) => (
                <label
                  className="flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors hover:bg-secondary/72 has-[[data-checked]]:border-primary/32 has-[[data-checked]]:bg-secondary"
                  key={role.name}
                >
                  <Radio value={role.name} />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="font-medium text-sm">{role.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {role.modules.join(", ")}
                    </span>
                  </span>
                </label>
              ))}
            </RadioGroup>
          </div>

          {error && (
            <p
              className="rounded-lg border border-destructive/32 bg-destructive/8 px-3 py-2.5 text-destructive text-sm"
              role="alert"
            >
              {error}
            </p>
          )}

          {!editing && (
            <AccuraInformationPanel icon={MailIcon} title="Invitation Email">
              After you send the invitation, the user receives a secure link to
              set up a password and then sign in.
            </AccuraInformationPanel>
          )}
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <Button onClick={onSubmit}>
            {editing ? "Save changes" : "Add user"}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

export function SettingsScreen({
  departments,
  documentTypes,
  numbering,
  onDepartmentsChange,
  onDocumentTypesChange,
  onNumberingChange,
}: {
  departments: DepartmentSetting[];
  documentTypes: DocumentTypeSetting[];
  numbering: NumberingSetting;
  onDepartmentsChange: (next: DepartmentSetting[]) => void;
  onDocumentTypesChange: (next: DocumentTypeSetting[]) => void;
  onNumberingChange: (next: NumberingSetting) => void;
}) {
  const [section, setSection] = useState<SettingsSection>("users");
  const [usersTab, setUsersTab] = useState<"roles" | "users">("users");
  const [organizationTab, setOrganizationTab] = useState<
    "departments" | "numbering"
  >("numbering");
  const [users, setUsers] = useState<EditableUser[]>(initialUsers);
  const [userQuery, setUserQuery] = useState("");
  const [roleQuery, setRoleQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [typeQuery, setTypeQuery] = useState("");
  // US-007 AC-03 to AC-06: one dialog for Add and Edit.
  const [typeFormOpen, setTypeFormOpen] = useState(false);
  const [typeEditing, setTypeEditing] = useState<string | null>(null);
  const [typeForm, setTypeForm] = useState({
    abbreviation: "",
    description: "",
    frequencyYears: String(DEFAULT_REVIEW_YEARS),
    name: "",
  });
  const [typeError, setTypeError] = useState<string | null>(null);

  // US-008: edited as a draft, so Save is a real action and Cancel is simply
  // navigating away without pressing it.
  const [numberingDraft, setNumberingDraft] =
    useState<NumberingSetting>(numbering);
  const [numberingError, setNumberingError] = useState<string | null>(null);

  // US-009 AC-02 to AC-05.
  const [departmentFormOpen, setDepartmentFormOpen] = useState(false);
  const [departmentEditing, setDepartmentEditing] = useState<string | null>(
    null,
  );
  const [departmentForm, setDepartmentForm] = useState({
    description: "",
    name: "",
  });
  const [departmentError, setDepartmentError] = useState<string | null>(null);

  const numberingDirty =
    numberingDraft.prefix !== numbering.prefix ||
    numberingDraft.separator !== numbering.separator ||
    numberingDraft.sequenceLength !== numbering.sequenceLength ||
    numberingDraft.includeYear !== numbering.includeYear;

  const saveNumbering = () => {
    const prefix = numberingDraft.prefix.trim();
    // AC-03: the prefix is required.
    if (!prefix) {
      setNumberingError("Enter an organisation prefix.");
      return;
    }
    onNumberingChange({ ...numberingDraft, prefix });
    setNumberingError(null);
    toastManager.add({
      title: "Record numbering saved.",
      type: "success",
    });
  };

  const openDepartmentForm = (department?: DepartmentSetting) => {
    setDepartmentEditing(department?.name ?? null);
    setDepartmentForm({
      description: department?.description ?? "",
      name: department?.name ?? "",
    });
    setDepartmentError(null);
    setDepartmentFormOpen(true);
  };

  const submitDepartmentForm = () => {
    const name = departmentForm.name.trim();
    if (!name) {
      setDepartmentError("Enter a department name.");
      return;
    }
    // AC-03: names differing only in case are the same name.
    const clash = departments.some(
      (department) =>
        department.name.toLowerCase() === name.toLowerCase() &&
        department.name !== departmentEditing,
    );
    if (clash) {
      setDepartmentError(
        "This department name already exists. Enter a different name.",
      );
      return;
    }
    const saved: DepartmentSetting = {
      description: departmentForm.description.trim(),
      name,
    };
    onDepartmentsChange(
      departmentEditing
        ? departments.map((department) =>
            department.name === departmentEditing ? saved : department,
          )
        : [...departments, saved],
    );
    setDepartmentFormOpen(false);
    setDepartmentError(null);
    toastManager.add({
      title: departmentEditing ? `Saved changes to ${name}.` : `${name} added.`,
      type: "success",
    });
  };

  const openTypeForm = (type?: DocumentTypeSetting) => {
    setTypeEditing(type?.abbreviation ?? null);
    setTypeForm({
      abbreviation: type?.abbreviation ?? "",
      description: type?.description ?? "",
      frequencyYears: String(type?.frequencyYears ?? DEFAULT_REVIEW_YEARS),
      name: type?.name ?? "",
    });
    setTypeError(null);
    setTypeFormOpen(true);
  };

  const submitTypeForm = () => {
    const name = typeForm.name.trim();
    // AC-04: abbreviations are compared case-insensitively and saved upper.
    const abbreviation = typeForm.abbreviation.trim().toUpperCase();
    const years = Number(typeForm.frequencyYears);

    if (!name) return setTypeError("Enter a name for this document type.");
    if (name.length > 100)
      return setTypeError("The name cannot exceed 100 characters.");
    if (!abbreviation) return setTypeError("Enter an abbreviation.");
    if (abbreviation.length > 10)
      return setTypeError("The abbreviation cannot exceed 10 characters.");
    if (typeForm.description.trim().length > 250)
      return setTypeError("The description cannot exceed 250 characters.");
    if (!Number.isInteger(years) || years < 1)
      return setTypeError(
        "Periodic Review Frequency must be a whole number of years, 1 or more.",
      );
    const clash = documentTypes.some(
      (type) =>
        type.abbreviation === abbreviation && type.abbreviation !== typeEditing,
    );
    if (clash)
      return setTypeError(
        `The abbreviation ${abbreviation} is already used by another document type.`,
      );

    const saved: DocumentTypeSetting = {
      abbreviation,
      description: typeForm.description.trim(),
      frequencyYears: years,
      name,
    };
    onDocumentTypesChange(
      typeEditing
        ? documentTypes.map((type) =>
            type.abbreviation === typeEditing ? saved : type,
          )
        : [...documentTypes, saved],
    );
    setTypeFormOpen(false);
    setTypeError(null);
    toastManager.add({
      title: typeEditing
        ? `Saved changes to ${name}.`
        : `${name} (${abbreviation}) added.`,
      type: "success",
    });
  };
  const [viewingRole, setViewingRole] = useState<Role | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const activeItem = navGroups
    .flatMap((group) => group.items)
    .find((item) => item.id === section) as NavItem;

  const visibleUsers = useMemo(() => {
    const query = userQuery.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) =>
      `${user.name} ${user.email}`.toLowerCase().includes(query),
    );
  }, [userQuery, users]);

  const visibleRoles = useMemo(() => {
    const query = roleQuery.trim().toLowerCase();
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(query) &&
        (moduleFilter === "all" || role.modules.includes(moduleFilter)),
    );
  }, [moduleFilter, roleQuery]);

  const visibleTypes = useMemo(() => {
    const query = typeQuery.trim().toLowerCase();
    if (!query) return documentTypes;
    return documentTypes.filter((type) =>
      `${type.name} ${type.abbreviation} ${type.description}`
        .toLowerCase()
        .includes(query),
    );
  }, [documentTypes, typeQuery]);

  const assignedCount = (roleName: string) =>
    users.filter((user) => user.role === roleName).length;

  const openInvite = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (user: EditableUser) => {
    setEditingId(user.id);
    setForm({
      departments: [...user.departments],
      email: user.email,
      ...splitUserName(user.name),
      role: user.role,
    });
    setFormError(null);
    setFormOpen(true);
  };

  const submitForm = () => {
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const name = `${firstName} ${lastName}`.trim();
    const email = form.email.trim();

    if (!firstName) {
      setFormError("Enter the user’s first name to continue.");
      return;
    }
    if (!lastName) {
      setFormError("Enter the user’s last name to continue.");
      return;
    }
    // US-004 AC-01: the email address is read-only when editing, so format and
    // uniqueness are validated on add only.
    if (!editingId) {
      if (!isValidEmail(email)) {
        setFormError("Enter a valid email address to continue.");
        return;
      }
      const duplicate = users.some(
        (user) => user.email.toLowerCase() === email.toLowerCase(),
      );
      if (duplicate) {
        setFormError(
          "Another user in this organisation already uses this email.",
        );
        return;
      }
    }
    if (!form.role) {
      setFormError("Select a role to continue.");
      return;
    }
    // US-004 AC-06: the organisation must keep at least one Admin.
    if (editingId && form.role !== "Admin") {
      const otherAdmins = users.some(
        (user) => user.id !== editingId && user.role === "Admin",
      );
      const wasAdmin =
        users.find((user) => user.id === editingId)?.role === "Admin";
      if (wasAdmin && !otherAdmins) {
        setFormError(
          "This organisation must have at least one user with the Admin role.",
        );
        return;
      }
    }

    const departments = [...form.departments];

    if (editingId) {
      setUsers((current) =>
        current.map((user) =>
          user.id === editingId
            ? { ...user, departments, email, name, role: form.role }
            : user,
        ),
      );
      toastManager.add({
        title: `Saved changes to ${name}.`,
        type: "success",
      });
    } else {
      setUsers((current) => [
        ...current,
        {
          departments,
          email,
          id: `u-${current.length + 1}-${Date.now()}`,
          name,
          role: form.role,
          status: "Invitation pending",
        },
      ]);
      toastManager.add({
        title: `Invitation sent to ${email}.`,
        type: "success",
      });
    }

    setFormOpen(false);
    setFormError(null);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-2xl leading-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Configure your organisation and each quality module.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:items-start lg:gap-7 xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-8">
        <nav
          aria-label="Settings sections"
          className="flex flex-col gap-5 lg:sticky lg:top-20"
        >
          {navGroups.map((group) => (
            <div className="flex flex-col gap-1" key={group.label}>
              <p className="px-2.5 pb-1 font-medium text-muted-foreground text-xs">
                {group.label}
              </p>
              {group.items.map(({ icon: Icon, id, label }) => {
                const active = id === section;
                return (
                  <button
                    aria-current={active ? "page" : undefined}
                    className={`flex h-9 w-full items-center gap-2.5 rounded-lg border px-2.5 text-left text-sm outline-none transition-[background-color,border-color,box-shadow,color] focus-visible:ring-2 focus-visible:ring-ring ${
                      active
                        ? "border-border bg-card font-medium text-foreground shadow-xs"
                        : "border-transparent text-muted-foreground hover:bg-secondary/72 hover:text-foreground"
                    }`}
                    key={id}
                    onClick={() => setSection(id)}
                    type="button"
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="flex min-w-0 flex-col gap-4">
          {section === "users" && (
            <SectionCard>
              <SectionHeading title="Users" />

              <Tabs
                onValueChange={(value) =>
                  setUsersTab(value as "roles" | "users")
                }
                value={usersTab}
              >
                <TabsList aria-label="User settings">
                  <TabsTab value="users">Users</TabsTab>
                  <TabsTab value="roles">Roles &amp; Permissions</TabsTab>
                </TabsList>

                <TabsPanel value="users">
                  {/* The panel has a filter row, so the action joins it and
                      no description band is added. A panel without filters
                      puts the action beside its description instead. */}
                  <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                    <InputGroup className="max-w-sm">
                      <InputGroupAddon>
                        <SearchIcon aria-hidden="true" />
                      </InputGroupAddon>
                      <InputGroupInput
                        aria-label="Search users by name or email"
                        onChange={(event) => setUserQuery(event.target.value)}
                        placeholder="Search by name or email…"
                        type="search"
                        value={userQuery}
                      />
                    </InputGroup>
                    <span className="text-muted-foreground text-sm">
                      {countLabel(visibleUsers.length, "user")}
                    </span>
                    <Button className="ms-auto" onClick={openInvite}>
                      <PlusIcon aria-hidden="true" />
                      Add user
                    </Button>
                  </div>

                  <div className="border-t">
                    <Table>
                      <TableHeader className="bg-secondary/72">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="min-w-[240px] ps-5 text-xs">
                            User
                          </TableHead>
                          <TableHead className="w-[170px] text-xs">
                            Status
                          </TableHead>
                          <TableHead className="min-w-[200px] text-xs">
                            Role
                          </TableHead>
                          <TableHead className="w-[200px] text-xs">
                            Departments
                          </TableHead>
                          <TableHead className="w-14 pe-5 text-right text-xs">
                            <span className="sr-only">Actions</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visibleUsers.length > 0 ? (
                          visibleUsers.map((user) => (
                            <TableRow
                              className="hover:bg-secondary/48"
                              key={user.id}
                            >
                              <TableCell className="max-w-[360px] ps-5">
                                <UserIdentity user={user} />
                              </TableCell>
                              <TableCell>
                                <Badge
                                  size="lg"
                                  variant={statusBadgeVariant[user.status]}
                                >
                                  {user.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge size="lg" variant="outline">
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-[220px] text-sm">
                                {/* Truncated rather than wrapped: a second
                                    line here made rows 60px against 53px. The
                                    full list stays available on hover. */}
                                <span
                                  className="block truncate"
                                  title={
                                    user.departments.join(", ") || undefined
                                  }
                                >
                                  {user.departments.length > 0
                                    ? user.departments.join(", ")
                                    : "—"}
                                </span>
                              </TableCell>
                              <TableCell className="pe-5 text-right">
                                <Menu>
                                  <MenuTrigger
                                    render={
                                      <Button
                                        aria-label={`More actions for ${user.name}`}
                                        size="icon-sm"
                                        variant="ghost"
                                      />
                                    }
                                  >
                                    <MoreHorizontalIcon aria-hidden="true" />
                                  </MenuTrigger>
                                  <MenuPopup align="end">
                                    <MenuItem onClick={() => openEdit(user)}>
                                      <PencilIcon aria-hidden="true" />
                                      Edit user
                                    </MenuItem>
                                  </MenuPopup>
                                </Menu>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5}>
                              <Empty>
                                <EmptyHeader>
                                  <EmptyMedia variant="icon">
                                    <UserIcon aria-hidden="true" />
                                  </EmptyMedia>
                                  <EmptyTitle>
                                    No users match your search.
                                  </EmptyTitle>
                                  <EmptyDescription>
                                    Clear the search to see everyone in this
                                    organisation.
                                  </EmptyDescription>
                                </EmptyHeader>
                              </Empty>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsPanel>

                <TabsPanel value="roles">
                  <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                    <InputGroup className="max-w-sm">
                      <InputGroupAddon>
                        <SearchIcon aria-hidden="true" />
                      </InputGroupAddon>
                      <InputGroupInput
                        aria-label="Search roles"
                        onChange={(event) => setRoleQuery(event.target.value)}
                        placeholder="Search roles…"
                        type="search"
                        value={roleQuery}
                      />
                    </InputGroup>
                    <Select
                      items={moduleFilterOptions}
                      onValueChange={(value) => setModuleFilter(String(value))}
                      value={moduleFilter}
                    >
                      <SelectTrigger
                        aria-label="Filter roles by module"
                        className="w-52"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectPopup>
                        {moduleFilterOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectPopup>
                    </Select>
                    <span className="text-muted-foreground text-sm">
                      {countLabel(visibleRoles.length, "role")}
                    </span>
                  </div>

                  <div className="border-t">
                    <Table>
                      <TableHeader className="bg-secondary/72">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-[150px] ps-5 text-xs">
                            Role
                          </TableHead>
                          <TableHead className="w-[30%] text-xs">
                            Description
                          </TableHead>
                          <TableHead className="w-[120px] text-xs">
                            Users assigned
                          </TableHead>
                          <TableHead className="w-[120px] pe-5 text-xs">
                            Action
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visibleRoles.length > 0 ? (
                          visibleRoles.map((role) => (
                            <TableRow
                              className="hover:bg-secondary/48"
                              key={role.name}
                            >
                              <TableCell className="ps-5 align-top font-medium">
                                {role.name}
                              </TableCell>
                              <TableCell className="whitespace-normal align-top text-muted-foreground text-sm leading-snug">
                                {role.description || "—"}
                              </TableCell>
                              <TableCell className="align-top">
                                <span className="identifier text-sm">
                                  {assignedCount(role.name)}
                                </span>
                              </TableCell>
                              <TableCell className="pe-5 align-top">
                                <button
                                  className="text-primary text-sm outline-none hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
                                  onClick={() => setViewingRole(role)}
                                  type="button"
                                >
                                  View details
                                </button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4}>
                              <Empty>
                                <EmptyHeader>
                                  <EmptyMedia variant="icon">
                                    <SearchIcon aria-hidden="true" />
                                  </EmptyMedia>
                                  <EmptyTitle>
                                    No roles match your search.
                                  </EmptyTitle>
                                  <EmptyDescription>
                                    Try another name or choose All modules.
                                  </EmptyDescription>
                                </EmptyHeader>
                              </Empty>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsPanel>
              </Tabs>
            </SectionCard>
          )}

          {section === "documents" && (
            <SectionCard>
              <SectionHeading title="Document Types" />

              <div className="flex flex-col">
                <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <InputGroup className="max-w-sm">
                    <InputGroupAddon>
                      <SearchIcon aria-hidden="true" />
                    </InputGroupAddon>
                    <InputGroupInput
                      aria-label="Search document types"
                      onChange={(event) => setTypeQuery(event.target.value)}
                      placeholder="Search document types…"
                      type="search"
                      value={typeQuery}
                    />
                  </InputGroup>
                  <span className="text-muted-foreground text-sm">
                    {countLabel(visibleTypes.length, "document type")}
                  </span>
                  <Button className="ms-auto" onClick={() => openTypeForm()}>
                    <PlusIcon aria-hidden="true" />
                    Add type
                  </Button>
                </div>

                <div className="border-t">
                  <Table>
                    <TableHeader className="bg-secondary/72">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[32%] ps-5 text-xs">
                          Name
                        </TableHead>
                        <TableHead className="w-[130px] text-xs">
                          Abbreviation
                        </TableHead>
                        <TableHead className="text-xs">Description</TableHead>
                        {/* US-007 AC-01: the configured review frequency, and
                            the default of 3 years where a type sets none. */}
                        <TableHead className="w-[150px] text-xs">
                          Review frequency
                        </TableHead>
                        <TableHead className="w-12 pe-5 text-right text-xs">
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleTypes.length > 0 ? (
                        visibleTypes.map((type) => (
                          <TableRow
                            className="hover:bg-secondary/48"
                            key={type.abbreviation}
                          >
                            <TableCell className="whitespace-normal ps-5 align-top font-medium">
                              {type.name}
                            </TableCell>
                            <TableCell className="align-top">
                              <Badge size="lg" variant="outline">
                                {type.abbreviation}
                              </Badge>
                            </TableCell>
                            <TableCell className="whitespace-normal align-top text-muted-foreground text-sm leading-snug">
                              {type.description || "—"}
                            </TableCell>
                            <TableCell className="align-top text-sm tabular-nums">
                              {type.frequencyYears}{" "}
                              {type.frequencyYears === 1 ? "year" : "years"}
                            </TableCell>
                            <TableCell className="pe-5 text-right align-top">
                              <Menu>
                                <MenuTrigger
                                  render={
                                    <Button
                                      aria-label={`More actions for ${type.name}`}
                                      size="icon-sm"
                                      variant="ghost"
                                    />
                                  }
                                >
                                  <MoreHorizontalIcon aria-hidden="true" />
                                </MenuTrigger>
                                <MenuPopup align="end">
                                  <MenuItem onClick={() => openTypeForm(type)}>
                                    <PencilIcon aria-hidden="true" />
                                    Edit type
                                  </MenuItem>
                                </MenuPopup>
                              </Menu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5}>
                            <Empty>
                              <EmptyHeader>
                                <EmptyMedia variant="icon">
                                  <SearchIcon aria-hidden="true" />
                                </EmptyMedia>
                                <EmptyTitle>
                                  No document types match your search.
                                </EmptyTitle>
                                <EmptyDescription>
                                  Try another name or abbreviation.
                                </EmptyDescription>
                              </EmptyHeader>
                            </Empty>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </SectionCard>
          )}

          {/* US-008 and US-009 both live at Settings > Organisation. Until
              2026-11-11 this section said "No PRD or user story covers this
              section" — true when it was written, and false from the moment
              the 2026-11-10 sync added the two stories. The two concerns are
              segmented the same way Users segments Users / Roles, rather than
              stacked as two cards: one surface, one heading, one tab strip. */}
          {section === "organization" && (
            <SectionCard>
              <SectionHeading title="Organization" />

              <Tabs
                onValueChange={(value) =>
                  setOrganizationTab(value as "departments" | "numbering")
                }
                value={organizationTab}
              >
                <TabsList aria-label="Organisation settings">
                  <TabsTab value="numbering">Record Numbering</TabsTab>
                  <TabsTab value="departments">Departments</TabsTab>
                </TabsList>

                <TabsPanel value="numbering">
                  <div className="flex flex-col gap-4 p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FormLabel>Organisation prefix</FormLabel>
                        <Input
                          aria-invalid={numberingError !== null}
                          maxLength={10}
                          onChange={(event) => {
                            setNumberingDraft({
                              ...numberingDraft,
                              prefix: event.target.value.toUpperCase(),
                            });
                            setNumberingError(null);
                          }}
                          placeholder="ACME"
                          type="text"
                          value={numberingDraft.prefix}
                        />
                        {numberingError && (
                          <FieldDescription className="text-destructive">
                            {numberingError}
                          </FieldDescription>
                        )}
                      </Field>
                      <Field>
                        <FormLabel>Separator</FormLabel>
                        <Select
                          items={separatorOptions}
                          onValueChange={(value) =>
                            setNumberingDraft({
                              ...numberingDraft,
                              separator: String(
                                value,
                              ) as NumberingSetting["separator"],
                            })
                          }
                          value={numberingDraft.separator}
                        >
                          <SelectTrigger aria-label="Separator">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectPopup>
                            {separatorOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectPopup>
                        </Select>
                      </Field>
                      <Field>
                        <FormLabel>Sequence length</FormLabel>
                        <Select
                          items={sequenceOptions}
                          onValueChange={(value) =>
                            setNumberingDraft({
                              ...numberingDraft,
                              sequenceLength: Number(value),
                            })
                          }
                          value={String(numberingDraft.sequenceLength)}
                        >
                          <SelectTrigger aria-label="Sequence length">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectPopup>
                            {sequenceOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectPopup>
                        </Select>
                      </Field>
                      <Field>
                        <FormLabel optional>Include year</FormLabel>
                        <div className="flex h-8.5 items-center gap-2">
                          <Switch
                            checked={numberingDraft.includeYear}
                            id="include-year"
                            onCheckedChange={(checked) =>
                              setNumberingDraft({
                                ...numberingDraft,
                                includeYear: checked,
                              })
                            }
                          />
                          <label className="text-sm" htmlFor="include-year">
                            Add the current year to every ID
                          </label>
                        </div>
                      </Field>
                    </div>

                    {/* US-008 AC-02: the preview is generated the same way a
                        real ID is, so it cannot drift from what modules make. */}
                    <div className="rounded-xl border bg-[var(--accura-zinc-50)] p-4">
                      <p className="text-muted-foreground text-xs">
                        Document ID preview
                      </p>
                      <p className="identifier mt-1 font-medium text-lg">
                        {formatDocumentId(numberingDraft, "BR", 1)}
                      </p>
                      <p className="mt-2 text-muted-foreground text-xs">
                        Prefix · Document Type abbreviation
                        {numberingDraft.includeYear ? " · year" : ""} ·
                        sequence, zero-padded to {numberingDraft.sequenceLength}{" "}
                        digits.
                      </p>
                    </div>
                  </div>
                  {/* Disabled until something in this section changes, so the
                      control states whether there is anything to save. */}
                  <div className="flex justify-end border-t px-5 py-4">
                    <Button disabled={!numberingDirty} onClick={saveNumbering}>
                      Save
                    </Button>
                  </div>
                </TabsPanel>

                <TabsPanel value="departments">
                  <SectionToolbar
                    action={
                      <Button onClick={() => openDepartmentForm()}>
                        <PlusIcon aria-hidden="true" />
                        Add department
                      </Button>
                    }
                    description="Departments a document, user or record can be assigned to."
                  />
                  <Table>
                    <TableHeader className="bg-secondary/72">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[32%] ps-5 text-xs">
                          Name
                        </TableHead>
                        <TableHead className="text-xs">Description</TableHead>
                        <TableHead className="w-12 pe-5 text-right text-xs">
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departments.map((department) => (
                        <TableRow
                          className="hover:bg-secondary/48"
                          key={department.name}
                        >
                          <TableCell className="ps-5 font-medium">
                            {department.name}
                          </TableCell>
                          {/* US-009 AC-01: a blank description is an em dash. */}
                          <TableCell className="whitespace-normal text-muted-foreground text-sm leading-snug">
                            {department.description || "—"}
                          </TableCell>
                          <TableCell className="pe-5 text-right">
                            <Menu>
                              <MenuTrigger
                                render={
                                  <Button
                                    aria-label={`More actions for ${department.name}`}
                                    size="icon-sm"
                                    variant="ghost"
                                  />
                                }
                              >
                                <MoreHorizontalIcon aria-hidden="true" />
                              </MenuTrigger>
                              <MenuPopup align="end">
                                <MenuItem
                                  onClick={() => openDepartmentForm(department)}
                                >
                                  <PencilIcon aria-hidden="true" />
                                  Edit department
                                </MenuItem>
                              </MenuPopup>
                            </Menu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsPanel>
              </Tabs>
            </SectionCard>
          )}

          {section !== "users" &&
            section !== "documents" &&
            section !== "organization" && (
              <SectionCard>
                {/* Title only, like every other card in Settings. The intro
                    sentence is not lost: NotSpecified prints it directly
                    below, so the heading band was repeating it verbatim. */}
                <SectionHeading title={activeItem.label} />
                <NotSpecified section={activeItem} />
              </SectionCard>
            )}
        </div>
      </div>

      <RoleDetailsDialog
        onOpenChange={(open) => {
          if (!open) setViewingRole(null);
        }}
        role={viewingRole}
      />

      {/* US-007 AC-03 to AC-06 */}
      <Dialog onOpenChange={setTypeFormOpen} open={typeFormOpen}>
        <DialogPopup className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {typeEditing ? "Edit document type" : "Add document type"}
            </DialogTitle>
            <DialogDescription>
              The abbreviation appears in every Document ID of this type and
              must be unique.
            </DialogDescription>
          </DialogHeader>
          <DialogPanel className="flex flex-col gap-4">
            <Field>
              <FormLabel>Name</FormLabel>
              <Input
                maxLength={100}
                onChange={(event) =>
                  setTypeForm({ ...typeForm, name: event.target.value })
                }
                placeholder="Standard Operating Procedure"
                type="text"
                value={typeForm.name}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FormLabel>Abbreviation</FormLabel>
                <Input
                  maxLength={10}
                  onChange={(event) =>
                    setTypeForm({
                      ...typeForm,
                      abbreviation: event.target.value.toUpperCase(),
                    })
                  }
                  placeholder="SOP"
                  type="text"
                  value={typeForm.abbreviation}
                />
              </Field>
              <Field>
                <FormLabel>Review frequency (years)</FormLabel>
                <Input
                  inputMode="numeric"
                  onChange={(event) =>
                    setTypeForm({
                      ...typeForm,
                      frequencyYears: event.target.value,
                    })
                  }
                  type="text"
                  value={typeForm.frequencyYears}
                />
                <FieldDescription>
                  Counted from the approval date. The default is{" "}
                  {DEFAULT_REVIEW_YEARS} years.
                </FieldDescription>
              </Field>
            </div>
            <Field>
              <FormLabel optional>Description</FormLabel>
              <Textarea
                maxLength={250}
                onChange={(event) =>
                  setTypeForm({ ...typeForm, description: event.target.value })
                }
                value={typeForm.description}
              />
            </Field>
            {typeError && (
              <p className="font-medium text-destructive text-sm">
                {typeError}
              </p>
            )}
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>
              Cancel
            </DialogClose>
            <Button onClick={submitTypeForm}>
              {typeEditing ? "Save changes" : "Add type"}
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>

      {/* US-009 AC-02 to AC-05 */}
      <Dialog onOpenChange={setDepartmentFormOpen} open={departmentFormOpen}>
        <DialogPopup className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {departmentEditing ? "Edit department" : "Add department"}
            </DialogTitle>
            <DialogDescription>
              Renaming a department keeps every record and assignment linked to
              it.
            </DialogDescription>
          </DialogHeader>
          <DialogPanel className="flex flex-col gap-4">
            <Field>
              <FormLabel>Name</FormLabel>
              <Input
                onChange={(event) =>
                  setDepartmentForm({
                    ...departmentForm,
                    name: event.target.value,
                  })
                }
                placeholder="Quality Assurance"
                type="text"
                value={departmentForm.name}
              />
            </Field>
            <Field>
              <FormLabel optional>Description</FormLabel>
              <Textarea
                onChange={(event) =>
                  setDepartmentForm({
                    ...departmentForm,
                    description: event.target.value,
                  })
                }
                value={departmentForm.description}
              />
            </Field>
            {departmentError && (
              <p className="font-medium text-destructive text-sm">
                {departmentError}
              </p>
            )}
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>
              Cancel
            </DialogClose>
            <Button onClick={submitDepartmentForm}>
              {departmentEditing ? "Save changes" : "Add department"}
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>

      <UserFormDialog
        editing={editingId !== null}
        error={formError}
        form={form}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setFormError(null);
        }}
        onSubmit={submitForm}
        open={formOpen}
        setForm={setForm}
      />
    </div>
  );
}
