import {
  RiBillLine,
  RiCalendarCheckLine,
  RiCheckLine,
  RiExternalLinkLine,
  RiFileList3Line,
  RiInboxLine,
  RiMailSendLine,
  RiTimeLine,
} from "@remixicon/react";
import Link from "next/link";
import type { CSSProperties } from "react";

import {
  setInvoiceStatusFromQueueAction,
  updateRecordFieldFromQueueAction,
} from "@/app/actions/records";
import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import {
  loadWorkspaceSnapshot,
  type SeedInvoice,
  type SeedProposal,
  type WorkspaceSnapshot,
} from "@/lib/database";
import { cn } from "@/lib/utils";

const TODAY_ISO = "2026-06-29";

type QueueItem = {
  id: string;
  rankScore: number;
  kind: "cash" | "follow-up" | "waiting" | "task";
  title: string;
  ownerState: "You" | "Client" | "Ops";
  dueDate: string;
  linkedRecord: string;
  href: string;
  tone: "urgent" | "waiting" | "followup" | "task";
  action: React.ReactNode;
};

type DashboardPageProps = {
  searchParams: Promise<{
    view?: string | string[];
    turn?: string | string[];
    urgency?: string | string[];
  }>;
};

type QueueView = "open" | "cash" | "on-you";
type TurnFilter = "you" | "client";
type UrgencyFilter = QueueItem["tone"];

function getQueryValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getQueueView(value?: string): QueueView {
  return value === "cash" || value === "on-you" ? value : "open";
}

function getTurnFilter(value?: string): TurnFilter | undefined {
  return value === "you" || value === "client" ? value : undefined;
}

function getUrgencyFilter(value?: string): UrgencyFilter | undefined {
  return ["urgent", "waiting", "followup", "task"].includes(value ?? "")
    ? (value as UrgencyFilter)
    : undefined;
}

function getInboxHref({
  view,
  turn,
  urgency,
}: {
  view?: QueueView;
  turn?: TurnFilter;
  urgency?: UrgencyFilter;
}) {
  const params = new URLSearchParams();

  if (view && view !== "open") params.set("view", view);
  if (turn) params.set("turn", turn);
  if (urgency) params.set("urgency", urgency);

  const query = params.toString();
  return query ? `/?${query}` : "/";
}

function getClientLabel(snapshot: WorkspaceSnapshot, clientId: number) {
  const client = snapshot.clients.find((item) => item.id === clientId);
  return client?.company ?? client?.fullName ?? "Unknown client";
}

