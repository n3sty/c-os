"use client";

import { createContext, useContext } from "react";

const RecordFocusContext = createContext<(() => void) | null>(null);

export const RecordFocusProvider = RecordFocusContext.Provider;

export function useRecordFocus() {
  return useContext(RecordFocusContext);
}
