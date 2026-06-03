"use client";

import {
  RiArchiveLine,
  RiLinksLine,
  RiMoreLine,
  RiStarLine,
} from "@remixicon/react";
import { useState, useTransition } from "react";

import {
  type UpdateRecordTarget,
  updateRecordFieldAction,
} from "@/app/actions/records";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
  recordId: string;
  entity: "client" | "proposal" | "invoice" | "expense";
  archived: boolean;
};

export function DetailTopbarControls({ recordId, entity, archived }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [optimisticArchived, setOptimisticArchived] = useState(archived);
  const [, startTransition] = useTransition();

  // archive is only available for client/proposal/invoice
  const canArchive = entity !== "expense";

  function handleCopyId() {
    navigator.clipboard.writeText(recordId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
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
    startTransition(async () => {
      await updateRecordFieldAction(target, String(next));
    });
  }

  return (
    <>
      <Button
        aria-label={copied ? "ID copied" : "Copy record ID"}
        className="size-7 rounded-full"
        size="icon"
        variant="ghost"
        onClick={handleCopyId}
      >
        <RiLinksLine className={cn(copied && "text-foreground")} />
      </Button>

      <Button
        aria-label="Favorite record"
        className="size-7 rounded-full"
        size="icon"
        variant="ghost"
      >
        <RiStarLine />
      </Button>

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
              type="button"
              onClick={handleArchiveToggle}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <RiArchiveLine size={14} />
              {optimisticArchived ? "Unarchive" : "Archive"}
            </button>
          )}
        </PopoverContent>
      </Popover>
    </>
  );
}
