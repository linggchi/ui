"use client";

// Live, element-accurate previews built from the real design-system
// components — so each card shows the actual thing it documents, not a
// screenshot grabbed from somewhere else.

import { Avatar, AvatarFallback } from "@coss/ui/components/avatar";
import { Badge } from "@coss/ui/components/badge";
import { Button } from "@coss/ui/components/button";
import { Progress } from "@coss/ui/components/progress";
import {
  Attachment as AttachmentIcon,
  BellNotification as BellIcon,
  Calendar as CalendarIcon,
  Check as CheckIcon,
  Download as DownloadIcon,
  Page as PageIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  ShieldCheck as ShieldCheckIcon,
  Upload as UploadIcon,
  User as UserIcon,
} from "iconoir-react";
import Image from "next/image";

function Swatch({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`size-9 rounded-lg border ${className}`} />
      <span className="text-[9px] text-muted-foreground">{label}</span>
    </div>
  );
}

function MiniField({
  disabled,
  marker,
  name,
}: {
  disabled?: boolean;
  marker: string;
  name: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-foreground">
        {name}{" "}
        <span className={disabled ? "" : "text-destructive"}>{marker}</span>
      </span>
      <span
        className={`h-5 rounded-md border text-[10px] ${
          disabled
            ? "border-border bg-secondary/60"
            : "border-input bg-background"
        }`}
      />
    </div>
  );
}

function AssigneeRow({
  initials,
  name,
  jobRole,
}: {
  initials: string;
  name: string;
  jobRole: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1">
      <Avatar className="[--avatar-size:--spacing(5)]">
        <AvatarFallback className="bg-secondary text-[9px] text-secondary-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-[10px] font-medium">{name}</p>
        <p className="truncate text-[9px] text-muted-foreground">{jobRole}</p>
      </div>
    </div>
  );
}

