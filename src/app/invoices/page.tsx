import { RiBillLine } from "@remixicon/react";

import { AppShell } from "@/components/app/app-shell";
import { EntityPage } from "@/components/app/entity-page";
import { Badge } from "@/components/ui/badge";
import {
  getClientById,
  getInvoiceStatusBadgeVariant,
  getProposalById,
  seedInvoices,
} from "@/lib/seed-data";

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
        records={seedInvoices.map((invoice) => {
          const client = getClientById(invoice.clientId);
          const proposal = invoice.proposalId
            ? getProposalById(invoice.proposalId)
            : null;

          return {
            id: String(invoice.id),
            cells: [
              <div className="font-medium" key="invoice-number">
                {invoice.invoiceNumber}
              </div>,
              client?.company ?? client?.fullName ?? "Unknown client",
              proposal?.proposalNumber ?? "Direct",
              invoice.documentLink ? "Attached" : "Missing",
              <Badge
                className="ml-auto capitalize"
                key="status"
                variant={getInvoiceStatusBadgeVariant(invoice.status)}
              >
                {invoice.status}
              </Badge>,
            ],
            detailTitle: invoice.invoiceNumber,
            detailDescription:
              "Example invoice data with mixed lifecycle states for UI testing.",
            details: [
              {
                label: "Client",
                value: client?.company ?? client?.fullName ?? "Unknown client",
              },
              {
                label: "Proposal",
                value: proposal?.proposalNumber ?? "Direct invoice",
              },
              {
                label: "Document",
                value: invoice.documentLink ?? "No document link saved",
              },
              {
                label: "Status",
                value: (
                  <Badge
                    className="capitalize"
                    variant={getInvoiceStatusBadgeVariant(invoice.status)}
                  >
                    {invoice.status}
                  </Badge>
                ),
              },
              {
                label: "State",
                value: invoice.archived ? "Archived" : "Active",
              },
            ],
          };
        })}
        title="Invoices"
      />
    </AppShell>
  );
}
