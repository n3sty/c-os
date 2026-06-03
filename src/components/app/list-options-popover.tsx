"use client";

import {
  RiCalendarLine,
  RiCheckLine,
  RiDraggable,
  RiGroupLine,
  RiMoreLine,
  RiUserLine,
} from "@remixicon/react";
import { Popover } from "radix-ui";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxTriggerPill,
  ComboboxValue,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

type FilterGroup = { title: string };

type GroupingOption = {
  value: string;
  label: string;
  icon: React.ReactNode;
};

type OrderingOption = {
  value: string;
  label: string;
  icon: React.ReactNode;
};

const GROUPING_OPTIONS: GroupingOption[] = [
  { value: "none", label: "No grouping", icon: <RiCheckLine /> },
  { value: "status", label: "Status", icon: <RiGroupLine /> },
  { value: "assignee", label: "Assignee", icon: <RiUserLine /> },
];

const ORDERING_OPTIONS: OrderingOption[] = [
  { value: "manual", label: "Manual", icon: <RiDraggable /> },
  { value: "created", label: "Created date", icon: <RiCalendarLine /> },
  { value: "updated", label: "Updated date", icon: <RiCalendarLine /> },
];

export function ListOptionsPopover({
  filterGroups,
}: {
  filterGroups: FilterGroup[];
}) {
  const [grouping, setGrouping] = useState<GroupingOption>(GROUPING_OPTIONS[0]);
  const [ordering, setOrdering] = useState<OrderingOption>(ORDERING_OPTIONS[0]);
  const [activeProperties, setActiveProperties] = useState<Set<string>>(
    new Set(),
  );

  const allProperties = filterGroups.map((g) => g.title);

  function toggleProperty(label: string) {
    setActiveProperties((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button
          aria-label="More list options"
          className="size-8 rounded-full"
          size="icon"
          variant="ghost"
        >
          <RiMoreLine />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          className="z-50 w-72 rounded-xl border border-border/70 bg-card p-4 shadow-xl outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          sideOffset={6}
        >
          <div className="space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Grouping</span>
                <Combobox
                  autoHighlight
                  isItemEqualToValue={(item, v) => item.value === v.value}
                  items={GROUPING_OPTIONS}
                  itemToStringValue={(o) => o.label}
                  value={grouping}
                  onValueChange={(v) => v && setGrouping(v)}
                >
                  <ComboboxTriggerPill>
                    <ComboboxValue />
                  </ComboboxTriggerPill>
                  <ComboboxContent align="end" sideOffset={4}>
                    <ComboboxList<GroupingOption>>
                      {(option) => (
                        <ComboboxItem key={option.value} value={option}>
                          <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground">
                            {option.icon}
                          </span>
                          {option.label}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ordering</span>
                <Combobox
                  autoHighlight
                  isItemEqualToValue={(item, v) => item.value === v.value}
                  items={ORDERING_OPTIONS}
                  itemToStringValue={(o) => o.label}
                  value={ordering}
                  onValueChange={(v) => v && setOrdering(v)}
                >
                  <ComboboxTriggerPill>
                    <ComboboxValue />
                  </ComboboxTriggerPill>
                  <ComboboxContent align="end" sideOffset={4}>
                    <ComboboxList<OrderingOption>>
                      {(option) => (
                        <ComboboxItem key={option.value} value={option}>
                          <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground">
                            {option.icon}
                          </span>
                          {option.label}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            </div>

            {allProperties.length > 0 && (
              <div className="space-y-2 border-t border-border/50 pt-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Display properties
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {allProperties.map((label) => {
                    const active = activeProperties.has(label);
                    return (
                      <button
                        className={cn(
                          "inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-medium transition-colors",
                          active
                            ? "border-foreground/30 bg-muted/60 text-foreground"
                            : "border-border/60 bg-transparent text-muted-foreground hover:border-foreground/20 hover:text-foreground",
                        )}
                        key={label}
                        onClick={() => toggleProperty(label)}
                        type="button"
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border/50 pt-3 text-xs">
              <button
                className="text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => {
                  setGrouping(GROUPING_OPTIONS[0]);
                  setOrdering(ORDERING_OPTIONS[0]);
                  setActiveProperties(new Set());
                }}
                type="button"
              >
                Reset
              </button>
              <button
                className="font-medium text-primary transition-opacity hover:opacity-80"
                type="button"
              >
                Set default for everyone
              </button>
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
