"use client";

import { RiSidebarFoldLine, RiSidebarUnfoldLine } from "@remixicon/react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const STORAGE_KEY = "coscience:detail-properties-open";

type FloatingDetailPropertiesProps = {
  children: ReactNode;
};

export function FloatingDetailProperties({
  children,
}: FloatingDetailPropertiesProps) {
  const [open, setOpen] = useState(true);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(
    null,
  );

  useEffect(() => {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (storedValue !== null) {
      setOpen(storedValue === "true");
    }
  }, []);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    window.localStorage.setItem(STORAGE_KEY, String(nextOpen));
  }

  return (
    <div className="absolute top-14 right-3 z-30 block @6xl/detail:hidden">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            aria-label={open ? "Collapse properties" : "Expand properties"}
            aria-pressed={open}
            className="size-8 rounded-full bg-muted/30 text-muted-foreground shadow-md ring-1 ring-white/10 hover:bg-muted/50 hover:text-foreground"
            size="icon"
            type="button"
            variant="ghost"
          >
            {open ? <RiSidebarFoldLine /> : <RiSidebarUnfoldLine />}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="max-h-[calc(100svh-7rem)] w-[min(20rem,calc(100cqw-1.5rem))] gap-0 overflow-auto rounded-none bg-transparent p-0 text-card-foreground shadow-none ring-0 duration-200 data-closed:animate-out data-closed:slide-out-to-right data-open:animate-in data-open:slide-in-from-right"
          disableDefaultAnimation
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          portalContainer={portalContainer}
          side="bottom"
          sideOffset={8}
        >
          {children}
        </PopoverContent>
      </Popover>

      <div ref={setPortalContainer} />
    </div>
  );
}
