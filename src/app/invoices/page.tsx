import { RiBillLine } from "@remixicon/react";

import { AppShell } from "@/components/app/app-shell";
import { RecordWorkspace } from "@/components/app/record-workspace";
import { buildFormOptions } from "@/lib/creation";
import { loadWorkspaceSnapshot } from "@/lib/database";
import { getWorkspaceRecords } from "@/lib/workspace-records";

type InvoicesPageProps = {
  searchParams: Promise<{
    filter?: string | string[];
    record?: string | string[];
    sidebar?: string | string[];
  }>;
};

function getQueryValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getYearFromNumber(value: string) {
  return value.match(/\d{4}/)?.[0] ?? "Unknown year";
}

export default async function InvoicesPage({
  searchParams,
}: InvoicesPageProps) {
  const query = await searchParams;
  const snapshot = await loadWorkspaceSnapshot();
  const selectedFilterGroup = getQueryValue(query.filter);
  const selectedId = getQueryValue(query.record);
  const sidebarState = getQueryValue(query.sidebar);
  const openInvoices = snapshot.invoices.filter(
    (invoice) =>
      !["paid", "void"].includes(invoice.status) && !invoice.archived,
  );
  const paidInvoices = snapshot.invoices.filter(
    (invoice) => !invoice.archived && invoice.status === "paid",
  );
  const overdueInvoices = snapshot.invoices.filter(
    (invoice) => !invoice.archived && invoice.status === "overdue",
  );
  const archivedInvoices = snapshot.invoices.filter(
    (invoice) => invoice.archived,
  );
  const activeInvoices = snapshot.invoices.filter(
    (invoice) => !invoice.archived,
  );
  const records = await getWorkspaceRecords("invoice", snapshot);
  const formOptions = buildFormOptions(snapshot);
  const clientOptions = snapshot.invoices.reduce<Record<string, number>>(
    (clients, invoice) => {
      const client =
        snapshot.clients.find((item) => item.id === invoice.clientId) ?? null;
      const label = client?.company ?? client?.fullName ?? "Unknown client";
      clients[label] = (clients[label] ?? 0) + 1;
      return clients;
    },
    {},
  );
  const yearOptions = snapshot.invoices.reduce<Record<string, number>>(
    (years, invoice) => {
      const year = getYearFromNumber(invoice.invoiceNumber);
      years[year] = (years[year] ?? 0) + 1;
      return years;
    },
    {},
  );

  return (
    <AppShell formOptions={formOptions}>
      <RecordWorkspace
        basePath="/invoices"
        creationTarget="invoice"
        description="Invoice numbers, clients, proposal links, and payment status."
        emptyLabel="No invoices yet."
        filterGroups={[
          {
            title: "Client",
            options: Object.entries(clientOptions).map(([label, count]) => ({
              label,
              count,
            })),
          },
          {
            title: "Status",
            options: ["draft", "sent", "paid", "overdue", "void"].map(
              (status) => ({
                label: status,
                count: snapshot.invoices.filter(
                  (invoice) => invoice.status === status,
                ).length,
              }),
            ),
          },
          {
            title: "Date",
            options: Object.entries(yearOptions).map(([label, count]) => ({
              label,
              count,
            })),
          },
          {
            title: "State",
            options: [
              { label: "Active", count: activeInvoices.length },
              { label: "Archived", count: archivedInvoices.length },
            ],
          },
        ]}
        filters={[
          { label: "Open", count: openInvoices.length, active: true },
          { label: "Paid", count: paidInvoices.length },
          { label: "Overdue", count: overdueInvoices.length },
          { label: "Archived", count: archivedInvoices.length },
          { label: "All", count: snapshot.invoices.length },
        ]}
        icon={RiBillLine}
        records={records}
        selectedFilterGroup={selectedFilterGroup}
        selectedId={selectedId}
        sidebarOpen={sidebarState !== "closed"}
        sortOptions={[
          {
            label: "Newest date",
            value: "date-desc",
            key: "date",
            direction: "desc",
          },
          {
            label: "Oldest date",
            value: "date-asc",
            key: "date",
            direction: "asc",
          },
          {
            label: "Client A-Z",
            value: "client-asc",
            key: "client",
            direction: "asc",
          },
          {
            label: "Status A-Z",
            value: "status-asc",
            key: "status",
            direction: "asc",
          },
          {
            label: "Active first",
            value: "state-asc",
            key: "state",
            direction: "asc",
          },
        ]}
        title="Invoices"
      />
    </AppShell>
  );
}
