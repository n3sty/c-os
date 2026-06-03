"use client";

import {
  RiArchiveLine,
  RiCheckLine,
  RiDraftLine,
  RiSendPlaneLine,
  RiTimeLine,
} from "@remixicon/react";
import { useState, useTransition } from "react";

import {
  archiveInvoiceAction,
  setInvoiceStatusAction,
} from "@/app/actions/records";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxTriggerPill,
  ComboboxValue,
} from "@/components/ui/combobox";
import type { InvoiceStatus } from "@/lib/database";

type StatusOption = {
  value: Exclude<InvoiceStatus, "void">;
  label: string;
  icon: React.ReactNode;
};

const STATUS_OPTIONS: StatusOption[] = [
  { value: "draft", label: "Draft", icon: <RiDraftLine /> },
  { value: "sent", label: "Sent", icon: <RiSendPlaneLine /> },
  { value: "paid", label: "Paid", icon: <RiCheckLine /> },
  { value: "overdue", label: "Overdue", icon: <RiTimeLine /> },
];

export function InvoiceStatusPicker({
  invoiceId,
  status,
}: {
  invoiceId: number;
  status: Exclude<InvoiceStatus, "void">;
}) {
  const [value, setValue] = useState<StatusOption>(
    () => STATUS_OPTIONS.find((o) => o.value === status) ?? STATUS_OPTIONS[0],
  );
  const [isPending, startTransition] = useTransition();

  return (
    <Combobox
      autoHighlight
      isItemEqualToValue={(item, v) => item.value === v.value}
      items={STATUS_OPTIONS}
      itemToStringValue={(o) => o.label}
      value={value}
      onValueChange={(v) => {
        if (!v) {
          return;
        }

        const previousValue = value;
        setValue(v);
        startTransition(async () => {
          const result = await setInvoiceStatusAction(invoiceId, v.value);

          if (!result.ok) {
            setValue(previousValue);
          }
        });
      }}
    >
      <ComboboxTriggerPill
        aria-busy={isPending}
        onClick={(e) => e.stopPropagation()}
      >
        <ComboboxValue />
      </ComboboxTriggerPill>
      <ComboboxContent align="end" sideOffset={4}>
        <ComboboxList<StatusOption>>
          {(option) => (
            <ComboboxItem key={option.value} value={option}>
              <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground">
                {option.icon}
              </span>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export function InvoiceArchiveButton({
  archived: initialArchived,
  invoiceId,
}: {
  archived: boolean;
  invoiceId: number;
}) {
  const [archived, setArchived] = useState(initialArchived);
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      aria-pressed={archived}
      disabled={isPending}
      onClick={(event) => {
        event.stopPropagation();
        const nextValue = !archived;
        setArchived(nextValue);
        startTransition(async () => {
          const result = await archiveInvoiceAction(invoiceId, nextValue);

          if (!result.ok) {
            setArchived(!nextValue);
          }
        });
      }}
      type="button"
      variant="pill"
    >
      <RiArchiveLine />
      {archived ? "Archived" : "Archive"}
    </Button>
  );
}
