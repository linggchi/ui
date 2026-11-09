"use client";

import { Badge } from "@coss/ui/components/badge";
import { Button } from "@coss/ui/components/button";
import {
  Drawer,
  DrawerDescription,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
} from "@coss/ui/components/drawer";
import {
  ArrowRight as ArrowRightIcon,
  CheckCircle as CheckCircleIcon,
  NavArrowRight as NavArrowRightIcon,
  WarningTriangle as WarningTriangleIcon,
  Xmark as XIcon,
} from "iconoir-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { CataloguePreview } from "@/components/catalogue-previews";
import {
  type CatalogueEntry,
  type EntryStatus,
  entries,
  groups,
} from "@/lib/catalogue-data";

function StatusMark({
  className,
  status,
}: {
  className?: string;
  status: EntryStatus;
}) {
  if (status === "ready") {
    return (
      <CheckCircleIcon
        aria-label="Ready"
        className={`size-4 text-success ${className ?? ""}`}
      />
    );
  }
  return (
    <WarningTriangleIcon
      aria-label="Needs sign-off"
      className={`size-4 text-warning ${className ?? ""}`}
    />
  );
}

function StatusBadge({ status }: { status: EntryStatus }) {
  return (
    <Badge variant={status === "ready" ? "success" : "warning"}>
      <StatusMark status={status} />
      {status === "ready" ? "Ready" : "Needs sign-off"}
    </Badge>
  );
}

function PreviewFrame({ entry }: { entry: CatalogueEntry }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center overflow-hidden bg-card p-3"
      style={{
        backgroundImage:
          "radial-gradient(rgba(9, 36, 27, 0.06) 1px, transparent 1px)",
        backgroundSize: "14px 14px",
      }}
    >
      <CataloguePreview id={entry.id} />
    </div>
  );
}

function CatalogueCard({
  entry,
  onOpen,
}: {
  entry: CatalogueEntry;
  onOpen: () => void;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="h-32 w-full border-b">
        <PreviewFrame entry={entry} />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base leading-tight">
            {entry.title}
          </h3>
          <StatusMark className="mt-0.5 shrink-0" status={entry.status} />
        </div>
        <p className="flex-1 text-muted-foreground text-sm">{entry.summary}</p>
        <Button
          className="mt-1 self-start"
          onClick={onOpen}
          size="sm"
          variant="outline"
        >
          View details
          <ArrowRightIcon aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
}

function DetailSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
        {title}
      </h3>
      {children}
    </section>
  );
}

function EntryDetail({ entry }: { entry: CatalogueEntry }) {
  const group = groups.find((item) => item.id === entry.group);
  return (
    <DrawerPanel className="flex flex-col gap-6 pb-8">
      <div className="h-40 w-full overflow-hidden rounded-xl border">
        <PreviewFrame entry={entry} />
      </div>

      <p className="text-foreground text-sm leading-6">{entry.summary}</p>

      {entry.statusNote && (
        <div className="flex gap-3 rounded-xl border border-warning/32 bg-warning/8 p-3">
          <WarningTriangleIcon
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-warning"
          />
          <p className="text-sm">{entry.statusNote}</p>
        </div>
      )}

      <DetailSection title="Rules">
        <ul className="flex flex-col gap-2">
          {entry.rules.map((rule) => (
            <li className="flex gap-2 text-sm leading-6" key={rule}>
              <span
                aria-hidden="true"
                className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
              />
              {rule}
            </li>
          ))}
        </ul>
      </DetailSection>

      <DetailSection title="Applied in">
        <ul className="flex flex-col gap-1.5">
          {entry.appliedIn.map((place) => (
            <li className="text-muted-foreground text-sm leading-6" key={place}>
              {place}
            </li>
          ))}
        </ul>
      </DetailSection>

      <DetailSection title="Consistency">
        <p className="text-muted-foreground text-sm leading-6">
          {entry.consistency}
        </p>
      </DetailSection>

      <DetailSection title="Sources">
        <ul className="flex flex-col gap-2">
          {entry.sources.map((source) => (
            <li
              className="flex flex-wrap items-center gap-2 text-sm"
              key={source.where}
            >
              <Badge variant="outline">{source.label}</Badge>
              <span className="identifier text-muted-foreground text-xs">
                {source.where}
              </span>
            </li>
          ))}
        </ul>
      </DetailSection>

      {group && (
        <p className="text-muted-foreground text-xs">
          Group: <span className="font-medium">{group.title}</span>
        </p>
      )}
    </DrawerPanel>
  );
}

