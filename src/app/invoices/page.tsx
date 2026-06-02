import { RiBillLine } from "@remixicon/react";

import { AppShell } from "@/components/app/app-shell";
import { EntityPage } from "@/components/app/entity-page";

export default function InvoicesPage() {
  return (
    <AppShell>
      <EntityPage
        actionLabel="New invoice"
        columns={[
          { label: "Invoice #" },
          { label: "Client" },
          { label: "Proposal #" },
          { label: "Document link" },
          { align: "right", label: "Status", width: "8rem" },
        ]}
        description="Invoice numbers, client links, optional proposal links, and payment status."
        detailDescription="Selecting an invoice will show number history, linked client, linked proposal, document link, and current status."
        detailTitle="Select an invoice"
        emptyLabel="No active invoices yet."
        icon={RiBillLine}
        title="Invoices"
      />
    </AppShell>
  );
}
