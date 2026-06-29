import type { RemixiconComponentType } from "@remixicon/react";
import {
  RiArrowDownLine,
  RiArrowDownSLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiArrowUpLine,
} from "@remixicon/react";
import Link from "next/link";
import { type ReactNode, Suspense } from "react";
import type { UpdateRecordTarget } from "@/app/actions/records";
import { CreateEntityButton } from "@/components/app/create-entity-button";
import {
  type DetailItem,
  DetailSectionItem,
} from "@/components/app/detail-section-item";
import { DetailSidebarActions } from "@/components/app/detail-sidebar-actions";
import { DetailTopbarControls } from "@/components/app/detail-topbar-controls";
import type { EditableDescriptionSaveTarget } from "@/components/app/editable-description";
import { FloatingDetailProperties } from "@/components/app/floating-detail-properties";
import { GatherView } from "@/components/app/gather-view";
import { RecordDetail } from "@/components/app/record-detail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CreationTarget } from "@/lib/creation";
import { cn } from "@/lib/utils";

type WorkspaceFilter = {
  label: string;
  active?: boolean;
  count?: number;
};

type WorkspaceFilterGroup = {
  title: string;
  options: { label: string; count?: number }[];
};

export type WorkspaceSortOption = {
  label: string;
  value: string;
  key: string;
  direction: "asc" | "desc";
};

export type EditableFieldDescriptor =
  | {
      type: "text";
      target: UpdateRecordTarget;
      shortcutKey?: string;
      placeholder?: string;
      inputType?: "text" | "email" | "url" | "number";
    }
  | {
      type: "select";
      target: UpdateRecordTarget;
      options: { label: string; value: string }[];
      shortcutKey?: string;
    }
  | { type: "date"; target: UpdateRecordTarget; shortcutKey?: string }
  | { type: "money"; target: UpdateRecordTarget; shortcutKey?: string };

type WorkspaceDetailSection = {
  title: string;
  items: DetailItem[];
};

export type WorkspaceRecord = {
  id: string;
  entity?: "client" | "proposal" | "invoice" | "expense";
  archived?: boolean;
  group?: string;
  filterKeys?: string[];
  filterAttributes?: Record<string, string>;
  sortValues?: Record<string, string | number>;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  indicator?: ReactNode;
  meta?: ReactNode[];
  tags?: ReactNode[];
  actions?: ReactNode[];
  detailTitle: ReactNode;
  detailDescription?: ReactNode;
  descriptionSaveTarget?: EditableDescriptionSaveTarget;
  detailSections: WorkspaceDetailSection[];
  activity?: ReactNode;
};

export type DetailSurfaceProps = {
  title: string;
  basePath: string;
  backHref?: string;
  icon: RemixiconComponentType;
  record: WorkspaceRecord;
  records: WorkspaceRecord[];
  position?: number;
  variant?: "page" | "panel";
};

type RecordWorkspaceProps = {
  title: string;
  description: string;
  basePath: string;
  selectedId?: string;
  sidebarOpen?: boolean;
  selectedFilterGroup?: string;
  icon: RemixiconComponentType;
  creationTarget?: CreationTarget;
  emptyLabel: string;
  filters: WorkspaceFilter[];
  filterGroups: WorkspaceFilterGroup[];
  sortOptions?: WorkspaceSortOption[];
  records: WorkspaceRecord[];
};

function isVisibleValue(value: ReactNode) {
  return value !== null && value !== undefined && value !== "";
}

function isVisibleItem(item: DetailItem) {
  return (
    Boolean(item.editable) ||
    isVisibleValue(item.value) ||
    (item.links !== undefined && item.links.length > 0)
  );
}

function getVisibleSections(record: WorkspaceRecord) {
  return record.detailSections
    .map((section) => ({
      ...section,
      items: section.items.filter(isVisibleItem),
    }))
    .filter((section) => section.items.length > 0);
}

