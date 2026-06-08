import { RiReceiptLine } from "@remixicon/react";

import { AppShell } from "@/components/app/app-shell";
import { RecordWorkspace } from "@/components/app/record-workspace";
import { formatCurrency, loadWorkspaceSnapshot } from "@/lib/database";
import { getExpenseCategoryLabel } from "@/lib/expense-category";
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
  const categories = snapshot.expenses.reduce<Record<string, number>>(
    (counts, expense) => {
      const category = getExpenseCategoryLabel(expense.category);
      counts[category] = (counts[category] ?? 0) + 1;
      return counts;
    },
    {},
  );
  const archivedExpenses = snapshot.expenses.filter(
    (expense) => expense.archived,
  );
  const activeExpenses = snapshot.expenses.filter(
    (expense) => !expense.archived,
  );

  return (
    <AppShell>
      <RecordWorkspace
        basePath="/expenses"
        creationTarget="expense"
        description={`${formatCurrency(totalAmount)} logged for bookkeeping export.`}
        emptyLabel="No expenses logged yet."
        filterGroups={[
          {
            title: "Category",
            options: Object.entries(categories).map(([label, count]) => ({
              label,
              count,
            })),
          },
          {
            title: "State",
            options: [
              { label: "Active", count: activeExpenses.length },
              { label: "Archived", count: archivedExpenses.length },
            ],
          },
        ]}
        filters={[
          { label: "All", count: snapshot.expenses.length, active: true },
          { label: "Active", count: activeExpenses.length },
          { label: "Archived", count: archivedExpenses.length },
        ]}
        icon={RiReceiptLine}
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
            label: "Supplier A-Z",
            value: "supplier-asc",
            key: "supplier",
            direction: "asc",
          },
          {
            label: "Category A-Z",
            value: "category-asc",
            key: "category",
            direction: "asc",
          },
          {
            label: "Highest amount",
            value: "amount-desc",
            key: "amount",
            direction: "desc",
          },
          {
            label: "Lowest amount",
            value: "amount-asc",
            key: "amount",
            direction: "asc",
          },
        ]}
        title="Expenses"
      />
    </AppShell>
  );
}
