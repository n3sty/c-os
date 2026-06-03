import type { ReactNode } from "react";

import {
  formatShortcut,
  type KeyboardShortcutDefinition,
} from "@/lib/keyboard-shortcuts";
import { cn } from "@/lib/utils";

type KeyboardShortcutHintProps = {
  shortcut: KeyboardShortcutDefinition;
  className?: string;
};

type KeyboardShortcutInstructionsProps = {
  shortcuts: KeyboardShortcutDefinition[];
  className?: string;
};

export function KeyboardShortcutInstructions({
  shortcuts,
  className,
}: KeyboardShortcutInstructionsProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      {shortcuts.map((shortcut) => (
        <KeyboardShortcutHint key={shortcut.id} shortcut={shortcut} />
      ))}
    </div>
  );
}

export function KeyboardShortcutHint({
  shortcut,
  className,
}: KeyboardShortcutHintProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 text-muted-foreground text-xs",
        className,
      )}
    >
      <ShortcutKeySequence shortcut={shortcut} />
      {shortcut.label && (
        <span className="min-w-0 truncate text-foreground/85">
          {shortcut.label}
        </span>
      )}
    </div>
  );
}

export function ShortcutKeySequence({
  shortcut,
}: {
  shortcut: KeyboardShortcutDefinition;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      {formatShortcut(shortcut.keys).map((key) => (
        <ShortcutKeycap key={`${shortcut.id}-${key}`}>{key}</ShortcutKeycap>
      ))}
    </span>
  );
}

export function ShortcutKeycap({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded bg-muted/70 px-1.5 font-mono text-[11px] text-muted-foreground leading-none shadow-inner">
      {children}
    </kbd>
  );
}