export function RecordWorkspace({
  title,
  description,
  basePath,
  selectedId,
  sidebarOpen = true,
  selectedFilterGroup,
  icon: Icon,
  creationTarget,
  emptyLabel,
  filters,
  filterGroups,
  sortOptions = [],
  records,
}: RecordWorkspaceProps) {
  const selectedRecord =
    records.find((record) => record.id === selectedId) ?? null;
  const selectedRecordIndex = selectedRecord
    ? records.findIndex((record) => record.id === selectedRecord.id)
    : -1;
  const selectedRecordPosition =
    selectedRecordIndex >= 0 ? selectedRecordIndex + 1 : 1;

  return (
    <div className="px-2 pt-2 pb-2 sm:px-4 sm:pt-4 sm:pb-4">
      {selectedRecord ? (
        <DetailSurface
          basePath={basePath}
          icon={Icon}
          position={selectedRecordPosition}
          record={selectedRecord}
          records={records}
          title={title}
          variant="page"
        />
      ) : (
        <GatherView
          basePath={basePath}
          emptyLabel={emptyLabel}
          filterGroups={filterGroups}
          filters={filters}
          initialFilterGroup={selectedFilterGroup}
          records={records}
          sidebarOpen={sidebarOpen}
          sortOptions={sortOptions}
          topbar={
            <GatherTopbar
              basePath={basePath}
              count={records.length}
              creationTarget={creationTarget}
              description={description}
              icon={Icon}
              title={title}
            />
          }
        />
      )}
    </div>
  );
}

export function RowPill({
  children,
  href,
  icon,
}: {
  children: ReactNode;
  href?: string;
  icon?: ReactNode;
}) {
  const inner = (
    <>
      {icon && (
        <span className="shrink-0 text-muted-foreground/70">{icon}</span>
      )}
      <span className="truncate">{children}</span>
    </>
  );

  const pillClass =
    "inline-flex h-5 max-w-40 items-center gap-1 rounded-full bg-muted/40 px-1.5 text-xs text-muted-foreground";

  if (href) {
    return (
      <Link
        className={cn(
          pillClass,
          "transition-colors hover:bg-muted/60 hover:text-foreground",
        )}
        href={href}
      >
        {inner}
      </Link>
    );
  }

  return <span className={pillClass}>{inner}</span>;
}

export function DetailSurface({
  title,
  basePath,
  backHref = basePath,
  icon: Icon,
  record,
  records,
  position,
  variant = "page",
}: DetailSurfaceProps) {
  const idx = records.findIndex((item) => item.id === record.id);
  const recordPosition = position ?? Math.max(idx + 1, 1);
  const prevRecord = idx > 0 ? records[idx - 1] : records[records.length - 1];
  const nextRecord = idx < records.length - 1 ? records[idx + 1] : records[0];
  const cycleHref = backHref;

  function recordHref(r: WorkspaceRecord) {
    return `${basePath}?record=${r.id}`;
  }

  return (
    <div
      className={cn(
        "@container/detail relative isolate grid min-h-[calc(100svh-2rem)] grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-xl border border-border bg-card",
        variant === "page" &&
          "after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:z-[70] after:h-px after:bg-white/10",
        variant === "panel" &&
          "h-full min-h-0 rounded-none border-0 bg-transparent",
      )}
    >
      <DetailTopbar
        backHref={backHref}
        cycleHref={cycleHref}
        icon={Icon}
        nextHref={recordHref(nextRecord)}
        position={recordPosition}
        prevHref={recordHref(prevRecord)}
        record={record}
        title={title}
        total={records.length}
        variant={variant}
      />

      <div className="grid min-h-0 @6xl/detail:grid-cols-[minmax(0,1fr)_320px]">
        <main className="min-w-0 overflow-auto">
          <RecordDetail record={record} />
        </main>

        <aside className="hidden min-w-0 overflow-auto bg-card/70 @6xl/detail:block">
          <DetailSidebar basePath={basePath} record={record} />
        </aside>
      </div>

      <FloatingDetailProperties>
        <DetailSectionCards record={record} solid />
      </FloatingDetailProperties>
    </div>
  );
}

