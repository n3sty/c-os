"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

import {
  eventMatchesShortcut,
  isEditableShortcutTarget,
  type KeyboardShortcutBinding,
} from "@/lib/keyboard-shortcuts";

type KeyboardShortcutHandler = (event: KeyboardEvent) => void;

export type KeyboardShortcutRegistration = {
  id: string;
  label?: string;
  keys: KeyboardShortcutBinding;
  handler: KeyboardShortcutHandler;
  enabled?: boolean;
  allowInEditable?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  priority?: number;
  isActive?: () => boolean;
};

type KeyboardShortcutContextValue = {
  registerShortcut: (shortcut: KeyboardShortcutRegistration) => () => void;
};

const KeyboardShortcutContext =
  createContext<KeyboardShortcutContextValue | null>(null);

type KeyboardShortcutProviderProps = {
  children: ReactNode;
};

export function KeyboardShortcutProvider({
  children,
}: KeyboardShortcutProviderProps) {
  const shortcutsRef = useRef(new Map<string, KeyboardShortcutRegistration>());

  const registerShortcut = useCallback(
    (shortcut: KeyboardShortcutRegistration) => {
      shortcutsRef.current.set(shortcut.id, shortcut);

      return () => {
        shortcutsRef.current.delete(shortcut.id);
      };
    },
    [],
  );

  useEffect(() => {
    function handleDismissAlias(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.repeat ||
        event.key.toLowerCase() !== "q" ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        isEditableShortcutTarget(event.target)
      ) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      event.target?.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Escape",
          code: "Escape",
          bubbles: true,
          cancelable: true,
          composed: true,
        }),
      );
    }

    document.addEventListener("keydown", handleDismissAlias, true);

    return () => {
      document.removeEventListener("keydown", handleDismissAlias, true);
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const shortcuts = [...shortcutsRef.current.values()]
        .filter(
          (shortcut) =>
            shortcut.enabled !== false && shortcut.isActive?.() !== false,
        )
        .sort((left, right) => (right.priority ?? 0) - (left.priority ?? 0));

      for (const shortcut of shortcuts) {
        const editableTarget = isEditableShortcutTarget(event.target);

        if (editableTarget && !shortcut.allowInEditable) {
          continue;
        }

        if (!eventMatchesShortcut(event, shortcut.keys)) {
          continue;
        }

        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }

        if (shortcut.stopPropagation) {
          event.stopPropagation();
        }

        shortcut.handler(event);
        return;
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const value = useMemo(
    () => ({
      registerShortcut,
    }),
    [registerShortcut],
  );

  return (
    <KeyboardShortcutContext.Provider value={value}>
      {children}
    </KeyboardShortcutContext.Provider>
  );
}

export function useKeyboardShortcut(shortcut: KeyboardShortcutRegistration) {
  const context = useContext(KeyboardShortcutContext);
  const handlerRef = useRef(shortcut.handler);
  const {
    id,
    label,
    keys,
    enabled,
    allowInEditable,
    preventDefault,
    stopPropagation,
    priority,
    isActive,
  } = shortcut;
  useEffect(() => {
    handlerRef.current = shortcut.handler;
  }, [shortcut.handler]);

  useEffect(() => {
    if (!context) {
      throw new Error(
        "useKeyboardShortcut must be used within KeyboardShortcutProvider.",
      );
    }

    return context.registerShortcut({
      id,
      label,
      keys,
      enabled,
      allowInEditable,
      preventDefault,
      stopPropagation,
      priority,
      isActive,
      handler: (event) => handlerRef.current(event),
    });
  }, [
    context,
    id,
    label,
    keys,
    enabled,
    allowInEditable,
    preventDefault,
    stopPropagation,
    priority,
    isActive,
  ]);
}
