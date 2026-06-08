"use client";

import {
  RiArchiveLine,
  RiLinksLine,
  RiMoreLine,
  RiStarLine,
} from "@remixicon/react";
import { useRef, useState, useTransition } from "react";

import {
  type UpdateRecordTarget,
  updateRecordFieldAction,
} from "@/app/actions/records";
import {
  ActionTooltip,
  type ActionTooltipHandle,
} from "@/components/ui/action-tooltip";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  recordId: string;
  entity: "client" | "proposal" | "invoice" | "expense";
  archived: boolean;
};

export function DetailTopbarControls({ recordId, entity, archived }: Props) {
  const [open, setOpen] = useState(false);
  const [optimisticArchived, setOptimisticArchived] = useState(archived);
  const [isPending, startTransition] = useTransition();
  const copyTooltipRef = useRef<ActionTooltipHandle>(null);
  const optionsTooltipRef = useRef<ActionTooltipHandle>(null);

  // archive is only available for client/proposal/invoice
  const canArchive = entity !== "expense";

  function handleCopyId() {
    navigator.clipboard.writeText(recordId);
    copyTooltipRef.current?.complete();
  }

  function handleArchiveToggle() {
    setOpen(false);
    const next = !optimisticArchived;
    setOptimisticArchived(next);
    const target = {
      entity,
      id: Number(recordId),
      field: "archived",
    } as UpdateRecordTarget;
    optionsTooltipRef.current?.complete(next ? "Archived" : "Restored");
    startTransition(async () => {
      const result = await updateRecordFieldAction(target, String(next));

      if (!result.ok) {
        setOptimisticArchived(!next);
      }
    });
  }

  return (
    <>
      <ActionTooltip
        completedLabel="Copied ID"
        label="Copy ID"
        ref={copyTooltipRef}
      >
        <Button
          aria-label="Copy record ID"
          className="size-7 rounded-full"
          onClick={handleCopyId}
          size="icon"
          variant="ghost"
        >
          <RiLinksLine />
        </Button>
      </ActionTooltip>

      <Button
        aria-label="Favorite record"
        className="size-7 rounded-full"
        size="icon"
        variant="ghost"
      >
        <RiStarLine />
      </Button>

      <ActionTooltip
        completedLabel="Updated"
        label="Options"
        ref={optionsTooltipRef}
        side="bottom"
      >
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              aria-label="More record options"
              className="size-7 rounded-full"
              size="icon"
              variant="ghost"
            >
              <RiMoreLine />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={6}
            className="w-auto min-w-40 rounded-xl p-1 gap-0"
          >
            {canArchive && (
              <button
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                disabled={isPending}
                onClick={handleArchiveToggle}
                type="button"
              >
                <RiArchiveLine size={14} />
                {optimisticArchived ? "Unarchive" : "Archive"}
              </button>
            )}
          </PopoverContent>
        </Popover>
      </ActionTooltip>
    </>
  );
}
