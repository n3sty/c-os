import type { RemixiconComponentType } from "@remixicon/react";
import {
  RiAddLine,
  RiArrowDownLine,
  RiArrowDownSLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiArrowUpLine,
  RiCloseLine,
  RiEqualizerLine,
  RiFileCopyLine,
  RiFilter3Line,
  RiGitBranchLine,
  RiLinksLine,
  RiMoreLine,
  RiSidebarUnfoldLine,
  RiStarLine,
} from "@remixicon/react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WorkspaceFilter = {
  label: string;
  active?: boolean;
  count?: number;
};

type WorkspaceFilterGroup = {
  title: string;
  options: { label: string; count?: number; active?: boolean }[];
};

type WorkspaceDetailItem = {
  label: string;
  value?: ReactNode;
  links?: {
    href: string;
    label: string;
    meta?: ReactNode;
  }[];
};

type WorkspaceDetailSection = {
  title: string;
  items: WorkspaceDetailItem[];
};

export type WorkspaceRecord = {
  id: string;
  group?: string;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  indicator?: ReactNode;
  meta?: ReactNode[];
  tags?: ReactNode[];
  detailTitle: ReactNode;
  detailDescription?: ReactNode;
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
  actionLabel: string;
  emptyLabel: string;
  filters: WorkspaceFilter[];
  filterGroups: WorkspaceFilterGroup[];
  records: WorkspaceRecord[];
};

function isVisibleValue(value: ReactNode) {
  return value !== null && value !== undefined && value !== "";
}

