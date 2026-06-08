"use client";

import { createContext, type ReactNode, useContext } from "react";

type DetailPropertiesContextValue = {
  shortcutScope: "inline" | "floating";
  isShortcutActive: () => boolean;
  runFieldShortcut: (focusField: () => void) => void;
  releaseFieldFocus: () => void;
};

const defaultValue: DetailPropertiesContextValue = {
  shortcutScope: "inline",
  isShortcutActive: () => true,
  runFieldShortcut: (focusField) => focusField(),
  releaseFieldFocus: () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  },
};

const DetailPropertiesContext =
  createContext<DetailPropertiesContextValue>(defaultValue);

export function DetailPropertiesProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: DetailPropertiesContextValue;
}) {
  return (
    <DetailPropertiesContext.Provider value={value}>
      {children}
    </DetailPropertiesContext.Provider>
  );
}

export function useDetailProperties() {
  return useContext(DetailPropertiesContext);
}
