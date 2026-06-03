"use client";

import { RiAddLine } from "@remixicon/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/animate-ui/components/radix/tooltip";
import { KeyboardShortcutInstructions } from "@/components/app/keyboard-shortcut-hint";
import { useKeyboardShortcut } from "@/components/app/keyboard-shortcut-provider";
import { Button } from "@/components/ui/button";
import {
  type CreationTarget,
  getCreateHref,
  getCreationConfig,
} from "@/lib/creation";
import type { KeyboardShortcutDefinition } from "@/lib/keyboard-shortcuts";

type CreateEntityButtonProps = {
  basePath: string;
  target: CreationTarget;
};

const createShortcutKeys = { key: "c" };

export function CreateEntityButton({
  basePath,
  target,
}: CreateEntityButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const href = getCreateHref(basePath, target);
  const config = getCreationConfig(target);
  const shortcut = useMemo<KeyboardShortcutDefinition>(
    () => ({
      id: `create-entity.${target}`,
      label: `to ${config.submitLabel.toLowerCase()}`,
      keys: createShortcutKeys,
    }),
    [config.submitLabel, target],
  );

  useKeyboardShortcut({
    id: shortcut.id,
    label: shortcut.label,
    keys: shortcut.keys,
    enabled: !searchParams.has("create"),
    handler: () => router.push(href),
  });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={config.submitLabel}
          asChild
          className="size-7 rounded-full"
          size="icon"
          variant="ghost"
        >
          <Link href={href}>
            <RiAddLine />
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent
        align="end"
        arrowClassName="bg-popover fill-popover"
        className="rounded-lg border border-border/70 bg-popover px-3 py-2.5 text-popover-foreground shadow-xl"
        side="bottom"
        sideOffset={8}
      >
        <KeyboardShortcutInstructions shortcuts={[shortcut]} />
      </TooltipContent>
    </Tooltip>
  );
}
