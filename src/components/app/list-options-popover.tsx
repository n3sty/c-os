"use client";

import { RiArrowUpDownLine, RiMoreLine } from "@remixicon/react";
import { Popover } from "radix-ui";
import type { WorkspaceSortOption } from "@/components/app/record-workspace";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxTriggerPill,
  ComboboxValue,
} from "@/components/ui/combobox";

export function ListOptionsPopover({
  onSortChange,
  selectedSort,
  sortOptions,
}: {
  onSortChange: (sort: WorkspaceSortOption) => void;
  selectedSort: WorkspaceSortOption;
  sortOptions: WorkspaceSortOption[];
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button
          aria-label="Sort records"
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
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Sort by</span>
            <Combobox
              autoHighlight
              isItemEqualToValue={(item, value) => item.value === value.value}
              items={sortOptions}
              itemToStringValue={(option) => option.label}
              onValueChange={(option) => option && onSortChange(option)}
              value={selectedSort}
            >
              <ComboboxTriggerPill>
                <ComboboxValue />
              </ComboboxTriggerPill>
              <ComboboxContent align="end" sideOffset={4}>
                <ComboboxList<WorkspaceSortOption>>
                  {(option) => (
                    <ComboboxItem key={option.value} value={option}>
                      <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground">
                        <RiArrowUpDownLine />
                      </span>
                      {option.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
