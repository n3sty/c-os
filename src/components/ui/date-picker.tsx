"use client";

import { RiArrowDownSLine } from "@remixicon/react";
import { format } from "date-fns";
import type * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type CreationDatePickerProps = {
  id?: string;
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  icon?: React.ComponentType<{ className?: string; size?: string | number }>;
  className?: string;
  shortcutKey?: string;
  portalContainer?: HTMLElement | null;
  onRegisterHandle?: (handle: { open: () => void } | null) => void;
  onOpenChange?: (isOpen: boolean) => void;
};

function parseLocalDate(value?: string) {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day);
}

function toDateInputValue(date?: Date) {
  return date ? format(date, "yyyy-MM-dd") : "";
}

export function CreationDatePicker({
  id,
  name,
  label,
  defaultValue,
  placeholder,
  required,
  icon: Icon,
  className,
  shortcutKey,
  portalContainer,
  onRegisterHandle,
  onOpenChange,
}: CreationDatePickerProps) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);
      onOpenChange?.(isOpen);
    },
    [onOpenChange],
  );
  const [date, setDate] = useState<Date | undefined>(() =>
    parseLocalDate(defaultValue),
  );
  const value = toDateInputValue(date);

  useEffect(() => {
    if (!onRegisterHandle) return;
    onRegisterHandle({ open: () => handleOpenChange(true) });
    return () => onRegisterHandle(null);
  }, [handleOpenChange, onRegisterHandle]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <input name={name} required={required} type="hidden" value={value} />
      <PopoverTrigger asChild>
        <Button
          aria-label={label}
          className={cn(
            "h-8 max-w-full rounded-full border border-border/55 bg-muted/35 px-2.5 text-muted-foreground text-sm hover:bg-muted/45 hover:text-foreground data-[state=open]:border-ring/60 data-[state=open]:bg-muted/50",
            className,
          )}
          id={id}
          ref={triggerRef}
          type="button"
          variant="ghost"
        >
          {Icon && <Icon className="shrink-0" size={14} />}
          <span className="min-w-0 truncate">
            {date ? format(date, "MMM d, yyyy") : (placeholder ?? label)}
          </span>
          <RiArrowDownSLine className="pointer-events-none size-3 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto gap-0 rounded-lg border border-border/70 p-0 shadow-xl"
        portalContainer={portalContainer}
        sideOffset={8}
      >
        {shortcutKey && (
          <div className="flex items-center justify-between border-border/50 border-b px-3 py-2">
            <span className="text-muted-foreground text-xs">Pick a date</span>
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded bg-muted/70 px-1.5 font-mono text-[11px] text-muted-foreground leading-none shadow-inner">
              {shortcutKey.toUpperCase()}
            </span>
          </div>
        )}
        <Calendar
          autoFocus
          mode="single"
          selected={date}
          onSelect={(nextDate) => {
            if (nextDate) {
              setDate(nextDate);
              handleOpenChange(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