export function CatalogueApp() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const entriesByGroup = useMemo(
    () =>
      groups.map((group) => ({
        group,
        items: entries.filter((entry) => entry.group === group.id),
      })),
    [],
  );

  const visibleGroups = activeGroup
    ? entriesByGroup.filter(({ group }) => group.id === activeGroup)
    : entriesByGroup;
  const activeGroupTitle = groups.find((g) => g.id === activeGroup)?.title;

  const readyCount = entries.filter((e) => e.status === "ready").length;
  const draftCount = entries.length - readyCount;
  const selectedEntry =
    entries.find((entry) => entry.id === selectedId) ?? null;

  return (
    <div className="flex min-h-svh gap-2 bg-[var(--accura-canvas)] p-2">
      <aside className="sticky top-2 hidden h-[calc(100svh-1rem)] w-[272px] shrink-0 flex-col overflow-hidden rounded-xl border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm lg:flex">
        <div className="flex h-16 shrink-0 items-center px-4">
          <Image
            alt="Accura"
            className="h-8 w-auto object-contain object-left brightness-0 invert"
            height={59}
            priority
            src="/brand/accura-logo.svg"
            width={164}
          />
        </div>
        <nav
          aria-label="Catalogue sections"
          className="flex-1 overflow-y-auto px-2 pb-4"
        >
          {entriesByGroup.map(({ group, items }) => (
            <div className="mb-4" key={group.id}>
              <button
                aria-pressed={activeGroup === group.id}
                className={`flex w-full items-center gap-1 rounded-md px-2.5 py-2 text-left font-medium text-xs uppercase tracking-wide outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring ${
                  activeGroup === group.id
                    ? "text-white"
                    : "text-sidebar-foreground/64 hover:text-white"
                }`}
                onClick={() =>
                  setActiveGroup((current) =>
                    current === group.id ? null : group.id,
                  )
                }
                type="button"
              >
                <NavArrowRightIcon
                  aria-hidden="true"
                  className={`size-3 shrink-0 transition-transform ${
                    activeGroup === group.id ? "rotate-90" : ""
                  }`}
                />
                {group.title}
              </button>
              <ul className="flex flex-col gap-0.5">
                {items.map((entry) => {
                  const active = entry.id === selectedId;
                  return (
                    <li key={entry.id}>
                      <button
                        className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring ${
                          active
                            ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                            : "hover:bg-white/10 hover:text-white"
                        }`}
                        onClick={() => setSelectedId(entry.id)}
                        type="button"
                      >
                        <StatusMark
                          className="shrink-0"
                          status={entry.status}
                        />
                        <span className="truncate">{entry.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-5 sm:p-6 xl:p-8">
          <header className="flex flex-col gap-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h1 className="font-bold text-2xl leading-tight">
                  Patterns &amp; Behavior
                </h1>
                <p className="text-muted-foreground text-sm">
                  Reusable elements, their rules, and where they are applied —
                  so a new feature can reuse what is already decided.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="success">
                  <CheckCircleIcon aria-hidden="true" className="size-4" />
                  {readyCount} ready
                </Badge>
                <Badge variant="warning">
                  <WarningTriangleIcon aria-hidden="true" className="size-4" />
                  {draftCount} need sign-off
                </Badge>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 rounded-xl border bg-card px-4 py-3 text-muted-foreground text-xs">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircleIcon
                  aria-hidden="true"
                  className="size-4 text-success"
                />
                Ready — approved rule, decision, and QA evidence
              </span>
              <span className="inline-flex items-center gap-1.5">
                <WarningTriangleIcon
                  aria-hidden="true"
                  className="size-4 text-warning"
                />
                Needs sign-off — built, but not yet settled or recently changed
              </span>
            </div>
          </header>

          {activeGroup && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Viewing section:</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 font-medium">
                {activeGroupTitle}
                <button
                  aria-label="Show all sections"
                  className="rounded-full outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setActiveGroup(null)}
                  type="button"
                >
                  <XIcon aria-hidden="true" className="size-3.5" />
                </button>
              </span>
            </div>
          )}

          {visibleGroups.map(({ group, items }) => (
            <section
              aria-labelledby={`group-${group.id}`}
              className="flex flex-col gap-3"
              id={group.id}
              key={group.id}
            >
              <div className="flex flex-col gap-0.5">
                <h2
                  className="font-semibold text-lg leading-tight"
                  id={`group-${group.id}`}
                >
                  {group.title}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {group.description}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((entry) => (
                  <CatalogueCard
                    entry={entry}
                    key={entry.id}
                    onOpen={() => setSelectedId(entry.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>

      <Drawer
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        open={selectedEntry !== null}
        position="right"
      >
        <DrawerPopup position="right" showCloseButton>
          {selectedEntry && (
            <>
              <DrawerHeader>
                <div className="flex items-center gap-2 pe-10">
                  <StatusBadge status={selectedEntry.status} />
                </div>
                <DrawerTitle>{selectedEntry.title}</DrawerTitle>
                <DrawerDescription>
                  {groups.find((g) => g.id === selectedEntry.group)?.title}
                </DrawerDescription>
              </DrawerHeader>
              <EntryDetail entry={selectedEntry} />
            </>
          )}
        </DrawerPopup>
      </Drawer>
    </div>
  );
}
