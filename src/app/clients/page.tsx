import { RiUser3Line } from "@remixicon/react";

import { AppShell } from "@/components/app/app-shell";
import { EntityPage } from "@/components/app/entity-page";
import { Badge } from "@/components/ui/badge";
import {
  getClientInvoiceCount,
  getClientProposalCount,
  seedClients,
} from "@/lib/seed-data";

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
        records={seedClients.map((client) => ({
          id: String(client.id),
          cells: [
            <div className="font-medium" key="name">
              {client.fullName}
            </div>,
            client.company ?? "Independent",
            client.clientNumber,
            client.email,
            <Badge
              className="ml-auto"
              key="state"
              variant={client.archived ? "outline" : "secondary"}
            >
              {client.archived ? "Archived" : "Active"}
            </Badge>,
          ],
          detailTitle: client.fullName,
          detailDescription:
            "Example client data for development, navigation, and record detail states.",
          details: [
            { label: "Company", value: client.company ?? "Independent" },
            { label: "Email", value: client.email },
            { label: "Client #", value: client.clientNumber },
            { label: "Proposals", value: getClientProposalCount(client.id) },
            { label: "Invoices", value: getClientInvoiceCount(client.id) },
            { label: "State", value: client.archived ? "Archived" : "Active" },
          ],
        }))}
        title="Clients"
      />
    </AppShell>
  );
}
