import { RiBillLine } from "@remixicon/react";

import { AppShell } from "@/components/app/app-shell";
import { RecordWorkspace } from "@/components/app/record-workspace";
import { getClientById, seedInvoices } from "@/lib/seed-data";
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
  const selectedFilterGroup = getQueryValue(query.filter);
  const selectedId = getQueryValue(query.record);
  const sidebarState = getQueryValue(query.sidebar);
  const openInvoices = seedInvoices.filter(
    (invoice) =>
      !["paid", "void"].includes(invoice.status) && !invoice.archived,
  );
  const paidInvoices = seedInvoices.filter(
    (invoice) => invoice.status === "paid",
  );
  const overdueInvoices = seedInvoices.filter(
    (invoice) => invoice.status === "overdue",
  );
  const archivedInvoices = seedInvoices.filter((invoice) => invoice.archived);
  const records = getWorkspaceRecords("invoice");
  const clientOptions = seedInvoices.reduce<Record<string, number>>(
    (clients, invoice) => {
      const client = getClientById(invoice.clientId);
      const label = client?.company ?? client?.fullName ?? "Unknown client";
      clients[label] = (clients[label] ?? 0) + 1;
      return clients;
    },
    {},
  );
  const yearOptions = seedInvoices.reduce<Record<string, number>>(
    (years, invoice) => {
      const year = getYearFromNumber(invoice.invoiceNumber);
      years[year] = (years[year] ?? 0) + 1;
      return years;
    },
    {},
  );

  return (
    <AppShell>
      <RecordWorkspace
        actionLabel="New invoice"
        basePath="/invoices"
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
                count: seedInvoices.filter(
                  (invoice) => invoice.status === status,
                ).length,
                active: status === "draft",
              }),
            ),
          },
          {
            title: "Year",
            options: Object.entries(yearOptions).map(([label, count]) => ({
              label,
              count,
            })),
          },
        ]}
        filters={[
          { label: "Open", count: openInvoices.length, active: true },
          { label: "Paid", count: paidInvoices.length },
          { label: "Overdue", count: overdueInvoices.length },
          { label: "Archived", count: archivedInvoices.length },
        ]}
        icon={RiBillLine}
        records={records}
        selectedFilterGroup={selectedFilterGroup}
        selectedId={selectedId}
        sidebarOpen={sidebarState !== "closed"}
        title="Invoices"
      />
    </AppShell>
  );
}
