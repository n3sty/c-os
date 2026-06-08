"use client";

import {
  RiArrowDownSLine,
  RiFileCopyLine,
  RiFilter3Line,
  RiLinksLine,
} from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useRef } from "react";

import {
  ActionTooltip,
  type ActionTooltipHandle,
} from "@/components/ui/action-tooltip";
import { Button } from "@/components/ui/button";

type Entity = "client" | "proposal" | "invoice" | "expense";

type Props = {
  entity: Entity;
  recordId: string;
  basePath: string;
};

export function DetailSidebarActions({ entity, recordId, basePath }: Props) {
  const copyTooltipRef = useRef<ActionTooltipHandle>(null);
  const router = useRouter();

  function handleCopyId() {
    navigator.clipboard.writeText(recordId);
    copyTooltipRef.current?.complete();
  }

  function handleDuplicate() {
    router.push(`${basePath}?record=${recordId}&create=${entity}`);
  }

  return (
    <div className="mb-2 flex justify-end gap-1">
      <ActionTooltip
        completedLabel="Copied ID"
        label="Copy ID"
        ref={copyTooltipRef}
      >
        <Button
          aria-label="Copy record ID"
          className="size-8 rounded-full bg-muted/30"
          onClick={handleCopyId}
          size="icon"
          variant="ghost"
        >
          <RiLinksLine />
        </Button>
      </ActionTooltip>
      <Button
        aria-label="Duplicate record"
        className="size-8 rounded-full bg-muted/30"
        onClick={handleDuplicate}
        size="icon"
        variant="ghost"
      >
        <RiFileCopyLine />
      </Button>
      <Button
        aria-label="More detail options"
        className="h-8 rounded-full bg-muted/30 px-2"
        size="sm"
        variant="ghost"
      >
        <RiFilter3Line />
        <RiArrowDownSLine />
      </Button>
    </div>
  );
}
