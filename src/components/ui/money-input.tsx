"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { completeMoney } from "@/lib/money";

type MoneyInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "defaultValue" | "type"
> & {
  defaultValue?: string | number;
};

export function MoneyInput({
  defaultValue = "",
  onBlur,
  onChange,
  ...props
}: MoneyInputProps) {
  const [value, setValue] = useState(String(defaultValue));

  return (
    <Input
      {...props}
      inputMode="decimal"
      type="text"
      value={value}
      onBlur={(event) => {
        setValue(completeMoney(event.currentTarget.value));
        onBlur?.(event);
      }}
      onChange={(event) => {
        setValue(event.currentTarget.value);
        onChange?.(event);
      }}
    />
  );
}