const previews: Record<string, React.ReactNode> = {
  // ---- Foundations ----
  "color-theme": (
    <div className="flex items-end gap-2.5">
      <Swatch
        className="bg-[var(--accura-brand-950-darkshade)]"
        label="Brand 950"
      />
      <Swatch className="bg-[var(--accura-zinc-100)]" label="Zinc 100" />
      <Swatch className="bg-primary" label="Primary" />
      <Swatch className="bg-[var(--accura-coral)]" label="Coral" />
    </div>
  ),
  icons: (
    <div className="flex items-center gap-3 text-foreground">
      <PageIcon className="size-5" />
      <SearchIcon className="size-5" />
      <BellIcon className="size-5" />
      <DownloadIcon className="size-5" />
      <CalendarIcon className="size-5" />
      <SettingsIcon className="size-5" />
    </div>
  ),
  typography: (
    <div className="flex items-center gap-3">
      <span
        className="text-4xl text-foreground"
        style={{ fontVariationSettings: '"GEOM" 50' }}
      >
        Aa
      </span>
      <div className="flex flex-col gap-0.5 leading-tight">
        <span
          className="text-sm font-semibold text-foreground"
          style={{ fontVariationSettings: '"GEOM" 50' }}
        >
          Heading · GEOM 50
        </span>
        <span
          className="text-[11px] text-muted-foreground"
          style={{ fontVariationSettings: '"GEOM" 25' }}
        >
          Body · GEOM 25
        </span>
        <span className="identifier text-[11px] text-muted-foreground">
          ID-000123 · GEOM 0
        </span>
      </div>
    </div>
  ),
  "brand-assets": (
    <div className="flex items-center gap-3 rounded-lg bg-[var(--accura-brand-950-darkshade)] px-5 py-4">
      <Image
        alt="Accura mark"
        className="size-9 object-contain brightness-0 invert"
        height={36}
        src="/brand/accura-mark.svg"
        width={36}
      />
      <Image
        alt="Accura logo"
        className="h-6 w-auto object-contain brightness-0 invert"
        height={36}
        src="/brand/accura-logo.svg"
        width={120}
      />
    </div>
  ),

  // ---- Shell & Navigation ----
  sidebar: (
    <div className="flex h-24 w-40 gap-1.5">
      <div className="flex w-14 flex-col gap-1 rounded-md bg-[var(--accura-brand-950-darkshade)] p-1.5">
        <span className="h-2 rounded-sm bg-[var(--accura-zinc-100)]" />
        <span className="h-2 rounded-sm bg-white/15" />
        <span className="h-2 rounded-sm bg-white/15" />
        <span className="h-2 rounded-sm bg-white/15" />
      </div>
      <div className="flex-1 rounded-md border bg-card" />
    </div>
  ),
  "top-bar": (
    <div className="flex w-48 items-center gap-2 rounded-lg border bg-card px-2 py-1.5 shadow-xs">
      <span className="flex h-6 flex-1 items-center gap-1 rounded-md border px-2 text-[10px] text-muted-foreground">
        <SearchIcon className="size-3" />
        Search… <span className="ms-auto">⌘K</span>
      </span>
      <span className="relative text-muted-foreground">
        <BellIcon className="size-4" />
        <span className="absolute -end-0.5 -top-0.5 size-2 rounded-full bg-[var(--accura-coral)]" />
      </span>
      <Avatar className="[--avatar-size:--spacing(6)]">
        <AvatarFallback className="bg-secondary text-[9px]">AK</AvatarFallback>
      </Avatar>
    </div>
  ),
  "app-canvas": (
    <div className="flex h-24 w-44 gap-2 rounded-lg bg-[var(--accura-zinc-100)] p-2">
      <div className="w-10 rounded-md bg-[var(--accura-brand-950-darkshade)]" />
      <div className="flex-1 rounded-md border bg-card shadow-xs" />
    </div>
  ),

  // ---- Components ----
  "action-priority": (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      <Button size="sm">Primary</Button>
      <Button size="sm" variant="outline">
        Outline
      </Button>
      <Button size="sm" variant="ghost">
        Ghost
      </Button>
      <Button size="sm" variant="destructive">
        Reject
      </Button>
    </div>
  ),
  badges: (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      <Badge variant="success">Approved</Badge>
      <Badge variant="warning">In Review</Badge>
      <Badge variant="outline">SOP</Badge>
      <Badge variant="outline">Admin</Badge>
    </div>
  ),
  tabs: (
    <div className="flex gap-4 border-b px-2 pb-0 text-[11px]">
      {["Account", "Users", "Roles"].map((t, i) => (
        <span
          className={`-mb-px border-b-2 pb-1.5 ${
            i === 0
              ? "border-[var(--accura-brand-950-darkshade)] font-medium text-[var(--accura-brand-950-darkshade)]"
              : "border-transparent text-muted-foreground"
          }`}
          key={t}
        >
          {t}
        </span>
      ))}
    </div>
  ),
  "form-fields": (
    <div className="flex w-40 flex-col gap-2">
      <MiniField marker="*" name="Name" />
      <MiniField marker="(Optional)" name="Note" />
      <MiniField disabled marker="" name="Document ID (locked)" />
    </div>
  ),
  "selection-controls": (
    <div className="w-40 rounded-lg border bg-card p-1 shadow-xs">
      {[
        ["Draft", false],
        ["In Review", true],
        ["Approved", false],
      ].map(([label, selected]) => (
        <div
          className={`flex items-center justify-between rounded-md px-2 py-1 text-[11px] ${
            selected ? "bg-secondary" : ""
          }`}
          key={label as string}
        >
          <span>{label}</span>
          {selected ? (
            <CheckIcon className="size-3.5 text-primary" />
          ) : (
            <span className="size-3.5" />
          )}
        </div>
      ))}
    </div>
  ),
  "information-panel": (
    <div className="flex w-44 gap-2 rounded-lg border border-info/32 bg-info/8 p-2.5">
      <div className="mt-0.5 size-3.5 shrink-0 rounded-full bg-info" />
      <div className="leading-tight">
        <p className="text-[11px] font-medium text-info">Invitation email</p>
        <p className="text-[10px] text-muted-foreground">
          Sent once the user is added.
        </p>
      </div>
    </div>
  ),
  "system-feedback": (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2 rounded-lg border bg-card px-2.5 py-1.5 text-[11px] shadow-sm">
        <CheckIcon className="size-3.5 text-success" />
        Settings saved
        <span className="ms-1 text-muted-foreground">✕</span>
      </div>
      <div className="flex w-40 items-center gap-2 rounded-md border border-warning/32 bg-warning/8 px-2 py-1 text-[10px]">
        <span className="size-2 rounded-full bg-warning" />
        Primary file is required.
      </div>
    </div>
  ),
  "user-identity": (
    <div className="flex items-center gap-2.5">
      <Avatar className="[--avatar-size:--spacing(8)]">
        <AvatarFallback className="bg-secondary text-secondary-foreground">
          AK
        </AvatarFallback>
      </Avatar>
      <div className="leading-tight">
        <p className="text-sm font-medium">Amit Kothari</p>
        <p className="text-[11px] text-muted-foreground">amit.k@acme.com</p>
      </div>
    </div>
  ),
  table: (
    <div className="w-48 overflow-hidden rounded-lg border bg-card text-[10px]">
      <div className="flex bg-secondary/72 px-2 py-1 font-medium text-muted-foreground">
        <span className="flex-1">Name</span>
        <span className="w-14">Status</span>
      </div>
      {[
        ["Sample Mgmt", "success", "Approved"],
        ["Line Clearance", "secondary", "Draft"],
      ].map(([name, variant, label]) => (
        <div className="flex items-center px-2 py-1" key={name}>
          <span className="flex-1 truncate">{name}</span>
          <span className="w-14">
            <Badge size="sm" variant={variant as "secondary" | "success"}>
              {label}
            </Badge>
          </span>
        </div>
      ))}
    </div>
  ),

  // ---- Patterns ----
  "permission-matrix": (
    <div className="w-48 rounded-lg border bg-card p-2 text-[10px]">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-medium">Documents</span>
        <span className="flex h-3.5 w-6 items-center rounded-full bg-primary px-0.5">
          <span className="ms-auto size-2.5 rounded-full bg-white" />
        </span>
      </div>
      <div className="flex gap-1">
        {[
          ["Read only", false],
          ["Read & write", true],
          ["All records", false],
        ].map(([label, on]) => (
          <span
            className={`flex-1 rounded border px-1 py-0.5 text-center text-[9px] ${
              on
                ? "border-primary/40 bg-secondary font-medium"
                : "border-border text-muted-foreground"
            }`}
            key={label as string}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  ),
  "settings-section-header": (
    <div className="w-48 overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center justify-between bg-[var(--accura-zinc-100)] px-2.5 py-2">
        <div className="leading-tight">
          <p className="text-[11px] font-semibold">Users</p>
          <p className="text-[9px] text-muted-foreground">Manage members</p>
        </div>
        <span className="rounded-md bg-primary px-2 py-0.5 text-[9px] text-primary-foreground">
          Add
        </span>
      </div>
      <div className="flex flex-col gap-1 p-2.5">
        <span className="h-1.5 w-full rounded-full bg-secondary" />
        <span className="h-1.5 w-2/3 rounded-full bg-secondary" />
      </div>
    </div>
  ),
  "document-list": (
    <div className="w-52 overflow-hidden rounded-lg border bg-card text-[10px]">
      <div className="flex gap-1 border-b p-1.5">
        <span className="flex flex-1 items-center gap-1 rounded border px-1 text-muted-foreground">
          <SearchIcon className="size-2.5" /> Search…
        </span>
        <span className="rounded border px-1 text-muted-foreground">
          Status
        </span>
      </div>
      {[
        ["ACME-SOP-16", "success", "Approved"],
        ["ACME-BR-01", "secondary", "Draft"],
        ["ACME-EXT-03", "outline", "External"],
      ].map(([id, variant, label]) => (
        <div className="flex items-center gap-2 px-1.5 py-1" key={id}>
          <span className="identifier flex-1 truncate text-muted-foreground">
            {id}
          </span>
          <Badge
            size="sm"
            variant={variant as "outline" | "secondary" | "success"}
          >
            {label}
          </Badge>
        </div>
      ))}
    </div>
  ),
  "create-category-chooser": (
    <div className="flex gap-2">
      {[
        ["Controlled", true],
        ["External", false],
      ].map(([label, selected]) => (
        <div
          className={`w-20 rounded-md border p-2 text-[10px] ${
            selected ? "border-primary/40 bg-secondary" : "border-border"
          }`}
          key={label as string}
        >
          <span
            className={`mb-1 flex size-3.5 items-center justify-center rounded-full border ${
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : ""
            }`}
          >
            {selected && <CheckIcon className="size-2.5" />}
          </span>
          <p className="font-medium">{label}</p>
        </div>
      ))}
    </div>
  ),

  // ---- Behaviors ----
  "workflow-stepper": (
    <div className="flex items-center">
      {["Draft", "Review", "Approval", "Approved"].map((label, i) => (
        <div className="flex items-center" key={label}>
          <div className="flex flex-col items-center gap-1">
            <span
              className={`flex size-5 items-center justify-center rounded-full text-[9px] ${
                i < 2
                  ? "bg-primary text-primary-foreground"
                  : i === 2
                    ? "border border-primary text-primary"
                    : "border border-border text-muted-foreground"
              }`}
            >
              {i < 2 ? <CheckIcon className="size-2.5" /> : i + 1}
            </span>
            <span className="text-[8px] text-muted-foreground">{label}</span>
          </div>
          {i < 3 && (
            <span
              className={`mb-3.5 h-px w-4 ${i < 2 ? "bg-primary" : "bg-border"}`}
            />
          )}
        </div>
      ))}
    </div>
  ),
  "e-signature": (
    <div className="w-40 rounded-lg border bg-card p-2.5 text-[10px] shadow-xs">
      <div className="mb-1.5 flex items-center gap-1.5">
        <ShieldCheckIcon className="size-4 text-primary" />
        <span className="font-medium">Approve &amp; sign</span>
      </div>
      <span className="mb-1.5 block h-5 rounded-md border border-input bg-background" />
      <span className="block rounded-md bg-primary px-2 py-1 text-center text-[9px] text-primary-foreground">
        Confirm signature
      </span>
    </div>
  ),
  "audit-trail-drawer": (
    <div className="flex w-44 flex-col gap-1.5">
      {[
        ["Approved & signed", "success"],
        ["Submitted for review", "secondary"],
      ].map(([label, variant]) => (
        <div className="flex items-start gap-2" key={label}>
          <span className="mt-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <CheckIcon className="size-2.5" />
          </span>
          <div className="flex-1 rounded-md border bg-background p-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium">{label}</span>
              <Badge size="sm" variant={variant as "secondary" | "success"}>
                ✓
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
  "approval-route": (
    <div className="flex w-40 flex-col gap-1.5">
      <AssigneeRow initials="AK" name="Amit Kothari" jobRole="Reviewer" />
      <AssigneeRow initials="NP" name="Nina Patel" jobRole="Approver" />
    </div>
  ),
  "file-uploader": (
    <div className="flex w-40 flex-col gap-1.5">
      <div className="flex flex-col items-center gap-1 rounded-md border border-dashed bg-secondary/24 py-3">
        <UploadIcon className="size-4 text-primary" />
        <span className="text-[9px] text-muted-foreground">
          Upload a document
        </span>
      </div>
      <div className="flex items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-[9px]">
        <AttachmentIcon className="size-3" />
        <span className="flex-1 truncate">spec.pdf</span>
        <span className="text-muted-foreground">2.4 MB</span>
      </div>
    </div>
  ),
  "readiness-summary": (
    <div className="w-40 rounded-lg border bg-card p-2.5 shadow-xs">
      <p className="mb-1.5 text-[10px] font-medium">Ready to submit</p>
      <div className="flex items-center gap-2">
        <Progress className="flex-1" value={67} />
        <span className="text-[10px] font-medium">67%</span>
      </div>
    </div>
  ),
};

export function CataloguePreview({ id }: { id: string }) {
  const node = previews[id];
  if (!node) {
    return (
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <PageIcon className="size-4" />
        <UserIcon className="size-4" />
      </div>
    );
  }
  return node;
}

export function hasPreview(id: string) {
  return id in previews;
}
