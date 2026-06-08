"use client";

import { RiCalendarLine } from "@remixicon/react";
import { format } from "date-fns";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  useTransition,
} from "react";

import {
  type UpdateRecordTarget,
  updateRecordFieldAction,
} from "@/app/actions/records";
import { useDetailProperties } from "@/components/app/detail-properties-context";
import { useKeyboardShortcut } from "@/components/app/keyboard-shortcut-provider";
import { Calendar } from "@/components/ui/calendar";
import { MoneyInput } from "@/components/ui/money-input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

export type PropertyFieldHandle = { focus: () => void };

export type SelectOption = { label: string; value: string };

// ─── shared save hook ────────────────────────────────────────────────────────

function useSaveField(target: UpdateRecordTarget) {
  const [, startTransition] = useTransition();
  const targetRef = useRef(target);
  targetRef.current = target;

  const save = useCallback((value: string) => {
    startTransition(async () => {
      await updateRecordFieldAction(targetRef.current, value);
    });
  }, []);

  return useDebounce(save, 600);
}

// ─── text input ──────────────────────────────────────────────────────────────

type PropertyTextFieldProps = {
  value: string;
  target: UpdateRecordTarget;
  shortcutKey?: string;
  shortcutId?: string;
  placeholder?: string;
  type?: "text" | "email" | "url" | "number";
};

export const PropertyTextField = forwardRef<
  PropertyFieldHandle,
  PropertyTextFieldProps
>(function PropertyTextField(
  {
    value: initialValue,
    target,
    shortcutKey,
    shortcutId,
    placeholder,
    type = "text",
  },
  ref,
) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedSave = useSaveField(target);
  const properties = useDetailProperties();

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  useKeyboardShortcut({
    id:
      shortcutId ??
      `detail-field-${properties.shortcutScope}-${target.entity}-${target.id}-${target.field}`,
    keys: { key: shortcutKey ?? "" },
    enabled: Boolean(shortcutKey),
    allowInEditable: false,
    isActive: () =>
      properties.isShortcutActive() &&
      (properties.shortcutScope === "floating" ||
        inputRef.current?.offsetParent !== null),
    priority: 80,
    handler: () => properties.runFieldShortcut(() => inputRef.current?.focus()),
  });

  return (
    <input
      ref={inputRef}
      aria-label={String(target.field)}
      className="min-w-0 w-full max-w-44 rounded bg-transparent px-1 text-right text-sm font-medium outline-none transition-colors placeholder:text-muted-foreground/50 hover:bg-muted/30 hover:text-foreground focus:bg-muted/40 focus:text-foreground"
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        debouncedSave(e.target.value);
      }}
      onKeyDown={(e) => {
        switch (e.key) {
          case "Enter":
          case "Escape":
            e.preventDefault();
            e.stopPropagation();
            properties.releaseFieldFocus();
            break;
        }
      }}
    />
  );
});

type PropertyMoneyFieldProps = {
  value: string;
  target: UpdateRecordTarget;
  shortcutKey?: string;
};

export const PropertyMoneyField = forwardRef<
  PropertyFieldHandle,
  PropertyMoneyFieldProps
>(function PropertyMoneyField({ value, target, shortcutKey }, ref) {
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedSave = useSaveField(target);
  const properties = useDetailProperties();

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  useKeyboardShortcut({
    id: `detail-field-${properties.shortcutScope}-${target.entity}-${target.id}-${target.field}`,
    keys: { key: shortcutKey ?? "" },
    enabled: Boolean(shortcutKey),
    allowInEditable: false,
    isActive: () =>
      properties.isShortcutActive() &&
      (properties.shortcutScope === "floating" ||
        inputRef.current?.offsetParent !== null),
    priority: 80,
    handler: () => properties.runFieldShortcut(() => inputRef.current?.focus()),
  });

  return (
    <MoneyInput
      ref={inputRef}
      aria-label={String(target.field)}
      className="min-w-0 w-full max-w-44 rounded border-0 bg-transparent px-1 text-right text-sm font-medium shadow-none hover:bg-muted/30 hover:text-foreground focus:bg-muted/40 focus:text-foreground focus-visible:ring-0"
      defaultValue={value}
      onChange={(event) => debouncedSave(event.currentTarget.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          properties.releaseFieldFocus();
        }
      }}
    />
  );
});

// ─── select (dropdown) ───────────────────────────────────────────────────────

type PropertySelectFieldProps = {
  value: string;
  options: SelectOption[];
  target: UpdateRecordTarget;
  shortcutKey?: string;
  shortcutId?: string;
};

export const PropertySelectField = forwardRef<
  PropertyFieldHandle,
  PropertySelectFieldProps
