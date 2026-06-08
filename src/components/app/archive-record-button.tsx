"use client";

import { RiArchiveLine, RiInboxUnarchiveLine } from "@remixicon/react";
import { useRef, useState, useTransition } from "react";

import { archiveRecordAction } from "@/app/actions/records";
import {
  ActionTooltip,
  type ActionTooltipHandle,
} from "@/components/ui/action-tooltip";
import { Button } from "@/components/ui/button";

type ArchiveEntity = "proposal" | "invoice" | "expense";

export function ArchiveRecordButton({
  archived: initialArchived,
  entity,
  recordId,
}: {
  archived: boolean;
  entity: ArchiveEntity;
  recordId: number;
}) {
  const [archived, setArchived] = useState(initialArchived);
  const [isPending, startTransition] = useTransition();
  const tooltipRef = useRef<ActionTooltipHandle>(null);

  function handleArchiveToggle() {
    const nextArchived = !archived;
    setArchived(nextArchived);
    tooltipRef.current?.complete(nextArchived ? "Archived" : "Restored");

    startTransition(async () => {
      const result = await archiveRecordAction(entity, recordId, nextArchived);

      if (!result.ok) {
        setArchived(!nextArchived);
      }
    });
  }

  const actionLabel = archived ? `Restore ${entity}` : `Archive ${entity}`;

  return (
    <ActionTooltip
      completedLabel={archived ? "Restored" : "Archived"}
      label={archived ? "Restore" : "Archive"}
      ref={tooltipRef}
    >
      <Button
        aria-label={actionLabel}
        aria-pressed={archived}
        disabled={isPending}
        onClick={(event) => {
          event.stopPropagation();
          handleArchiveToggle();
        }}
        type="button"
        variant="pill"
      >
        {archived ? <RiInboxUnarchiveLine /> : <RiArchiveLine />}
        {archived ? "Restore" : "Archive"}
      </Button>
    </ActionTooltip>
  );
}
