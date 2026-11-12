"use client";

import { Badge } from "@coss/ui/components/badge";
import { Button } from "@coss/ui/components/button";
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
import {
  CheckCircle as CheckCircleIcon,
  ClipboardCheck as ClipboardCheckIcon,
  Eye as EyeIcon,
  MultiplePages as FilesIcon,
  GraduationCap as GraduationCapIcon,
  MoreHoriz as MoreHorizontalIcon,
  RefreshDouble as RefreshCwIcon,
  Reports as ReportsIcon,
  WarningTriangle as WarningTriangleIcon,
} from "iconoir-react";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { Tabs, TabsList, TabsTab } from "./accura-tabs";
import { SectionCard, SectionHeading } from "@/components/accura-form";

type DashboardScreenProps = {
  onOpenDocuments: () => void;
};

type RecordPriority = "High" | "Medium";

type ActionRecord = {
  description: string;
  dueDate: string;
  id: string;
  lateBy?: string;
  module: string;
  priority: RecordPriority;
  status: string;
  timeframe: "actions" | "upcoming";
};

const overviewModules = [
  {
    detail: "overdue · of 1 user",
    icon: GraduationCapIcon,
    metric: "0",
    name: "Training",
    status: "On track",
    tone: "success",
  },
  {
    detail: "due within 14 days · of 13 open",
    icon: ClipboardCheckIcon,
    metric: "0",
    name: "CAPA",
    status: "Overdue",
    tone: "danger",
  },
  {
    detail: "awaiting approval · of 18 in workflow",
    icon: FilesIcon,
    metric: "2",
    name: "Documents",
    status: "Due soon",
    tone: "warning",
  },
  {
    detail: "critical · of 14 open",
    icon: WarningTriangleIcon,
    metric: "1",
    name: "Non-Conformance",
    status: "Overdue",
    tone: "danger",
  },
  {
    detail: "due within 30 days · of 9 open",
    icon: RefreshCwIcon,
    metric: "1",
    name: "Change Control",
    status: "Overdue",
    tone: "danger",
  },
] as const;

const records: ActionRecord[] = [
  {
    description: "Test to reject at final stage",
    dueDate: "17 Sept",
    id: "ACME/CC/2026/000011",
    lateBy: "47 days late",
    module: "Change Control",
    priority: "High",
    status: "Implementation in Progress",
    timeframe: "actions",
  },
  {
    description: "Test to check reject",
    dueDate: "23 Sept",
    id: "ACME/CC/2026/000009",
    lateBy: "41 days late",
    module: "Change Control",
    priority: "High",
    status: "Impact Assessment",
    timeframe: "actions",
  },
  {
    description: "Test to reject change at final stage",
    dueDate: "30 Sept",
    id: "ACME/CC/2026/000010",
    lateBy: "34 days late",
    module: "Change Control",
    priority: "High",
    status: "Implementation in Progress",
    timeframe: "actions",
  },
  {
    description: "Document Control Requirements",
    dueDate: "2 Nov",
    id: "ACME-URS-2026-000005",
    module: "Documents",
    priority: "Medium",
    status: "In Review",
    timeframe: "actions",
  },
  {
    description: "Equipment Design Specification",
    dueDate: "3 Nov",
    id: "ACME-DS-2026-000013",
    module: "Documents",
    priority: "High",
    status: "In Approval",
    timeframe: "actions",
  },
  {
    description: "Supplier corrective action follow-up",
    dueDate: "6 Nov",
    id: "ACME/CAPA/2026/000019",
    module: "CAPA",
    priority: "Medium",
    status: "In Review",
    timeframe: "upcoming",
  },
  {
    description: "Annual GMP refresher",
    dueDate: "9 Nov",
    id: "ACME/TRN/2026/000042",
    module: "Training",
    priority: "Medium",
    status: "Assigned",
    timeframe: "upcoming",
  },
];

const priorityOptions = [
  { label: "All priorities", value: "all" },
  { label: "High priority", value: "High" },
  { label: "Medium priority", value: "Medium" },
];

/**
 * The overview card's three states — and **one** coloured mark per card.
 *
 * The card went through two colours before this. It began with a lime rule
 * (`--accura-pop`, used nowhere else in Accura) across every card regardless
 * of state. That became a state-coloured rule, which at least meant
 * something — but with a tinted icon and a tinted badge beside it, each card
 * carried three coloured marks saying one thing, and five of those in a grid
 * is a lot of colour for five numbers.
 *
 * So: no rule, a neutral icon, and the badge as the only colour. It already
 * says the state in words.
 *
 * The badge uses `error` / `warning` / `success` — the 8% tints every other
 * status in Accura uses — not `destructive`, whose saturated red made the
 * dashboard the loudest screen in the product.
 */
