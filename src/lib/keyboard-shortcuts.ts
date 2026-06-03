import type { KeyboardEvent as ReactKeyboardEvent } from "react";

export type ShortcutModifier = "ctrl" | "meta" | "alt" | "shift" | "mod";

export type KeyboardShortcutBinding = {
  key: string;
  modifiers?: ShortcutModifier[];
};

export type KeyboardShortcutDefinition = {
  id: string;
  label?: string;
  keys: KeyboardShortcutBinding;
};

const modifierLabels: Record<ShortcutModifier, string> = {
  ctrl: "Ctrl",
  meta: "Cmd",
  alt: "Alt",
  shift: "Shift",
  mod: getPlatformModLabel(),
};

const keyLabels: Record<string, string> = {
  " ": "Space",
  arrowdown: "Down",
  arrowleft: "Left",
  arrowright: "Right",
  arrowup: "Up",
  backspace: "Backspace",
  delete: "Delete",
  enter: "Enter",
  escape: "Esc",
  tab: "Tab",
};

export function normalizeShortcutKey(key: string) {
  return key.length === 1 ? key.toLowerCase() : key.toLowerCase();
}

export function isEditableShortcutTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  const tagName = target.tagName.toLowerCase();
  return tagName === "input" || tagName === "textarea" || tagName === "select";
}

export function eventMatchesShortcut(
  event: KeyboardEvent | ReactKeyboardEvent,
  binding: KeyboardShortcutBinding,
) {
  const modifiers = new Set(binding.modifiers ?? []);
  const expectedKey = normalizeShortcutKey(binding.key);
  const actualKey = normalizeShortcutKey(event.key);

  if (expectedKey !== actualKey) {
    return false;
  }

  const expectsMod = modifiers.has("mod");
  const expectsCtrl = modifiers.has("ctrl");
  const expectsMeta = modifiers.has("meta");
  const expectsAlt = modifiers.has("alt");
  const expectsShift = modifiers.has("shift");

  if (expectsMod && !event.ctrlKey && !event.metaKey) {
    return false;
  }

  if (!expectsMod && event.ctrlKey !== expectsCtrl) {
    return false;
  }

  if (!expectsMod && event.metaKey !== expectsMeta) {
    return false;
  }

  if (event.altKey !== expectsAlt) {
    return false;
  }

  if (event.shiftKey !== expectsShift) {
    return false;
  }

  return true;
}

export function formatShortcut(binding: KeyboardShortcutBinding) {
  return [
    ...(binding.modifiers ?? []).map((modifier) => modifierLabels[modifier]),
    getKeyLabel(binding.key),
  ];
}

function getKeyLabel(key: string) {
  const normalizedKey = normalizeShortcutKey(key);
  return keyLabels[normalizedKey] ?? key.toUpperCase();
}

function getPlatformModLabel() {
  if (typeof navigator === "undefined") {
    return "Ctrl";
  }

  return /Mac|iPhone|iPad|iPod/.test(navigator.platform) ? "Cmd" : "Ctrl";
}
