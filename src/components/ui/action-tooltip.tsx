"use client";

import { AnimatePresence, motion } from "motion/react";
import { Tooltip as TooltipPrimitive } from "radix-ui";
import {
  forwardRef,
  type ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

export type ActionTooltipHandle = {
  complete: (label?: string) => void;
};

type ActionTooltipProps = {
  children: ReactNode;
  label: string;
  completedLabel: string;
  completionDuration?: number;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
};

export const ActionTooltip = forwardRef<
  ActionTooltipHandle,
  ActionTooltipProps
>(function ActionTooltip(
  {
    children,
    label,
    completedLabel,
    completionDuration = 1000,
    side = "top",
    align = "center",
    className,
  },
  ref,
) {
  const [open, setOpen] = useState(false);
  const [completionLabel, setCompletionLabel] = useState<string | null>(null);
  const [transitionLabel, setTransitionLabel] = useState<string | null>(null);
  const completionTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const animationFrame = useRef<number>(null);

  function complete(nextLabel = completedLabel) {
    if (completionTimer.current) {
      clearTimeout(completionTimer.current);
    }
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }

    setTransitionLabel(label);
    setCompletionLabel(null);
    setOpen(true);
    animationFrame.current = requestAnimationFrame(() => {
      setCompletionLabel(nextLabel);
      completionTimer.current = setTimeout(() => {
        setOpen(false);
        setCompletionLabel(null);
        setTransitionLabel(null);
      }, completionDuration);
    });
  }

  useImperativeHandle(ref, () => ({ complete }));

  useEffect(
    () => () => {
      if (completionTimer.current) {
        clearTimeout(completionTimer.current);
      }
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    },
    [],
  );

  const visibleLabel = completionLabel ?? transitionLabel ?? label;

  return (
    <TooltipPrimitive.Provider delayDuration={500}>
      <TooltipPrimitive.Root
        open={open}
        onOpenChange={(nextOpen) => {
          if (!completionLabel) {
            setOpen(nextOpen);
          }
        }}
      >
        <TooltipPrimitive.Trigger asChild>
          <span className="inline-flex">{children}</span>
        </TooltipPrimitive.Trigger>
        <AnimatePresence>
          {open && (
            <TooltipPrimitive.Portal forceMount>
              <TooltipPrimitive.Content
                align={align}
                asChild
                forceMount
                side={side}
                sideOffset={7}
              >
                <motion.div
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "z-50 overflow-hidden rounded-md border border-border/70 bg-popover px-2.5 py-1 text-popover-foreground text-xs shadow-lg",
                    className,
                  )}
                  exit={{ opacity: 0, scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  layout="size"
                  transition={{
                    duration: 0.12,
                    layout: { duration: 0.18, ease: "easeOut" },
                  }}
                >
                  <span className="relative block h-4 min-w-8 overflow-hidden whitespace-nowrap text-center leading-4">
                    <AnimatePresence initial={false} mode="popLayout">
                      <motion.span
                        animate={{ opacity: 1, y: 0 }}
                        className="block"
                        exit={{ opacity: 0, y: -6 }}
                        initial={{ opacity: 0, y: 6 }}
                        key={visibleLabel}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                      >
                        {visibleLabel}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </motion.div>
              </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
          )}
        </AnimatePresence>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
});
