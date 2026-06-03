"use client";

import {
  RiArrowDownSLine,
  RiFileCopyLine,
  RiFilter3Line,
  RiLinksLine,
} from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Entity = "client" | "proposal" | "invoice" | "expense";

type Props = {
  entity: Entity;
  recordId: string;
  basePath: string;
};

export function DetailSidebarActions({ entity, recordId, basePath }: Props) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  function handleCopyId() {
    navigator.clipboard.writeText(recordId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function handleDuplicate() {
    router.push(`${basePath}?record=${recordId}&create=${entity}`);
  }

  return (
    <div className="mb-2 flex justify-end gap-1">
      <Button
        aria-label={copied ? "ID copied" : "Copy record ID"}
        className="size-8 rounded-full bg-muted/30"
        onClick={handleCopyId}
        size="icon"
        variant="ghost"
      >
        <RiLinksLine className={cn(copied && "text-foreground")} />
      </Button>
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