>(function PropertySelectField(
  { value: initialValue, options, target, shortcutKey, shortcutId },
  ref,
) {
  const [value, setValue] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();
  const properties = useDetailProperties();

  const currentLabel = options.find((o) => o.value === value)?.label ?? value;
  const currentIndex = options.findIndex((o) => o.value === value);

  useImperativeHandle(ref, () => ({
    focus: () => {
      triggerRef.current?.focus();
      setOpen(true);
    },
  }));

  useKeyboardShortcut({
    id:
      shortcutId ??
      `detail-field-${properties.shortcutScope}-${target.entity}-${target.id}-${target.field}`,
    keys: { key: shortcutKey ?? "" },
    enabled: Boolean(shortcutKey),
    allowInEditable: false,
    isActive: () =>
      properties.isShortcutActive() &&
      (properties.shortcutScope === "floating" ||
        triggerRef.current?.offsetParent !== null),
    priority: 80,
    handler: () => {
      properties.runFieldShortcut(() => {
        triggerRef.current?.focus();
        setOpen(true);
      });
    },
  });

  function handleOpen(next: boolean) {
    setOpen(next);
    if (next) setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
    else setFocusedIndex(-1);
  }

  function handleSelect(option: SelectOption) {
    setValue(option.value);
    setOpen(false);
    setFocusedIndex(-1);
    startTransition(async () => {
      await updateRecordFieldAction(target, option.value);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && options[focusedIndex]) {
          handleSelect(options[focusedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        properties.releaseFieldFocus();
        break;
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <button
          ref={triggerRef}
          className="min-w-0 max-w-44 truncate rounded px-1 text-right text-sm font-medium outline-none transition-colors hover:bg-muted/30 hover:text-foreground focus:bg-muted/40 focus:text-foreground"
          type="button"
          onKeyDown={handleKeyDown}
        >
          {currentLabel}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-auto min-w-36 gap-0 rounded-xl p-1"
        sideOffset={6}
      >
        <div
          ref={listRef}
          role="listbox"
          aria-label="Select option"
          onKeyDown={handleKeyDown}
        >
          {options.map((option, i) => (
            <button
              key={option.value}
              aria-selected={option.value === value}
              data-focused={i === focusedIndex || undefined}
              role="option"
              type="button"
              onClick={() => handleSelect(option)}
              className={cn(
                "flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                option.value === value && "font-medium text-foreground",
                i === focusedIndex && "bg-accent text-accent-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
});

// ─── date picker ─────────────────────────────────────────────────────────────

function parseLocalDate(value?: string) {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

type PropertyDateFieldProps = {
  value: string;
  target: UpdateRecordTarget;
  shortcutKey?: string;
  shortcutId?: string;
};

export const PropertyDateField = forwardRef<
  PropertyFieldHandle,
  PropertyDateFieldProps
>(function PropertyDateField(
  { value: initialValue, target, shortcutKey, shortcutId },
  ref,
) {
  const [date, setDate] = useState<Date | undefined>(() =>
    parseLocalDate(initialValue),
  );
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [, startTransition] = useTransition();
  const properties = useDetailProperties();

  useImperativeHandle(ref, () => ({
    focus: () => {
      triggerRef.current?.focus();
      setOpen(true);
    },
  }));

  useKeyboardShortcut({
    id:
      shortcutId ??
      `detail-field-${properties.shortcutScope}-${target.entity}-${target.id}-${target.field}`,
    keys: { key: shortcutKey ?? "" },
    enabled: Boolean(shortcutKey),
    allowInEditable: false,
    isActive: () =>
      properties.isShortcutActive() &&
      (properties.shortcutScope === "floating" ||
        triggerRef.current?.offsetParent !== null),
    priority: 80,
    handler: () => {
      properties.runFieldShortcut(() => {
        triggerRef.current?.focus();
        setOpen(true);
      });
    },
  });

  function handleSelect(nextDate: Date | undefined) {
    if (!nextDate) return;
    setDate(nextDate);
    setOpen(false);
    const iso = format(nextDate, "yyyy-MM-dd");
    startTransition(async () => {
      await updateRecordFieldAction(target, iso);
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={triggerRef}
          className="inline-flex max-w-44 items-center gap-1.5 truncate rounded px-1 text-right text-sm font-medium outline-none transition-colors hover:bg-muted/30 hover:text-foreground focus:bg-muted/40 focus:text-foreground"
          type="button"
        >
          <RiCalendarLine className="shrink-0 opacity-40" size={13} />
          {date ? (
            format(date, "MMM d, yyyy")
          ) : (
            <span className="text-muted-foreground/50">Pick a date</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-auto gap-0 rounded-xl p-0"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
            properties.releaseFieldFocus();
          }
        }}
        sideOffset={6}
      >
        <Calendar
          autoFocus
          mode="single"
          selected={date}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
});