function DetailTopbar({
  record,
  backHref,
  prevHref,
  nextHref,
  cycleHref,
  icon: Icon,
  title,
  position,
  total,
  variant,
}: {
  record: WorkspaceRecord;
  backHref: string;
  prevHref: string;
  nextHref: string;
  cycleHref: string;
  icon: RemixiconComponentType;
  title: string;
  position: number;
  total: number;
  variant?: "page" | "panel";
}) {
  return (
    <header
      className={cn(
        "flex h-11 items-center justify-between border-border/60 border-b px-3 text-sm text-muted-foreground",
        variant === "panel" && "rounded-t-lg bg-card/95",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Button
          asChild
          className="size-7 rounded-full @6xl/detail:hidden"
          size="icon"
          variant="ghost"
        >
          <Link aria-label="Back to list" href={backHref}>
            <RiArrowLeftLine />
          </Link>
        </Button>
        <Link
          className="hidden min-w-0 items-center gap-2 font-medium transition-colors hover:text-foreground @lg/detail:flex"
          href={backHref}
        >
          <span className="truncate">{title}</span>
        </Link>
        <span className="hidden text-muted-foreground/60 @lg/detail:inline">
          ›
        </span>
        <Icon className="shrink-0" size={14} />
        <span className="truncate font-medium text-foreground">
          {record.eyebrow ?? record.detailTitle}
        </span>
        {record.entity && (
          <DetailTopbarControls
            archived={record.archived ?? false}
            entity={record.entity}
            recordId={record.id}
          />
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <span className="hidden tabular-nums @lg/detail:inline">
          {position} / {total}
        </span>
        <Button
          asChild
          aria-label="Previous record"
          className="size-7 rounded-full"
          size="icon"
          variant="ghost"
        >
          <Link href={prevHref}>
            <RiArrowDownLine />
          </Link>
        </Button>
        <Button
          asChild
          aria-label="Next record"
          className="size-7 rounded-full"
          size="icon"
          variant="ghost"
        >
          <Link href={nextHref}>
            <RiArrowUpLine />
          </Link>
        </Button>
        <span className="mx-1 hidden h-5 w-px bg-border/60 @lg/detail:block" />
        <Button
          asChild
          aria-label="Back to list"
          className="size-7 rounded-full"
          size="icon"
          variant="ghost"
        >
          <Link href={cycleHref}>
            <RiArrowRightLine />
          </Link>
        </Button>
      </div>
    </header>
  );
}

export function DetailSectionCards({
  record,
  solid = false,
}: {
  record: WorkspaceRecord;
  solid?: boolean;
}) {
  const visibleSections = getVisibleSections(record);
  return (
    <div className="space-y-2">
      {visibleSections.map((section) => (
        <details
          className={cn(
            "group rounded-lg border border-border/70 px-4 py-3",
            solid ? "bg-secondary" : "bg-muted/20",
          )}
          key={section.title}
          open
        >
          <summary className="flex cursor-pointer list-none items-center gap-1 font-heading text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
            <span>{section.title}</span>
            <RiArrowDownSLine
              className="-rotate-90 transition-transform group-open:rotate-0"
              size={14}
            />
          </summary>
          <div className="mt-3 space-y-3">
            {section.items.map((item) => (
              <DetailSectionItem item={item} key={item.label} />
            ))}
          </div>
        </details>
      ))}

      {visibleSections.length === 0 && (
        <Badge variant="muted">No details available</Badge>
      )}
    </div>
  );
}

function DetailSidebar({
  record,
  basePath,
}: {
  record: WorkspaceRecord;
  basePath: string;
}) {
  return (
    <div className="p-3">
      {record.entity && (
        <DetailSidebarActions
          basePath={basePath}
          entity={record.entity}
          recordId={record.id}
        />
      )}
      <DetailSectionCards record={record} />
    </div>
  );
}

export function GatherTopbar({
  title,
  description,
  basePath,
  icon: Icon,
  creationTarget,
  count,
}: {
  title: string;
  description: string;
  basePath: string;
  icon: RemixiconComponentType;
  creationTarget?: CreationTarget;
  count: number;
}) {
  return (
    <header className="flex h-11 items-center justify-between gap-3 border-border/60 border-b px-3 text-sm">
      <div className="flex min-w-0 items-center gap-3">
        <Icon className="shrink-0 text-muted-foreground" size={15} />
        <h1 className="truncate font-heading font-semibold">{title}</h1>
        <span className="text-muted-foreground tabular-nums">{count}</span>
        <span className="sr-only">{description}</span>
      </div>
      {creationTarget && (
        <Suspense fallback={null}>
          <CreateEntityButton basePath={basePath} target={creationTarget} />
        </Suspense>
      )}
    </header>
  );
}
