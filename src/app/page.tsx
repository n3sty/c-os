import {
  RiArchiveLine,
  RiBillLine,
  RiDownloadLine,
  RiFileList3Line,
  RiInboxLine,
} from "@remixicon/react";

import { AppShell } from "@/components/app/app-shell";
import { EmptyDetail } from "@/components/app/empty-detail";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const notifications = [
  {
    title: "No active notifications",
    description:
      "Operational notices will appear here when records need attention.",
    meta: "Inbox",
    active: true,
  },
];

const upcomingSignals = [
  {
    label: "Missing document links",
    icon: RiFileList3Line,
    description: "Proposals and invoices without a saved document.",
  },
  {
    label: "Invoice status changes",
    icon: RiBillLine,
    description: "Invoices that need status review.",
  },
  {
    label: "Export-ready records",
    icon: RiDownloadLine,
    description: "Datasets ready for bookkeeping export.",
  },
  {
    label: "Archived record references",
    icon: RiArchiveLine,
    description: "Archived entries that remain stored and searchable.",
  },
];

export default function InboxPage() {
  return (
    <AppShell>
      <div className="p-5 sm:p-8">
        <div className="grid min-h-[calc(100svh-8rem)] overflow-hidden rounded-lg border bg-card xl:grid-cols-[380px_minmax(0,1fr)]">
          <section className="border-r">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="font-heading text-xl font-semibold">
                  Notifications
                </h2>
                <p className="text-base text-muted-foreground">
                  Work that needs attention.
                </p>
              </div>
              <Badge variant="secondary">0 open</Badge>
            </div>

            <div className="p-2">
              {notifications.map((notification) => (
                <button
                  className={cn(
                    "w-full rounded-md px-3 py-3 text-left transition-colors hover:bg-muted/30",
                    notification.active && "bg-muted/40",
                  )}
                  key={notification.title}
                  type="button"
                >
                  <div className="flex gap-3">
                    <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground">
                      <RiInboxLine size={16} />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-base font-medium">
                          {notification.title}
                        </p>
                        <Badge variant="outline">{notification.meta}</Badge>
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {notification.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="min-w-0">
            <EmptyDetail
              description="Selecting an inbox notification will open its record context here, without leaving the inbox."
              icon={RiInboxLine}
              title="No notification selected"
            />

            <Separator />

            <div className="grid gap-3 p-5 lg:grid-cols-2">
              {upcomingSignals.map((signal) => (
                <Card className="bg-card/60 p-4" key={signal.label}>
                  <div className="flex gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/20 text-muted-foreground">
                      <signal.icon size={17} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-heading text-base font-semibold">
                        {signal.label}
                      </h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {signal.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