function formatDueDate(value: string) {
  if (value === TODAY_ISO) {
    return "Today";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T12:00:00Z`));
}

function getDueState(value: string) {
  if (value < TODAY_ISO) {
    return "Overdue";
  }

  if (value === TODAY_ISO) {
    return "Due today";
  }

  return "Upcoming";
}

function getCategoryIcon(kind: QueueItem["kind"]) {
  switch (kind) {
    case "cash":
      return <RiBillLine size={15} />;
    case "waiting":
      return <RiFileList3Line size={15} />;
    case "follow-up":
      return <RiTimeLine size={15} />;
    case "task":
      return <RiInboxLine size={15} />;
  }
}

function getToneClasses(tone: QueueItem["tone"]) {
  switch (tone) {
    case "urgent":
      return {
        row: "hover:border-red-500/35 hover:bg-red-500/[0.035]",
        icon: "border-red-500/25 bg-red-500/15 text-red-200",
      };
    case "waiting":
      return {
        row: "hover:border-amber-500/35 hover:bg-amber-500/[0.035]",
        icon: "border-amber-500/25 bg-amber-500/15 text-amber-200",
      };
    case "followup":
      return {
        row: "hover:border-blue-500/35 hover:bg-blue-500/[0.035]",
        icon: "border-blue-500/25 bg-blue-500/15 text-blue-200",
      };
    case "task":
      return {
        row: "hover:border-border/70 hover:bg-accent/45",
        icon: "border-border bg-muted/40 text-muted-foreground",
      };
  }
}

function getTurnClasses(ownerState: QueueItem["ownerState"]) {
  switch (ownerState) {
    case "You":
      return "border-primary/30 bg-primary/15 text-primary-foreground";
    case "Client":
      return "border-border bg-muted/40 text-muted-foreground";
    case "Ops":
      return "border-[#27a644]/30 bg-[#27a644]/15 text-[#bff2ca]";
  }
}

function invoiceDueDate(invoice: SeedInvoice) {
  if (invoice.status === "overdue") {
    return "2026-06-27";
  }

  if (invoice.status === "sent") {
    return TODAY_ISO;
  }

  return "2026-06-30";
}

function proposalDueDate(proposal: SeedProposal) {
  if (proposal.status === "sent") {
    return TODAY_ISO;
  }

  if (proposal.status === "draft" && !proposal.documentLink) {
    return TODAY_ISO;
  }

  return proposal.date;
}

function buildTodayQueue(snapshot: WorkspaceSnapshot): QueueItem[] {
  const invoiceItems = snapshot.invoices
    .filter(
      (invoice) =>
        !invoice.archived &&
        invoice.status !== "paid" &&
        invoice.status !== "void",
    )
    .map((invoice) => {
      const clientLabel = getClientLabel(snapshot, invoice.clientId);
      const dueDate = invoiceDueDate(invoice);
      const isCriticalCash = invoice.status === "overdue";
      const isFollowUp = invoice.status === "sent";

      return {
        id: `invoice-${invoice.id}`,
        rankScore: isCriticalCash ? 10 : isFollowUp ? 30 : 50,
        kind: isCriticalCash ? "cash" : isFollowUp ? "follow-up" : "task",
        title: isCriticalCash
          ? `Collect ${invoice.invoiceNumber}`
          : isFollowUp
            ? `Follow up on ${invoice.invoiceNumber}`
            : `Send ${invoice.invoiceNumber}`,
        ownerState: isCriticalCash || isFollowUp ? "Client" : "You",
        dueDate,
        linkedRecord: clientLabel,
        href: `/invoices?record=${invoice.id}`,
        tone: isCriticalCash ? "urgent" : isFollowUp ? "followup" : "task",
        action:
          invoice.status === "draft" ? (
            <form
              action={setInvoiceStatusFromQueueAction.bind(
                null,
                invoice.id,
                "sent",
              )}
            >
              <Button size="sm" type="submit" variant="task">
                <RiMailSendLine /> Send
              </Button>
            </form>
          ) : (
            <form
              action={setInvoiceStatusFromQueueAction.bind(
                null,
                invoice.id,
                "paid",
              )}
            >
              <Button
                size="sm"
                type="submit"
                variant={isCriticalCash ? "urgent" : "followup"}
              >
                <RiCheckLine /> Mark paid
              </Button>
            </form>
          ),
      } satisfies QueueItem;
    });

  const proposalItems = snapshot.proposals
    .filter(
      (proposal) =>
        !proposal.archived &&
        proposal.status !== "accepted" &&
        proposal.status !== "declined",
    )
    .map((proposal) => {
      const clientLabel = getClientLabel(snapshot, proposal.clientId);
      const dueDate = proposalDueDate(proposal);
      const waitingOnYou =
        proposal.status === "draft" || !proposal.documentLink;

      return {
        id: `proposal-${proposal.id}`,
        rankScore: waitingOnYou ? 20 : 40,
        kind: waitingOnYou ? "waiting" : "follow-up",
        title: proposal.title,
        ownerState: waitingOnYou ? "You" : "Client",
        dueDate,
        linkedRecord: `${proposal.proposalNumber} · ${clientLabel}`,
        href: `/proposals?record=${proposal.id}`,
        tone: waitingOnYou ? "waiting" : "followup",
        action: waitingOnYou ? (
          <form
            action={updateRecordFieldFromQueueAction.bind(
              null,
              { entity: "proposal", id: proposal.id, field: "status" },
              "sent",
            )}
          >
            <Button size="sm" type="submit" variant="waiting">
              <RiTimeLine /> Mark waiting
            </Button>
          </form>
        ) : (
          <Button asChild size="sm" variant="followup">
            <Link href={`/proposals?record=${proposal.id}`}>Set follow-up</Link>
          </Button>
        ),
      } satisfies QueueItem;
    });

  return [...invoiceItems, ...proposalItems].sort((left, right) => {
    if (left.rankScore !== right.rankScore) {
      return left.rankScore - right.rankScore;
    }

    return left.dueDate.localeCompare(right.dueDate);
  });
}

function filterQueue(
  queue: QueueItem[],
  view: QueueView,
  turn?: TurnFilter,
  urgency?: UrgencyFilter,
) {
  return queue.filter((item) => {
    const viewMatches =
      view === "open" ||
      (view === "cash" && item.kind === "cash") ||
      (view === "on-you" && item.ownerState === "You");
    const turnMatches =
      !turn ||
      (turn === "you" && item.ownerState === "You") ||
      (turn === "client" && item.ownerState === "Client");
    const urgencyMatches = !urgency || item.tone === urgency;

    return viewMatches && turnMatches && urgencyMatches;
  });
}

function getBarStyle(count: number, maxCount: number) {
  return {
    width: `${maxCount > 0 ? Math.max((count / maxCount) * 100, 2) : 0}%`,
  } satisfies CSSProperties;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const query = await searchParams;
  const activeView = getQueueView(getQueryValue(query.view));
  const activeTurn = getTurnFilter(getQueryValue(query.turn));
  const activeUrgency = getUrgencyFilter(getQueryValue(query.urgency));
  const snapshot = await loadWorkspaceSnapshot();
  const queue = buildTodayQueue(snapshot);
  const visibleQueue = filterQueue(
    queue,
    activeView,
    activeTurn,
    activeUrgency,
  );
  const criticalCashCount = queue.filter((item) => item.kind === "cash").length;
  const ownerYouCount = queue.filter(
    (item) => item.ownerState === "You",
  ).length;
  const ownerClientCount = queue.filter(
    (item) => item.ownerState === "Client",
  ).length;
  const urgentCount = queue.filter((item) => item.tone === "urgent").length;
  const waitingCount = queue.filter((item) => item.tone === "waiting").length;
  const followupCount = queue.filter((item) => item.tone === "followup").length;
  const maxUrgencyCount = Math.max(urgentCount, waitingCount, followupCount);
  const topFilters = [
    { label: "Open", count: queue.length, view: "open" },
    { label: "Cash risk", count: criticalCashCount, view: "cash" },
    { label: "On you", count: ownerYouCount, view: "on-you" },
  ] satisfies { label: string; count: number; view: QueueView }[];

  return (
    <AppShell>
      <div className="px-2 pt-2 pb-2 sm:px-4 sm:pt-4 sm:pb-4">
        <section
          aria-label="Prioritized Today Now queue"
          className="relative isolate grid min-h-[calc(100svh-2rem)] grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden rounded-xl border border-border bg-card after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:z-[70] after:h-px after:bg-white/10"
        >
          <header className="flex h-11 items-center justify-between gap-3 border-border/60 border-b px-3 text-sm">
            <div className="flex min-w-0 items-center gap-3">
              <RiInboxLine
                className="shrink-0 text-muted-foreground"
                size={15}
              />
              <h1 className="truncate font-heading font-semibold">
                Today / Now
              </h1>
              <span className="text-muted-foreground tabular-nums">
                {visibleQueue.length}
              </span>
            </div>
          </header>

          <div className="flex min-h-11 items-center justify-between gap-2 border-border/60 border-b px-2 py-1.5 sm:px-3">
            <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
              {topFilters.map((filter) => (
                <Link
                  className={cn(
                    "inline-flex h-8 shrink-0 items-center gap-2 rounded-full px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                    activeView === filter.view &&
                      "bg-secondary font-medium text-foreground",
                  )}
                  href={getInboxHref({ view: filter.view })}
                  key={filter.label}
                >
                  {filter.label}
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {filter.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid min-h-0 overflow-hidden xl:grid-cols-[minmax(0,1fr)_320px]">
            <main className="min-w-0 overflow-hidden">
              <div className="h-full overflow-auto">
                {visibleQueue.length > 0 ? (
                  <ol className="px-1 py-1">
                    {visibleQueue.map((item) => {
                      const tone = getToneClasses(item.tone);

                      return (
                        <li
                          className={cn(
                            "group grid min-h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-transparent px-3 py-2 text-sm transition-colors",
                            tone.row,
                          )}
                          key={item.id}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              aria-label={item.kind}
                              className={cn(
                                "flex size-7 shrink-0 items-center justify-center rounded-md border",
                                tone.icon,
                              )}
                              role="img"
                              title={item.kind}
                            >
                              {getCategoryIcon(item.kind)}
                            </span>
                            <div className="min-w-0">
                              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                                <span className="truncate font-medium text-foreground">
                                  {item.title}
                                </span>
                                <span className="hidden text-muted-foreground/70 text-xs tabular-nums sm:inline">
                                  {formatDueDate(item.dueDate)} /{" "}
                                  {getDueState(item.dueDate)}
                                </span>
                              </div>
                              <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                                <span
                                  className={cn(
                                    "inline-flex h-5 items-center rounded-sm border px-1.5 font-medium",
                                    getTurnClasses(item.ownerState),
                                  )}
                                >
                                  {item.ownerState}
                                </span>
                                <Link
                                  className="inline-flex min-w-0 items-center gap-1 text-primary underline-offset-4 hover:underline"
                                  href={item.href}
                                >
                                  <span className="truncate">
                                    {item.linkedRecord}
                                  </span>
                                  <RiExternalLinkLine
                                    className="shrink-0"
                                    size={13}
                                  />
                                </Link>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {item.action}
                            <Button
                              asChild
                              aria-label={`Open ${item.linkedRecord}`}
                              className="size-8 rounded-full"
                              size="icon"
                              variant="ghost"
                            >
                              <Link href={item.href}>
                                <RiExternalLinkLine />
                              </Link>
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <div className="flex min-h-72 items-center justify-center px-8 text-center">
                    <div className="max-w-md">
                      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-lg border border-border bg-muted text-[#27a644]">
                        <RiCalendarCheckLine size={32} />
                      </div>
                      {queue.length > 0 ? (
                        <>
                          <h2 className="font-heading font-semibold text-xl">
                            No decisions match this view.
                          </h2>
                          <p className="mt-2 text-muted-foreground text-sm">
                            Clear the active filters to return to the full
                            queue.
                          </p>
                        </>
                      ) : (
                        <>
                          <h2 className="font-heading font-semibold text-xl">
                            Operations are clear for today.
                          </h2>
                          <p className="mt-2 text-muted-foreground text-sm">
                            No critical cash, overdue follow-ups, waiting-on-you
                            projects, or due-today tasks need a decision right
                            now.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </main>

            <aside className="hidden min-h-0 border-border/60 border-l p-2 pl-1.5 xl:block">
              <div className="h-full overflow-auto rounded-lg border border-border/70 bg-secondary p-3">
                <div className="mb-4">
                  <h2 className="font-heading font-semibold text-sm">Turn</h2>
                </div>

                <div className="space-y-2">
                  <Link
                    className={cn(
                      "flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors hover:border-primary/40 hover:bg-primary/10",
                      activeTurn === "you"
                        ? "border-primary/30 bg-primary/15"
                        : "border-border bg-muted/30",
                    )}
                    href={getInboxHref({
                      view: activeView,
                      turn: activeTurn === "you" ? undefined : "you",
                      urgency: activeUrgency,
                    })}
                  >
                    <span className="font-medium text-primary-foreground">
                      You
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {ownerYouCount}
                    </span>
                  </Link>
                  <Link
                    className={cn(
                      "flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors hover:border-border/80 hover:bg-accent/45",
                      activeTurn === "client"
                        ? "border-border bg-muted/50"
                        : "border-border bg-muted/30",
                    )}
                    href={getInboxHref({
                      view: activeView,
                      turn: activeTurn === "client" ? undefined : "client",
                      urgency: activeUrgency,
                    })}
                  >
                    <span className="font-medium text-foreground">Client</span>
                    <span className="text-muted-foreground tabular-nums">
                      {ownerClientCount}
                    </span>
                  </Link>
                </div>

                <div className="mt-6">
                  <h2 className="font-heading font-semibold text-sm">
                    Urgency
                  </h2>
                  <div className="mt-3 space-y-2">
                    <Link
                      className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-sm py-1 text-xs"
                      href={getInboxHref({
                        view: activeView,
                        turn: activeTurn,
                        urgency:
                          activeUrgency === "urgent" ? undefined : "urgent",
                      })}
                    >
                      <span className="h-2 rounded-full bg-red-500/20 transition-opacity hover:opacity-80">
                        <span
                          className="block h-full rounded-full bg-red-500"
                          style={getBarStyle(urgentCount, maxUrgencyCount)}
                        />
                      </span>
                      <span className="text-muted-foreground tabular-nums">
                        {urgentCount}
                      </span>
                    </Link>
                    <Link
                      className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-sm py-1 text-xs"
                      href={getInboxHref({
                        view: activeView,
                        turn: activeTurn,
                        urgency:
                          activeUrgency === "waiting" ? undefined : "waiting",
                      })}
                    >
                      <span className="h-2 rounded-full bg-amber-500/20">
                        <span
                          className="block h-full rounded-full bg-amber-500"
                          style={getBarStyle(waitingCount, maxUrgencyCount)}
                        />
                      </span>
                      <span className="text-muted-foreground tabular-nums">
                        {waitingCount}
                      </span>
                    </Link>
                    <Link
                      className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-sm py-1 text-xs"
                      href={getInboxHref({
                        view: activeView,
                        turn: activeTurn,
                        urgency:
                          activeUrgency === "followup" ? undefined : "followup",
                      })}
                    >
                      <span className="h-2 rounded-full bg-blue-500/20">
                        <span
                          className="block h-full rounded-full bg-blue-500"
                          style={getBarStyle(followupCount, maxUrgencyCount)}
                        />
                      </span>
                      <span className="text-muted-foreground tabular-nums">
                        {followupCount}
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
