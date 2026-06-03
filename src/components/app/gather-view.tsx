"use client";

import {
  RiCloseLine,
  RiEqualizerLine,
  RiSidebarUnfoldLine,
} from "@remixicon/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { ListOptionsPopover } from "@/components/app/list-options-popover";
import type { WorkspaceRecord } from "@/components/app/record-workspace";
import { Button } from "@/components/ui/button";
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

type GatherViewProps = {
  topbar: ReactNode;
  basePath: string;
  sidebarOpen: boolean;
  initialFilterGroup?: string;
  emptyLabel: string;
  filters: WorkspaceFilter[];
  filterGroups: WorkspaceFilterGroup[];
  records: WorkspaceRecord[];
};

function getCountLabel(count?: number) {
  return typeof count === "number" ? (
    <span className="ml-auto text-muted-foreground tabular-nums">{count}</span>
  ) : null;
}

function isVisibleValue(value: ReactNode) {
  return value !== null && value !== undefined && value !== "";
}

export function GatherView({
  topbar,
  basePath,
  sidebarOpen: initialSidebarOpen,
  initialFilterGroup,
  emptyLabel,
  filters,
  filterGroups,
  records,
}: GatherViewProps) {
  const defaultView = filters.find((f) => f.active)?.label ?? filters[0]?.label;
  const [activeView, setActiveView] = useState<string>(defaultView ?? "");
  const [activeGroupOptions, setActiveGroupOptions] = useState<Set<string>>(
    new Set(),
  );
  const [activeGroupTitle, setActiveGroupTitle] = useState<string>(
    initialFilterGroup ?? filterGroups[0]?.title ?? "",
  );
  const [sidebarOpen, setSidebarOpen] = useState(initialSidebarOpen);

  const visibleFilterGroups = filterGroups
    .map((group) => ({
      ...group,
      options: group.options.filter((option) => option.count !== 0),
    }))
    .filter((group) => group.options.length > 0);

  const activeGroup =
    visibleFilterGroups.find((g) => g.title === activeGroupTitle) ??
    visibleFilterGroups[0];

  function toggleGroupOption(label: string) {
    setActiveGroupOptions((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  const filteredRecords = records.filter((record) => {
    const passesView =
      !activeView ||
      activeView === "All" ||
      record.filterKeys?.includes(activeView);

    const passesGroup =
      activeGroupOptions.size === 0 ||
      (record.group !== undefined && activeGroupOptions.has(record.group));

    return passesView && passesGroup;
  });

  return (
    <div className="grid min-h-[calc(100svh-2rem)] grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden rounded-lg bg-card">
      {topbar}

      <div className="flex min-h-11 items-center justify-between gap-2 px-2 py-1.5 sm:px-3">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {filters.map((filter) => (
            <button
              className={cn(
                "inline-flex h-8 shrink-0 items-center gap-2 rounded-full px-3 text-sm text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground",
                filter.label === activeView &&
                  "bg-muted/50 font-medium text-foreground",
              )}
              key={filter.label}
              onClick={() => setActiveView(filter.label)}
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
          <ListOptionsPopover filterGroups={filterGroups} />
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
            className="size-8 rounded-full"
            onClick={() => setSidebarOpen((v) => !v)}
            size="icon"
            type="button"
            variant={sidebarOpen ? "secondary" : "ghost"}
          >
            {sidebarOpen ? <RiCloseLine /> : <RiSidebarUnfoldLine />}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "grid min-h-0 overflow-hidden",
          sidebarOpen
            ? "xl:grid-cols-[minmax(0,1fr)_320px]"
            : "xl:grid-cols-[minmax(0,1fr)]",
        )}
      >
        <main className="min-w-0 overflow-hidden">
          <section className="h-full min-h-0 overflow-hidden">
            <div className="h-full overflow-auto">
              {filteredRecords.length > 0 ? (
                <div className="px-1 py-1">
                  {filteredRecords.map((record) => (
                    <div
                      className="group grid min-h-10 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted/25 sm:px-3"
                      key={record.id}
                    >
                      <Link
                        className="flex min-w-0 items-center gap-2.5"
                        href={`${basePath}?record=${record.id}`}
                      >
                        {record.indicator && (
                          <div className="flex size-4 shrink-0 items-center justify-center text-muted-foreground/60">
                            {record.indicator}
                          </div>
                        )}
                        <div className="min-w-0 md:flex md:items-center md:gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            {record.eyebrow && (
                              <span className="shrink-0 font-mono text-xs text-muted-foreground/70">
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
                      </Link>

                      <div className="hidden min-w-0 items-center justify-end gap-1.5 md:flex">
                        {record.tags
                          ?.filter(isVisibleValue)
                          .map((tag, index) => (
                            <span key={`${record.id}-tag-${index}`}>{tag}</span>
                          ))}
                        {record.meta
                          ?.filter(isVisibleValue)
                          .map((item, index) => (
                            <span
                              className="shrink-0 text-muted-foreground/70 text-xs tabular-nums"
                              key={`${record.id}-meta-${index}`}
                            >
                              {item}
                            </span>
                          ))}
                        {record.actions
                          ?.filter(isVisibleValue)
                          .map((action, index) => (
                            <span key={`${record.id}-action-${index}`}>
                              {action}
                            </span>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-72 items-center justify-center px-8 text-center text-base text-muted-foreground">
                  {emptyLabel}
                </div>
              )}
            </div>
          </section>
        </main>

        {sidebarOpen && (
          <aside className="hidden min-h-0 p-2 pl-1.5 xl:block">
            <div className="h-full overflow-auto rounded-lg bg-card/90 p-3 shadow-md ring-1 ring-white/10 dark:bg-muted/15 dark:ring-white/10">
              <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-1 rounded-full bg-muted/25 p-0.5">
                {visibleFilterGroups.map((group) => (
                  <button
                    className={cn(
                      "h-8 min-w-0 truncate rounded-full border-0 px-3 text-xs shadow-none transition-colors",
                      activeGroup?.title === group.title
                        ? "bg-muted/60 text-foreground"
                        : "bg-transparent text-muted-foreground hover:bg-muted/30",
                    )}
                    key={group.title}
                    onClick={() => setActiveGroupTitle(group.title)}
                    type="button"
                  >
                    {group.title}
                  </button>
                ))}
              </div>

              {activeGroup && (
                <div className="space-y-1 pt-1">
                  {activeGroup.options.map((option) => {
                    const isActive = activeGroupOptions.has(option.label);
                    return (
                      <button
                        className={cn(
                          "flex h-10 w-full items-center gap-3 rounded-md px-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground",
                          isActive && "bg-muted/25 font-medium text-foreground",
                        )}
                        key={option.label}
                        onClick={() => toggleGroupOption(option.label)}
                        type="button"
                      >
                        <span
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded-md",
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground/40",
                          )}
                        >
                          <span className="size-2 rounded-full bg-current" />
                        </span>
                        <span className="truncate">{option.label}</span>
                        {getCountLabel(option.count)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
