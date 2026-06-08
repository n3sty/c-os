"use client";

import { RiSidebarFoldLine, RiSidebarUnfoldLine } from "@remixicon/react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DetailPropertiesProvider } from "@/components/app/detail-properties-context";
import { useKeyboardShortcut } from "@/components/app/keyboard-shortcut-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "coscience:detail-properties-open";

type FloatingDetailPropertiesProps = {
  children: ReactNode;
};

function isMacPlatform() {
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
}

export function FloatingDetailProperties({
  children,
}: FloatingDetailPropertiesProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pendingFocusRef = useRef<(() => void) | null>(null);
  const [open, setOpen] = useState(true);

  const isFloatingMode = useCallback(
    () => rootRef.current?.offsetParent !== null,
    [],
  );

  const updateOpen = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    window.localStorage.setItem(STORAGE_KEY, String(nextOpen));
  }, []);

  const releaseFieldFocus = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, []);

  const runFieldShortcut = useCallback(
    (focusField: () => void) => {
      pendingFocusRef.current = focusField;
      if (!open) {
        updateOpen(true);
        return;
      }

      requestAnimationFrame(() => {
        pendingFocusRef.current?.();
        pendingFocusRef.current = null;
      });
    },
    [open, updateOpen],
  );

  const contextValue = useMemo(
    () => ({
      shortcutScope: "floating" as const,
      isShortcutActive: isFloatingMode,
      runFieldShortcut,
      releaseFieldFocus,
    }),
    [isFloatingMode, releaseFieldFocus, runFieldShortcut],
  );

  useEffect(() => {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (storedValue !== null) {
      setOpen(storedValue === "true");
    }
  }, []);

  useEffect(() => {
    if (!open || !pendingFocusRef.current) return;

    const animationFrame = requestAnimationFrame(() => {
      pendingFocusRef.current?.();
      pendingFocusRef.current = null;
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [open]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        !open ||
        !(event.target instanceof Node) ||
        rootRef.current?.contains(event.target) ||
        (event.target instanceof Element &&
          event.target.closest("[data-slot=popover-content]"))
      ) {
        return;
      }

      updateOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (!open || event.key !== "Escape" || event.defaultPrevented) return;

      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLElement &&
        rootRef.current?.contains(activeElement)
      ) {
        event.preventDefault();
        event.stopPropagation();
        activeElement.blur();
        return;
      }

      event.preventDefault();
      updateOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, updateOpen]);

  useKeyboardShortcut({
    id: "detail-properties.toggle.mac",
    keys: { key: "s", modifiers: ["ctrl"] },
    allowInEditable: true,
    isActive: () => isFloatingMode() && isMacPlatform(),
    priority: 100,
    handler: () => updateOpen(!open),
  });

  useKeyboardShortcut({
    id: "detail-properties.toggle.windows",
    keys: { key: "s", modifiers: ["alt"] },
    allowInEditable: true,
    isActive: () => isFloatingMode() && !isMacPlatform(),
    priority: 100,
    handler: () => updateOpen(!open),
  });

  return (
    <div
      className="absolute top-14 right-3 z-30 block @6xl/detail:hidden"
      ref={rootRef}
    >
      <Button
        aria-controls="floating-detail-properties"
        aria-expanded={open}
        aria-label={open ? "Collapse properties" : "Expand properties"}
        aria-pressed={open}
        className="relative z-10 size-8 rounded-full bg-muted/30 text-muted-foreground shadow-md ring-1 ring-white/10 hover:bg-muted/50 hover:text-foreground"
        onClick={() => updateOpen(!open)}
        size="icon"
        type="button"
        variant="ghost"
      >
        {open ? <RiSidebarFoldLine /> : <RiSidebarUnfoldLine />}
      </Button>

      <div
        aria-hidden={!open}
        className={cn(
          "absolute top-10 right-0 max-h-[calc(100svh-7rem)] w-[min(20rem,calc(100cqw-1.5rem))] overflow-auto text-card-foreground transition-transform duration-200 ease-out motion-reduce:transition-none",
          open
            ? "translate-x-0"
            : "pointer-events-none translate-x-[calc(100%+1rem)]",
        )}
        id="floating-detail-properties"
        inert={!open}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <DetailPropertiesProvider value={contextValue}>
          {children}
        </DetailPropertiesProvider>
      </div>
    </div>
  );
}
