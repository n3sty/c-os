import {
  RiEqualizerLine,
  RiFilter3Line,
  RiInboxArchiveLine,
  RiMoreLine,
  RiStackLine,
} from "@remixicon/react";
import Link from "next/link";

import { AppShell } from "@/components/app/app-shell";
import { DetailSurface } from "@/components/app/record-workspace";
import { Button } from "@/components/ui/button";
import { seedNotifications } from "@/lib/database";
import { getWorkspaceEntityContext } from "@/lib/workspace-records";

type InboxPageProps = {
  searchParams: Promise<{
    notification?: string | string[];
  }>;
};

function getQueryValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const query = await searchParams;
  const selectedNotificationId = getQueryValue(query.notification);
  const selectedNotification =
    seedNotifications.find(
      (notification) => notification.id === selectedNotificationId,
    ) ?? null;
  const detailContext = selectedNotification
    ? await getWorkspaceEntityContext(selectedNotification.target)
    : null;
  const selectedRecord = detailContext?.record ?? null;
  const selectedRecordPosition =
    selectedRecord && detailContext
      ? detailContext.records.findIndex(
          (record) => record.id === selectedRecord.id,
        ) + 1
      : undefined;

  return (
    <AppShell>
      <div className="px-2 pt-2 pb-2 sm:px-4 sm:pt-4 sm:pb-4">
        <div className="grid min-h-[calc(100svh-2rem)] overflow-hidden rounded-lg bg-card lg:grid-cols-[340px_minmax(0,1fr)]">
          <section className="min-w-0">
            <header className="flex h-12 items-center justify-between border-border/50 border-b px-4">
              <div className="flex min-w-0 items-center gap-2">
                <h1 className="font-heading text-base font-semibold">Inbox</h1>
                <Button
                  aria-label="More inbox options"
                  className="size-7 rounded-full text-muted-foreground"
                  size="icon"
                  variant="ghost"
                >
                  <RiMoreLine />
                </Button>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  aria-label="Filter inbox"
                  className="size-7 rounded-full text-muted-foreground"
                  size="icon"
                  variant="ghost"
                >
                  <RiFilter3Line />
                </Button>
                <Button
                  aria-label="Inbox display options"
                  className="size-7 rounded-full text-muted-foreground"
                  size="icon"
                  variant="ghost"
                >
                  <RiEqualizerLine />
                </Button>
              </div>
            </header>

            <div className="px-2 py-3">
              {seedNotifications.map((notification) => {
                const isActive = notification.id === selectedNotification?.id;

                return (
                  <Link
                    className={[
                      "grid w-full grid-cols-[36px_minmax(0,1fr)_auto] items-start gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted/30",
                      isActive ? "bg-muted/25" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    href={`/?notification=${notification.id}`}
                    key={notification.id}
                  >
                    <div className="relative mt-1 flex size-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
                      <RiInboxArchiveLine size={20} />
                      <span className="-right-0.5 -bottom-0.5 absolute size-3 rounded-full border border-card bg-yellow-500" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {notification.title}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {notification.description}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1 pt-0.5">
                      <span
                        className={`size-3 rounded-full ${notification.accent}`}
                        title={notification.source}
                      />
                      <span className="text-muted-foreground text-xs">
                        {notification.time}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="min-w-0 h-full overflow-hidden border-border/60 border-l">
            {detailContext && selectedRecord ? (
              <DetailSurface
                backHref="/"
                basePath={detailContext.basePath}
                icon={detailContext.icon}
                position={selectedRecordPosition}
                record={selectedRecord}
                records={detailContext.records}
                title={detailContext.title}
                variant="panel"
              />
            ) : (
              <div className="grid h-full place-items-center">
                <div className="flex flex-col items-center gap-4 text-center text-muted-foreground">
                  <div className="flex size-24 items-center justify-center rounded-2xl text-muted-foreground">
                    <RiStackLine size={82} strokeWidth={1.25} />
                  </div>
                  <p className="text-sm font-semibold">Select a notification</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
