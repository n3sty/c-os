import { RiReceiptLine } from "@remixicon/react";

import { AppShell } from "@/components/app/app-shell";
import { RecordWorkspace } from "@/components/app/record-workspace";
import { formatCurrency, seedExpenses } from "@/lib/seed-data";
import { getWorkspaceRecords } from "@/lib/workspace-records";

type ExpensesPageProps = {
  searchParams: Promise<{
    filter?: string | string[];
    record?: string | string[];
    sidebar?: string | string[];
  }>;
};

function getQueryValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getAmountBand(amount: number) {
  if (amount < 50) {
    return "Under $50";
  }

  if (amount < 150) {
    return "$50-$149";
  }

  return "$150+";
}

export default async function ExpensesPage({
  searchParams,
}: ExpensesPageProps) {
  const query = await searchParams;
  const selectedFilterGroup = getQueryValue(query.filter);
  const selectedId = getQueryValue(query.record);
  const sidebarState = getQueryValue(query.sidebar);
  const totalAmount = seedExpenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  );
  const records = getWorkspaceRecords("expense");
  const amountBands = seedExpenses.reduce<Record<string, number>>(
    (bands, expense) => {
      const band = getAmountBand(expense.amount);
      bands[band] = (bands[band] ?? 0) + 1;
      return bands;
    },
    {},
  );
  const largerExpenses = seedExpenses.filter(
    (expense) => expense.amount >= 150,
  );

  return (
    <AppShell>
      <RecordWorkspace
        actionLabel="Log expense"
        basePath="/expenses"
        description={`${formatCurrency(totalAmount)} logged for bookkeeping export.`}
        emptyLabel="No expenses logged yet."
        filterGroups={[
          {
            title: "Amount",
            options: Object.entries(amountBands).map(([label, count]) => ({
              label,
              count,
            })),
          },
          {
            title: "Export",
            options: [
              { label: "Included", count: seedExpenses.length, active: true },
              { label: "Needs review", count: largerExpenses.length },
            ],
          },
        ]}
        filters={[
          { label: "All", count: seedExpenses.length, active: true },
          { label: "Needs review", count: largerExpenses.length },
          { label: "Export ready", count: seedExpenses.length },
        ]}
        icon={RiReceiptLine}
        records={records}
        selectedFilterGroup={selectedFilterGroup}
        selectedId={selectedId}
        sidebarOpen={sidebarState !== "closed"}
        title="Expenses"
      />
    </AppShell>
  );
}
