import { RiFileList3Line } from "@remixicon/react";

import { AppShell } from "@/components/app/app-shell";
import { EntityPage } from "@/components/app/entity-page";
import { Badge } from "@/components/ui/badge";
import { getClientById, seedInvoices, seedProposals } from "@/lib/seed-data";

export default function ProposalsPage() {
  return (
    <AppShell>
      <EntityPage
        actionLabel="New proposal"
        columns={[
          { label: "Proposal #" },
          { label: "Client" },
          { label: "Document link" },
          { align: "right", label: "State", width: "8rem" },
        ]}
        description="Proposal numbers are unique, linked to clients, and never reused."
        detailDescription="Selecting a proposal will show its client, document link, invoice relationship, and archive state."
        detailTitle="Select a proposal"
        emptyLabel="No active proposals yet."
        icon={RiFileList3Line}
        records={seedProposals.map((proposal) => {
          const client = getClientById(proposal.clientId);
          const linkedInvoices = seedInvoices.filter(
            (invoice) => invoice.proposalId === proposal.id,
          );

          return {
            id: String(proposal.id),
            cells: [
              <div className="font-medium" key="proposal-number">
                {proposal.proposalNumber}
              </div>,
              client?.company ?? client?.fullName ?? "Unknown client",
              proposal.documentLink ? "Attached" : "Missing",
              <Badge
                className="ml-auto"
                key="state"
                variant={proposal.archived ? "outline" : "secondary"}
              >
                {proposal.archived ? "Archived" : "Active"}
              </Badge>,
            ],
            detailTitle: proposal.proposalNumber,
            detailDescription:
              "Example proposal data with linked client context and document state.",
            details: [
              {
                label: "Client",
                value: client?.company ?? client?.fullName ?? "Unknown client",
              },
              {
                label: "Document",
                value: proposal.documentLink ?? "No document link saved",
              },
              {
                label: "Invoices",
                value:
                  linkedInvoices.length > 0
                    ? linkedInvoices
                        .map((invoice) => invoice.invoiceNumber)
                        .join(", ")
                    : "Not invoiced yet",
              },
              {
                label: "State",
                value: proposal.archived ? "Archived" : "Active",
              },
            ],
          };
        })}
        title="Proposals"
      />
    </AppShell>
  );
}
