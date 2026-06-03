import { RiReceiptLine } from "@remixicon/react";

import { AppShell } from "@/components/app/app-shell";
import { RecordWorkspace } from "@/components/app/record-workspace";
import { formatCurrency, loadWorkspaceSnapshot } from "@/lib/database";
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
  const snapshot = await loadWorkspaceSnapshot();
  const selectedFilterGroup = getQueryValue(query.filter);
  const selectedId = getQueryValue(query.record);
  const sidebarState = getQueryValue(query.sidebar);
  const totalAmount = snapshot.expenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  );
  const records = await getWorkspaceRecords("expense", snapshot);
  const amountBands = snapshot.expenses.reduce<Record<string, number>>(
    (bands, expense) => {
      const band = getAmountBand(expense.amount);
      bands[band] = (bands[band] ?? 0) + 1;
      return bands;
    },
    {},
  );
  const largerExpenses = snapshot.expenses.filter(
    (expense) => expense.amount >= 150,
  );

  return (
    <AppShell>
      <RecordWorkspace
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
              {
                label: "Included",
                count: snapshot.expenses.length,
              },
              { label: "Needs review", count: largerExpenses.length },
            ],
          },
        ]}
        filters={[
          { label: "All", count: snapshot.expenses.length, active: true },
          { label: "Needs review", count: largerExpenses.length },
          { label: "Export ready", count: snapshot.expenses.length },
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
