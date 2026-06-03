"use client";

import { RiCloseLine } from "@remixicon/react";
import { Dialog as DialogPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "@/lib/utils";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-background/70 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
    />
  );
}

const DialogPopupContext = React.createContext<HTMLDivElement | null>(null);

export function useDialogPopupContainer() {
  return React.useContext(DialogPopupContext);
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
}) {
  const [popupContainer, setPopupContainer] =
    React.useState<HTMLDivElement | null>(null);

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-[5vh] left-1/2 z-50 grid w-[calc(100vw-2rem)] max-w-3xl -translate-x-1/2 gap-4 rounded-lg border border-border/70 bg-card p-0 shadow-2xl outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:top-[8vh]",
          className,
        )}
        {...props}
      >
        <DialogPopupContext value={popupContainer}>
          {children}
        </DialogPopupContext>
        {/* Zero-layout-impact anchor for portaling popups inside the dialog's FocusScope */}
        <div
          aria-hidden
          ref={setPopupContainer}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            overflow: "visible",
            gridColumn: "1 / -1",
            gridRow: "1 / -1",
          }}
        />
        {showCloseButton && (
          <DialogPrimitive.Close className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
            <RiCloseLine size={18} />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("font-heading text-lg font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
