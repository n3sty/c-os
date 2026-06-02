import { RiReceiptLine } from "@remixicon/react";

import { AppShell } from "@/components/app/app-shell";
import { EntityPage } from "@/components/app/entity-page";

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
        title="Expenses"
      />
    </AppShell>
  );
}
