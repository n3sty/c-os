"use client";

import { createContext, type ReactNode, useContext } from "react";

import { emptyOptionsContext, type FormOptionsContext } from "@/lib/creation";

const FormOptionsCtx = createContext<FormOptionsContext>(emptyOptionsContext);

export function FormOptionsProvider({
  value,
  children,
}: {
  value?: FormOptionsContext;
  children: ReactNode;
}) {
  return (
    <FormOptionsCtx value={value ?? emptyOptionsContext}>
      {children}
    </FormOptionsCtx>
  );
}

export function useFormOptions(): FormOptionsContext {
  return useContext(FormOptionsCtx);
}
