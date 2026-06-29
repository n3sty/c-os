import {
  RiBillLine,
  RiCalendarCheckLine,
  RiCheckLine,
  RiExternalLinkLine,
  RiFileList3Line,
  RiInboxLine,
  RiMailSendLine,
  RiPulseLine,
  RiTimeLine,
} from "@remixicon/react";
import Link from "next/link";

import {
  setInvoiceStatusFromQueueAction,
  updateRecordFieldFromQueueAction,
} from "@/app/actions/records";
import { AppShell } from "@/components/app/app-shell";
import { KeyboardShortcutHint } from "@/components/app/keyboard-shortcut-hint";
import { Button } from "@/components/ui/button";
import {
  loadWorkspaceSnapshot,
  type SeedInvoice,
  type SeedProposal,
  type WorkspaceSnapshot,
} from "@/lib/database";

const TODAY_ISO = "2026-06-29";

type QueueItem = {
  id: string;
  rankScore: number;
  kind: "cash" | "follow-up" | "waiting" | "task";
  title: string;
  reason: string;
  ownerState: "You" | "Client" | "Ops";
  dueDate: string;
  linkedRecord: string;
  href: string;
  tone: string;
  action: React.ReactNode;
};

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
        reason: isCriticalCash
          ? "Critical cash is blocked by an overdue invoice."
          : isFollowUp
            ? "Sent invoice is ready for a payment nudge."
            : "Draft invoice can be sent or cleaned up today.",
        ownerState: isCriticalCash || isFollowUp ? "Client" : "You",
        dueDate,
        linkedRecord: `${invoice.invoiceNumber} · ${clientLabel}`,
        href: `/invoices?record=${invoice.id}`,
        tone: isCriticalCash
          ? "border-red-500/40 bg-red-500/5"
          : "border-blue-500/30 bg-blue-500/5",
        action:
          invoice.status === "draft" ? (
            <form
              action={setInvoiceStatusFromQueueAction.bind(
                null,
                invoice.id,
                "sent",
              )}
            >
              <Button size="sm" type="submit" variant="secondary">
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
              <Button size="sm" type="submit">
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
        title: waitingOnYou
          ? `Unblock ${proposal.title}`
          : `Check ${proposal.title}`,
        reason: waitingOnYou
          ? "Project is waiting on you before the client can respond."
          : "Proposal is out; the next move is a lightweight follow-up.",
        ownerState: waitingOnYou ? "You" : "Client",
        dueDate,
        linkedRecord: `${proposal.proposalNumber} · ${clientLabel}`,
        href: `/proposals?record=${proposal.id}`,
        tone: waitingOnYou
          ? "border-amber-500/40 bg-amber-500/5"
          : "border-cyan-500/30 bg-cyan-500/5",
        action: waitingOnYou ? (
          <form
            action={updateRecordFieldFromQueueAction.bind(
              null,
              { entity: "proposal", id: proposal.id, field: "status" },
              "sent",
            )}
          >
            <Button size="sm" type="submit" variant="secondary">
              <RiTimeLine /> Mark waiting
            </Button>
          </form>
        ) : (
          <Button asChild size="sm" variant="secondary">
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

export default async function DashboardPage() {
  const snapshot = await loadWorkspaceSnapshot();
  const queue = buildTodayQueue(snapshot);
  const criticalCashCount = queue.filter((item) => item.kind === "cash").length;
  const ownerYouCount = queue.filter(
    (item) => item.ownerState === "You",
  ).length;

  return (
    <AppShell>
      <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-4 px-3 py-3 sm:px-6 sm:py-6">
        <header className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2 text-muted-foreground text-sm">
                <RiPulseLine size={16} /> Daily decision queue
              </div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                Today / Now
              </h1>
              <p className="mt-2 text-muted-foreground text-sm sm:text-base">
                One ranked queue for cash risk, overdue follow-ups, work waiting
                on you, and tasks due today.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center sm:min-w-96">
              <div className="rounded-xl border bg-background p-3">
                <p className="text-2xl font-semibold">{queue.length}</p>
                <p className="text-muted-foreground text-xs">open decisions</p>
              </div>
              <div className="rounded-xl border bg-background p-3">
                <p className="text-2xl font-semibold">{criticalCashCount}</p>
                <p className="text-muted-foreground text-xs">cash risks</p>
              </div>
              <div className="rounded-xl border bg-background p-3">
                <p className="text-2xl font-semibold">{ownerYouCount}</p>
                <p className="text-muted-foreground text-xs">waiting on you</p>
              </div>
            </div>
          </div>
        </header>

        <section
          aria-label="Prioritized Today Now queue"
          className="rounded-2xl border bg-card shadow-sm"
        >
          <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-lg font-semibold">
                What deserves attention first
              </h2>
              <p className="text-muted-foreground text-sm">
                Use Tab to move through actions, Enter to act, and linked
                records for deeper edits.
              </p>
            </div>
            <div className="flex gap-1 text-muted-foreground text-xs">
              <KeyboardShortcutHint
                shortcut={{ id: "queue-tab", keys: { key: "Tab" } }}
              />
              <KeyboardShortcutHint
                shortcut={{ id: "queue-enter", keys: { key: "Enter" } }}
              />
              <KeyboardShortcutHint
                shortcut={{ id: "queue-down", keys: { key: "ArrowDown" } }}
              />
            </div>
          </div>

          {queue.length > 0 ? (
            <ol className="divide-y">
              {queue.map((item, index) => (
                <li
                  className={`grid gap-3 border-l-4 p-4 sm:grid-cols-[4rem_minmax(0,1.4fr)_minmax(13rem,0.8fr)_auto] sm:items-center ${item.tone}`}
                  key={item.id}
                >
                  <div className="flex items-center gap-3 sm:block">
                    <span className="flex size-10 items-center justify-center rounded-full bg-background font-semibold tabular-nums shadow-sm">
                      {index + 1}
                    </span>
                    <span className="rounded-full bg-background px-2 py-1 text-muted-foreground text-xs sm:mt-2 sm:inline-block">
                      {item.kind}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {item.reason}
                    </p>
                    <Link
                      className="mt-2 inline-flex items-center gap-1 text-primary text-sm hover:underline"
                      href={item.href}
                    >
                      {item.linkedRecord} <RiExternalLinkLine size={14} />
                    </Link>
                  </div>

                  <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-1">
                    <div className="rounded-lg bg-background/80 p-2">
                      <dt className="text-muted-foreground text-xs">
                        Owner state
                      </dt>
                      <dd className="font-medium">{item.ownerState}</dd>
                    </div>
                    <div className="rounded-lg bg-background/80 p-2">
                      <dt className="text-muted-foreground text-xs">Due</dt>
                      <dd className="font-medium">
                        {formatDueDate(item.dueDate)} ·{" "}
                        {getDueState(item.dueDate)}
                      </dd>
                    </div>
                  </dl>

                  <div className="flex items-center gap-2 sm:justify-end">
                    {item.action}
                    <Button
                      asChild
                      aria-label={`Open ${item.linkedRecord}`}
                      size="icon"
                      variant="ghost"
                    >
                      <Link href={item.href}>
                        <RiExternalLinkLine />
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="grid min-h-80 place-items-center p-8 text-center">
              <div className="max-w-md">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <RiCalendarCheckLine size={32} />
                </div>
                <h3 className="font-heading text-xl font-semibold">
                  Operations are clear for today.
                </h3>
                <p className="mt-2 text-muted-foreground text-sm">
                  No critical cash, overdue follow-ups, waiting-on-you projects,
                  or due-today tasks need a decision right now.
                </p>
              </div>
            </div>
          )}
        </section>

        <footer className="grid gap-3 text-muted-foreground text-sm sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-3">
            <RiBillLine className="mb-2" /> Cash items outrank everything else
            when invoices are overdue.
          </div>
          <div className="rounded-xl border bg-card p-3">
            <RiFileList3Line className="mb-2" /> Waiting-on-you work stays above
            passive client follow-up.
          </div>
          <div className="rounded-xl border bg-card p-3">
            <RiInboxLine className="mb-2" /> Simple actions stay inline; deeper
            changes open the linked record.
          </div>
        </footer>
      </div>
    </AppShell>
  );
}
