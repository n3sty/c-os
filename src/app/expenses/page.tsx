import { RiReceiptLine } from "@remixicon/react";

import { AppShell } from "@/components/app/app-shell";
import { EntityPage } from "@/components/app/entity-page";
import { formatCurrency, seedExpenses } from "@/lib/seed-data";

export default function ExpensesPage() {
  return (
    <AppShell>
      <EntityPage
        actionLabel="Log expense"
        columns={[
          { label: "Description" },
          { align: "right", label: "Amount", width: "10rem" },
        ]}
        description="Standalone expense records for simple export and bookkeeping review."
        detailDescription="Selecting an expense will show its amount, description, and export context."
        detailTitle="Select an expense"
        emptyLabel="No expenses logged yet."
        icon={RiReceiptLine}
        records={seedExpenses.map((expense) => ({
          id: String(expense.id),
          cells: [
            <div className="font-medium" key="description">
              {expense.description}
            </div>,
            formatCurrency(expense.amount),
          ],
          detailTitle: expense.description,
          detailDescription:
            "Example expense data for table layouts, totals, and export review.",
          details: [
            { label: "Description", value: expense.description },
            { label: "Amount", value: formatCurrency(expense.amount) },
            { label: "Export scope", value: "Included in bookkeeping export" },
          ],
        }))}
        title="Expenses"
      />
    </AppShell>
  );
}
