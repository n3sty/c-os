import { RiUser3Line } from "@remixicon/react";

import { AppShell } from "@/components/app/app-shell";
import { EntityPage } from "@/components/app/entity-page";

export default function ClientsPage() {
  return (
    <AppShell>
      <EntityPage
        actionLabel="Add client"
        columns={[
          { label: "Name" },
          { label: "Company" },
          { label: "Client #" },
          { label: "Email" },
          { align: "right", label: "State", width: "8rem" },
        ]}
        description="Client details, client numbers, and archive state."
        detailDescription="Selecting a client will show contact details, linked proposals, linked invoices, and archive state."
        detailTitle="Select a client"
        emptyLabel="No active clients yet."
        icon={RiUser3Line}
        title="Clients"
      />
    </AppShell>
  );
}