function isVisibleItem(item: WorkspaceDetailItem) {
  return (
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

function getCountLabel(count?: number) {
  return typeof count === "number" ? (
    <span className="ml-auto text-muted-foreground tabular-nums">{count}</span>
  ) : null;
}

function getFilterHref(basePath: string, groupTitle: string) {
  return `${basePath}?filter=${encodeURIComponent(groupTitle)}`;
}

export function RecordWorkspace({
  title,
  description,
  basePath,
  selectedId,
  sidebarOpen = true,
  selectedFilterGroup,
  icon: Icon,
  actionLabel,
  emptyLabel,
  filters,
  filterGroups,
  records,
}: RecordWorkspaceProps) {
  const selectedRecord =
    records.find((record) => record.id === selectedId) ?? null;
  const selectedRecordIndex = selectedRecord
    ? records.findIndex((record) => record.id === selectedRecord.id)
    : -1;
  const selectedRecordPosition =
    selectedRecordIndex >= 0 ? selectedRecordIndex + 1 : 1;
  const visibleFilterGroups = filterGroups
    .map((group) => ({
      ...group,
      options: group.options.filter((option) => option.count !== 0),
    }))
    .filter((group) => group.options.length > 0);
  const activeFilterGroup =
    visibleFilterGroups.find((group) => group.title === selectedFilterGroup) ??
    visibleFilterGroups[0];

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
        <div className="grid min-h-[calc(100svh-2rem)] grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden rounded-lg bg-card">
          <GatherTopbar
            actionLabel={actionLabel}
            count={records.length}
            description={description}
            icon={Icon}
            title={title}
          />
          <GatherFilterBar
            basePath={basePath}
            filters={filters}
            sidebarOpen={sidebarOpen}
          />

          <div
            className={cn(
              "grid min-h-0 overflow-hidden",
              sidebarOpen
                ? "xl:grid-cols-[minmax(0,1fr)_320px]"
                : "xl:grid-cols-[minmax(0,1fr)]",
            )}
          >
            <main className="min-w-0 overflow-hidden">
              <RecordList
                basePath={basePath}
                emptyLabel={emptyLabel}
                icon={Icon}
                records={records}
              />
            </main>

            {sidebarOpen && (
              <aside className="hidden min-h-0 bg-background/35 p-2 pl-0 xl:block">
                <FilterSidebar
                  activeGroup={activeFilterGroup}
                  basePath={basePath}
                  groups={visibleFilterGroups}
                />
              </aside>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function GatherTopbar({
  title,
  description,
  icon: Icon,
  actionLabel,
  count,
}: {
  title: string;
  description: string;
  icon: RemixiconComponentType;
  actionLabel: string;
  count: number;
}) {
  return (
    <header className="flex h-11 items-center justify-between gap-3 border-border/60 border-b px-3 text-sm">
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="shrink-0 text-muted-foreground" size={15} />
        <h1 className="truncate font-heading font-semibold">{title}</h1>
        <span className="text-muted-foreground tabular-nums">{count}</span>
        <span className="sr-only">{description}</span>
      </div>

      <Button className="h-7 rounded-full px-2.5" size="sm" type="button">
        <RiAddLine />
        <span className="hidden sm:inline">{actionLabel}</span>
      </Button>
    </header>
  );
}

function GatherFilterBar({
  basePath,
  sidebarOpen,
  filters,
}: {
  basePath: string;
  sidebarOpen: boolean;
  filters: WorkspaceFilter[];
}) {
  const sidebarHref = sidebarOpen ? `${basePath}?sidebar=closed` : basePath;

  return (
    <div className="flex min-h-11 items-center justify-between gap-2 px-2 py-1.5 sm:px-3">
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {filters.map((filter) => (
          <button
            className={cn(
              "inline-flex h-8 shrink-0 items-center gap-2 rounded-full px-3 text-sm text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground",
              filter.active && "bg-muted/50 font-medium text-foreground",
            )}
            key={filter.label}
            type="button"
          >
            {filter.label}
            {typeof filter.count === "number" && (
              <span className="text-xs text-muted-foreground tabular-nums">
                {filter.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          aria-label="More list options"
          className="size-8 rounded-full"
          size="icon"
          variant="ghost"
        >
          <RiMoreLine />
        </Button>
        <Button
          aria-label="Quick filters"
          className="size-8 rounded-full"
          size="icon"
          variant="ghost"
        >
          <RiEqualizerLine />
        </Button>
        <Button
          aria-label={
            sidebarOpen ? "Hide filter sidebar" : "Show filter sidebar"
          }
          asChild
          className="size-8 rounded-full"
          size="icon"
          variant={sidebarOpen ? "secondary" : "ghost"}
        >
          <Link href={sidebarHref}>
            {sidebarOpen ? <RiCloseLine /> : <RiSidebarUnfoldLine />}
          </Link>
        </Button>
      </div>
    </div>
  );
}

function RecordList({
  basePath,
  icon: Icon,
  records,
  emptyLabel,
}: {
  basePath: string;
  icon: RemixiconComponentType;
  records: WorkspaceRecord[];
  emptyLabel: string;
}) {
  const groupedRecords = records.reduce<
    { title: string; records: WorkspaceRecord[] }[]
  >((groups, record) => {
    const title = record.group ?? "Other active";
    const existingGroup = groups.find((group) => group.title === title);

    if (existingGroup) {
      existingGroup.records.push(record);
      return groups;
    }

    groups.push({ title, records: [record] });
    return groups;
  }, []);

  return (
    <section className="h-full min-h-0 overflow-hidden">
      <div className="h-full overflow-auto">
        {records.length > 0 ? (
          <div className="pb-3">
            {groupedRecords.map((group) => (
              <section className="pt-1.5" key={group.title}>
                <div className="grid h-9 grid-cols-[auto_auto_auto_minmax(0,1fr)_auto] items-center gap-2 bg-muted/20 px-3 text-sm text-muted-foreground sm:px-4">
                  <RiArrowDownSLine
                    className="text-muted-foreground"
                    size={14}
                  />
                  <span className="min-w-0 truncate font-medium text-foreground">
                    {group.title}
                  </span>
                  <span className="tabular-nums">{group.records.length}</span>
                  <span className="h-px bg-border/60" />
                  <button
                    aria-label={`Add record to ${group.title}`}
                    className="flex size-7 items-center justify-center rounded-full transition-colors hover:bg-muted/50 hover:text-foreground"
                    type="button"
                  >
                    <RiAddLine size={15} />
                  </button>
                </div>

                <div>
                  {group.records.map((record) => (
                    <Link
                      className="group grid min-h-12 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-border/35 border-b px-3 py-1.5 text-sm transition-colors last:border-b-0 hover:bg-muted/30 sm:px-4"
                      href={`${basePath}?record=${record.id}`}
                      key={record.id}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          aria-hidden
                          className="size-4 shrink-0 rounded-full border border-muted-foreground/55 transition-colors group-hover:border-foreground/70"
                        />
                        <div className="flex size-5 shrink-0 items-center justify-center text-muted-foreground">
                          {record.indicator ?? <Icon size={16} />}
                        </div>
                        <div className="min-w-0 md:flex md:items-center md:gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            {record.eyebrow && (
                              <span className="shrink-0 text-muted-foreground">
                                {record.eyebrow}
                              </span>
                            )}
                            <span className="truncate font-medium text-foreground">
                              {record.title}
                            </span>
                          </div>
                          {record.subtitle && (
                            <p className="truncate text-xs text-muted-foreground md:max-w-72 lg:max-w-96">
                              {record.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="hidden min-w-0 items-center justify-end gap-2 md:flex">
                        {record.tags
                          ?.filter(isVisibleValue)
                          .map((tag, index) => (
                            <span key={`${record.id}-tag-${index}`}>{tag}</span>
                          ))}
                        {record.meta
                          ?.filter(isVisibleValue)
                          .map((item, index) => (
                            <span
                              className="shrink-0 text-muted-foreground text-xs"
                              key={`${record.id}-meta-${index}`}
                            >
                              {item}
                            </span>
                          ))}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="flex min-h-72 items-center justify-center px-8 text-center text-base text-muted-foreground">
            {emptyLabel}
          </div>
        )}
      </div>
    </section>
  );
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
  const recordPosition =
    position ?? Math.max(records.findIndex((item) => item.id === record.id) + 1, 1);

  return (
    <div
      className={cn(
        "grid min-h-[calc(100svh-2rem)] grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-lg bg-card",
        variant === "panel" && "min-h-0 rounded-none bg-transparent",
      )}
    >
      <DetailTopbar
        backHref={backHref}
        icon={Icon}
        position={recordPosition}
        record={record}
        title={title}
        total={records.length}
        variant={variant}
      />

      <div className="grid min-h-0 xl:grid-cols-[minmax(0,1fr)_320px]">
        <main className="min-w-0 overflow-auto">
          <RecordDetail record={record} />
        </main>

        <aside className="hidden bg-card/70 xl:block">
          <DetailSidebar record={record} />
        </aside>
      </div>
    </div>
  );
}

function EditableDescription({ value }: { value: ReactNode }) {
  if (typeof value !== "string") {
    return (
      <div className="-mx-2 rounded-md px-2 py-2 text-base leading-7 text-muted-foreground transition-colors duration-150 hover:bg-muted/20">
        {value}
      </div>
    );
  }

  return (
    <textarea
      aria-label="Record description"
      className="-mx-2 min-h-28 w-full resize-y rounded-md border-0 bg-transparent px-2 py-2 text-base leading-7 text-muted-foreground outline-none transition-colors duration-150 hover:bg-muted/20 focus:bg-muted/25 focus:text-foreground"
      defaultValue={value}
    />
  );
}

function RecordDetail({ record }: { record: WorkspaceRecord }) {
  return (
    <article className="min-h-full">
      <div className="mx-auto max-w-3xl px-4 pt-12 pb-8 sm:px-8 lg:px-0">
        <div className="space-y-4">
          <h1 className="font-heading text-2xl font-semibold tracking-normal">
            {record.detailTitle}
          </h1>
          {record.detailDescription && (
            <EditableDescription value={record.detailDescription} />
          )}
        </div>

        <div className="mt-10 border-t border-border/60 pt-6">
          <h2 className="font-heading text-base font-semibold">Activity</h2>
          <div className="mt-5 rounded-md bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
            {record.activity ?? "No activity has been recorded yet."}
          </div>
        </div>

        <div className="mt-6 xl:hidden">
          <DetailSectionCards record={record} />
        </div>
      </div>
    </article>
  );
}

function DetailTopbar({
  record,
  backHref,
  icon: Icon,
  title,
  position,
  total,
  variant,
}: {
  record: WorkspaceRecord;
  backHref: string;
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
          className="size-7 rounded-full xl:hidden"
          size="icon"
          variant="ghost"
        >
          <Link aria-label="Back to list" href={backHref}>
            <RiArrowLeftLine />
          </Link>
        </Button>
        <Link
          className="hidden min-w-0 items-center gap-2 font-medium transition-colors hover:text-foreground sm:flex"
          href={backHref}
        >
          <span className="truncate">{title}</span>
        </Link>
        <span className="hidden text-muted-foreground/60 sm:inline">›</span>
        <Icon className="shrink-0" size={14} />
        <span className="truncate font-medium text-foreground">
          {record.eyebrow ?? record.detailTitle}
        </span>
        <Button
          aria-label="Favorite record"
          className="size-7 rounded-full"
          size="icon"
          variant="ghost"
        >
          <RiStarLine />
        </Button>
        <Button
          aria-label="More record options"
          className="size-7 rounded-full"
          size="icon"
          variant="ghost"
        >
          <RiMoreLine />
        </Button>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <span className="hidden tabular-nums sm:inline">
          {position} / {total}
        </span>
        <Button
          aria-label="Previous record"
          className="size-7 rounded-full"
          size="icon"
          variant="ghost"
        >
          <RiArrowDownLine />
        </Button>
        <Button
          aria-label="Next record"
          className="size-7 rounded-full"
          size="icon"
          variant="ghost"
        >
          <RiArrowUpLine />
        </Button>
        <span className="mx-1 hidden h-5 w-px bg-border/60 sm:block" />
        <Button
          aria-label="Cycle records"
          className="size-7 rounded-full"
          size="icon"
          variant="ghost"
        >
          <RiArrowRightLine />
        </Button>
      </div>
    </header>
  );
}

function FilterSidebar({
  groups,
  activeGroup,
  basePath,
}: {
  groups: WorkspaceFilterGroup[];
  activeGroup?: WorkspaceFilterGroup;
  basePath: string;
}) {
  return (
    <div className="h-full overflow-auto rounded-lg bg-card p-3 shadow-sm ring-1 ring-black/5 dark:ring-white/6">
      <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-1 rounded-full bg-muted/25 p-0.5">
        {groups.map((group) => (
          <Button
            asChild
            className={cn(
              "h-8 min-w-0 rounded-full border-0 px-3 text-xs shadow-none",
              activeGroup?.title === group.title
                ? "bg-muted/60 text-foreground"
                : "bg-transparent text-muted-foreground hover:bg-muted/30",
            )}
            key={group.title}
            size="sm"
            variant="outline"
          >
            <Link href={getFilterHref(basePath, group.title)}>
              <span className="truncate">{group.title}</span>
            </Link>
          </Button>
        ))}
      </div>

      {activeGroup && (
        <div className="space-y-1 pt-1">
          {activeGroup.options.map((option) => (
            <button
              className={cn(
                "flex h-10 w-full items-center gap-3 rounded-md px-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground",
                option.active && "bg-muted/25 font-medium text-foreground",
              )}
              key={option.label}
              type="button"
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded-md text-primary">
                <span className="size-2 rounded-full bg-current" />
              </span>
              <span className="truncate">{option.label}</span>
              {getCountLabel(option.count)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailSectionCards({ record }: { record: WorkspaceRecord }) {
  const visibleSections = getVisibleSections(record);
  return (
    <div className="space-y-2">
      {visibleSections.map((section) => (
        <details
          className="group rounded-lg bg-muted/20 px-4 py-3"
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

function DetailSectionItem({ item }: { item: WorkspaceDetailItem }) {
  if (item.links && item.links.length > 0) {
    return (
      <div className="space-y-2 text-sm">
        <span className="text-muted-foreground">{item.label}</span>
        <div className="flex flex-wrap gap-1.5">
          {item.links.map((link) => (
            <Link
              className="inline-flex min-h-7 max-w-full items-center gap-2 rounded-md bg-muted/30 px-2 text-sm font-medium transition-colors hover:bg-muted/50 hover:text-foreground"
              href={link.href}
              key={`${link.href}-${link.label}`}
            >
              <span className="truncate">{link.label}</span>
              {isVisibleValue(link.meta) && (
                <span className="shrink-0 text-muted-foreground text-xs">
                  {link.meta}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{item.label}</span>
      <span className="max-w-44 text-right font-medium">{item.value}</span>
    </div>
  );
}

function DetailActions() {
  return (
    <div className="mb-2 flex justify-end gap-1">
      <Button
        aria-label="Copy record link"
        className="size-8 rounded-full bg-muted/30"
        size="icon"
        variant="ghost"
      >
        <RiLinksLine />
      </Button>
      <Button
        aria-label="Duplicate record"
        className="size-8 rounded-full bg-muted/30"
        size="icon"
        variant="ghost"
      >
        <RiFileCopyLine />
      </Button>
      <Button
        aria-label="Linked records"
        className="size-8 rounded-full bg-muted/30"
        size="icon"
        variant="ghost"
      >
        <RiGitBranchLine />
      </Button>
      <Button
        aria-label="More detail options"
        className="h-8 rounded-full bg-muted/30 px-2"
        size="sm"
        variant="ghost"
      >
        <RiFilter3Line />
        <RiArrowDownSLine />
      </Button>
    </div>
  );
}

function DetailSidebar({ record }: { record: WorkspaceRecord }) {
  return (
    <div className="p-3">
      <DetailActions />
      <DetailSectionCards record={record} />
    </div>
  );
}
