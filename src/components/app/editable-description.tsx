"use client";

import { useCallback, useState, useTransition } from "react";

import { updateRecordDescriptionAction } from "@/app/actions/records";
import { useRecordFocus } from "@/components/app/record-focus-context";
import { useDebounce } from "@/hooks/use-debounce";

export type EditableDescriptionSaveTarget = {
  entityType: "client" | "proposal" | "expense";
  id: number;
};

type Props = {
  value: string;
  saveTarget: EditableDescriptionSaveTarget;
};

export function EditableDescription({
  value: initialValue,
  saveTarget,
}: Props) {
  const [value, setValue] = useState(initialValue);
  const [, startTransition] = useTransition();
  const focusTitle = useRecordFocus();

  const persist = useCallback(
    (text: string) => {
      startTransition(async () => {
        await updateRecordDescriptionAction(
          saveTarget.entityType,
          saveTarget.id,
          text,
        );
      });
    },
    [saveTarget.entityType, saveTarget.id],
  );

  const debouncedPersist = useDebounce(persist, 600);

  return (
    <textarea
      aria-label="Record description"
      className="-mx-2 min-h-28 w-full resize-y rounded-md border-0 bg-transparent px-2 py-2 text-base leading-7 text-muted-foreground outline-none transition-colors duration-150 hover:bg-muted/20 focus:bg-muted/25 focus:text-foreground"
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        debouncedPersist(e.target.value);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.currentTarget.blur();
          focusTitle?.();
        }
      }}
    />
  );
}