const MODULE_TONES = {
  danger: { badge: "error" },
  success: { badge: "success" },
  warning: { badge: "warning" },
} as const;

type ModuleTone = keyof typeof MODULE_TONES;

export function DashboardScreen({ onOpenDocuments }: DashboardScreenProps) {
  const [activeTab, setActiveTab] = useState<"actions" | "upcoming">("actions");
  const [priority, setPriority] = useState("all");
  const recordsRef = useRef<HTMLElement>(null);

  const visibleRecords = useMemo(
    () =>
      records.filter(
        (record) =>
          record.timeframe === activeTab &&
          (priority === "all" || record.priority === priority),
      ),
    [activeTab, priority],
  );

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5">
      {/* The artwork is the Figma export (mint -> cream, 2026-11-12), replacing
          the lime wash that preceded it. The gradient stays underneath it as
          the paint-in colour: the PNG is 860KB and the band is full-bleed, so
          without it the section flashes white on a cold load.
          The file is `-mint` rather than overwriting `dashboard-banner.png`
          on purpose. Overwriting it served the old lime art from cache
          through a dev-server restart and a hard reload, and Next 16 rejects
          a `?v=` cache-bust outright (`images.localPatterns`). A replaced
          image asset gets a new filename. */}
      <section className="relative flex h-[147px] items-center overflow-hidden rounded-2xl bg-[linear-gradient(90deg,var(--accura-pop-mint)_0%,var(--accura-pop-mint-soft)_100%)] px-6 sm:px-10">
        <Image
          alt=""
          aria-hidden="true"
          className="object-cover object-center"
          fill
          priority
          sizes="(max-width: 1600px) 100vw, 1600px"
          src="/brand/dashboard-banner-mint-v2.png"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl border border-[var(--accura-brand-200)]"
        />

        <div className="relative z-1 flex flex-col gap-1">
          <p className="font-medium text-[0.72rem] text-[var(--accura-brand-950-darkshade)]/70 uppercase tracking-[0.14em]">
            Your quality workspace
          </p>
          <h1 className="font-bold text-2xl text-[var(--accura-brand-950-darkshade)] leading-tight sm:text-3xl">
            Good morning, a Tùng đẹp trai
          </h1>
          <p className="font-medium text-[var(--accura-brand-950-darkshade)]/75 text-sm">
            Tuesday, 3 November 2026
          </p>
        </div>
      </section>

      <div
        className="flex items-start gap-3 rounded-xl border border-[var(--accura-coral)]/32 bg-[var(--accura-coral)]/8 px-4 py-3 text-sm"
        role="status"
      >
        <WarningTriangleIcon
          aria-hidden="true"
          className="mt-0.5 size-4 shrink-0 text-destructive"
        />
        <p>
          <span className="font-medium">Action required:</span> You have 18
          overdue records, 11 waiting on your approval, and 1 due this week.
        </p>
      </div>

      <section
        aria-labelledby="overview-heading"
        className="flex flex-col gap-3"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-lg" id="overview-heading">
              Overview
            </h2>
            <p className="text-muted-foreground text-sm">
              Live workload across your quality modules.
            </p>
          </div>
          <ReportsIcon
            aria-hidden="true"
            className="size-5 text-muted-foreground"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {overviewModules.map((module) => {
            const Icon = module.icon;
            // Only Documents is built, so only Documents is pressable. A card
            // that looks clickable and does nothing is worse than a flat one.
            const opens = module.name === "Documents";
            const body = (
              <>
                <span className="flex items-start justify-between gap-3">
                  {/* The icon is neutral. The state is already in the badge's
                      words and its tint; tinting the icon as well said the
                      same thing a third time, and five cards each carrying
                      two coloured marks is what made the grid noisy. */}
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                    <Icon aria-hidden="true" className="size-4.5" />
                  </span>
                  <Badge
                    size="sm"
                    variant={MODULE_TONES[module.tone as ModuleTone].badge}
                  >
                    {module.status}
                  </Badge>
                </span>

                {/* The number owns its line. Sharing one with the detail made
                    the point of the card compete with a grey sentence. */}
                <span className="mt-4 block font-bold text-3xl tabular-nums leading-none">
                  {module.metric}
                </span>
                <span className="mt-2 block truncate font-medium text-sm">
                  {module.name}
                </span>
                <span className="mt-0.5 block truncate text-muted-foreground text-xs">
                  {module.detail}
                </span>
              </>
            );

            const shell =
              "rounded-[20px] border border-border bg-card ps-5 pe-4 pt-5 pb-4 text-left shadow-xs";

            return opens ? (
              <button
                className={`${shell} outline-none transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring`}
                key={module.name}
                onClick={onOpenDocuments}
                type="button"
              >
                {body}
              </button>
            ) : (
              <div className={shell} key={module.name}>
                {body}
              </div>
            );
          })}
        </div>
      </section>

      <section
        aria-label="Records"
        className="flex scroll-mt-24 flex-col gap-3"
        ref={recordsRef}
      >
        {/* The same shape as Settings > Users: one card holding the heading,
            the tabs, a filter row and the table. The heading and tabs had sat
            loose on the canvas above a separate table card, so the section
            read as three things rather than one. */}
        <SectionCard>
          <SectionHeading
            description="Prioritized work assigned to you."
            title="Records"
          />

          <Tabs
            onValueChange={(value) =>
              setActiveTab(value as "actions" | "upcoming")
            }
            value={activeTab}
          >
            <TabsList aria-label="Record views">
              <TabsTab value="actions">My actions (30)</TabsTab>
              <TabsTab value="upcoming">Upcoming (2)</TabsTab>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap items-center gap-3 px-5 py-4">
            <Select
              items={priorityOptions}
              onValueChange={(value) => setPriority(String(value))}
              value={priority}
            >
              <SelectTrigger aria-label="Filter by priority" className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectPopup>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectPopup>
            </Select>
            <span className="text-muted-foreground text-sm">
              {visibleRecords.length}{" "}
              {visibleRecords.length === 1 ? "record" : "records"}
            </span>
          </div>

          <div className="border-t">
            <Table>
              <TableHeader className="bg-secondary/72">
                <TableRow className="hover:bg-transparent">
                  {/* Split, as the Documents register splits Document ID
                      from Name: the ID is what a user searches and quotes,
                      and it is the link — so it gets its own column rather
                      than sitting above a description nobody can scan down. */}
                  <TableHead className="w-[210px] ps-5 text-xs">
                    Record
                  </TableHead>
                  <TableHead className="min-w-[240px] text-xs">Name</TableHead>
                  <TableHead className="min-w-[190px] text-xs">
                    Status
                  </TableHead>
                  <TableHead className="w-[120px] text-xs">Priority</TableHead>
                  <TableHead className="w-[170px] text-xs max-[1120px]:hidden">
                    Module
                  </TableHead>
                  <TableHead className="w-[140px] text-xs">Due date</TableHead>
                  <TableHead className="w-12 pe-5 text-right text-xs">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRecords.length > 0 ? (
                  visibleRecords.map((record) => (
                    <TableRow className="hover:bg-secondary/48" key={record.id}>
                      <TableCell className="ps-5">
                        {/* The same link treatment as the register's Document
                            ID: Brand 900 at rest, underline on hover. */}
                        <button
                          className="identifier block max-w-[190px] truncate text-left font-medium text-[var(--accura-brand-900)] text-sm underline decoration-transparent underline-offset-2 outline-none transition-colors hover:decoration-current focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={
                            record.module === "Documents"
                              ? onOpenDocuments
                              : undefined
                          }
                          title={record.id}
                          type="button"
                        >
                          {record.id}
                        </button>
                      </TableCell>
                      <TableCell>
                        <span
                          className="block max-w-[260px] truncate"
                          title={record.description}
                        >
                          {record.description}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{record.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {/* `destructive` is solid red on white and was the
                          loudest thing on the screen; every other status in
                          Accura uses the 8% tint. */}
                        <Badge
                          variant={
                            record.priority === "High" ? "error" : "warning"
                          }
                        >
                          {record.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-[1120px]:hidden">
                        {record.module}
                      </TableCell>
                      <TableCell>
                        <span className="identifier text-sm">
                          {record.dueDate}
                        </span>
                        {record.lateBy && (
                          <p className="mt-1 text-destructive text-xs">
                            {record.lateBy}
                          </p>
                        )}
                      </TableCell>
                      {/* A “…” menu, the same row action Settings > Users
                        carries, instead of a bare eye icon. */}
                      <TableCell className="pe-5 text-right">
                        <Menu>
                          <MenuTrigger
                            render={
                              <Button
                                aria-label={`More actions for ${record.id}`}
                                size="icon-sm"
                                variant="ghost"
                              />
                            }
                          >
                            <MoreHorizontalIcon aria-hidden="true" />
                          </MenuTrigger>
                          <MenuPopup align="end">
                            <MenuItem
                              onClick={
                                record.module === "Documents"
                                  ? onOpenDocuments
                                  : undefined
                              }
                            >
                              <EyeIcon aria-hidden="true" />
                              View details
                            </MenuItem>
                          </MenuPopup>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="h-48 text-center" colSpan={7}>
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                        <CheckCircleIcon
                          aria-hidden="true"
                          className="size-8 text-primary"
                        />
                        <p className="font-medium">Nothing in this view</p>
                        <p className="text-muted-foreground text-sm">
                          Try another priority or switch record tabs.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
