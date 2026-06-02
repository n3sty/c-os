import {
  type RemixiconComponentType,
  RiBillLine,
  RiFileList3Line,
  RiReceiptLine,
  RiUser3Line,
} from "@remixicon/react";

import type { WorkspaceRecord } from "@/components/app/record-workspace";
import { Badge } from "@/components/ui/badge";
import {
  formatCurrency,
  getClientById,
  getInvoiceStatusBadgeVariant,
  getProposalById,
  seedClients,
  seedExpenses,
  seedInvoices,
  seedProposals,
} from "@/lib/seed-data";

export type WorkspaceEntityType = "client" | "proposal" | "invoice" | "expense";

export type WorkspaceTarget = {
  type: WorkspaceEntityType;
  id: number;
};

type WorkspaceEntityContext = {
  title: string;
  basePath: string;
  icon: RemixiconComponentType;
  records: WorkspaceRecord[];
  record: WorkspaceRecord | null;
};

function getYearFromNumber(value: string) {
  return value.match(/\d{4}/)?.[0] ?? "Unknown year";
}

function buildClientRecords() {
  return seedClients.map((client) => {
    const linkedProposals = seedProposals.filter(
      (proposal) => proposal.clientId === client.id,
    );
    const linkedInvoices = seedInvoices.filter(
      (invoice) => invoice.clientId === client.id,
    );
    const companyLabel = client.company ?? "Independent";

    return {
      id: String(client.id),
      group: companyLabel,
      eyebrow: client.clientNumber,
      title: client.fullName,
      subtitle: client.email,
      tags: [
        client.archived ? (
          <Badge key="state" variant="outline">
            Archived
          </Badge>
        ) : null,
      ],
      meta: [
        `${linkedProposals.length} proposals`,
        `${linkedInvoices.length} invoices`,
      ],
      detailTitle: client.fullName,
      detailDescription:
        "Client profile, contact route, and linked commercial records.",
      detailSections: [
        {
          title: "Properties",
          items: [
            {
              label: "State",
              value: client.archived ? "Archived" : "Active",
            },
            { label: "Client #", value: client.clientNumber },
            { label: "Company", value: companyLabel },
          ],
        },
        {
          title: "Contact",
          items: [
            { label: "Email", value: client.email },
            { label: "Name", value: client.fullName },
          ],
        },
        {
          title: "Linked records",
          items: [
            {
              label: "Proposals",
              value:
                linkedProposals.length > 0
                  ? "Linked proposals"
                  : "No proposals",
              links: linkedProposals.map((proposal) => ({
                href: `/proposals?record=${proposal.id}`,
                label: proposal.proposalNumber,
                meta: proposal.archived ? "Archived" : undefined,
              })),
            },
            {
              label: "Invoices",
              value:
                linkedInvoices.length > 0 ? "Linked invoices" : "No invoices",
              links: linkedInvoices.map((invoice) => ({
                href: `/invoices?record=${invoice.id}`,
                label: invoice.invoiceNumber,
                meta: invoice.status,
              })),
            },
          ],
        },
      ],
      activity: "Client created from seed data for workflow review.",
    } satisfies WorkspaceRecord;
  });
}

function buildProposalRecords() {
  return seedProposals.map((proposal) => {
    const client = getClientById(proposal.clientId);
    const clientLabel = client?.company ?? client?.fullName ?? "Unknown client";
    const linkedInvoices = seedInvoices.filter(
      (invoice) => invoice.proposalId === proposal.id,
    );

    return {
      id: String(proposal.id),
      group: clientLabel,
      eyebrow: proposal.proposalNumber,
      title: clientLabel,
      subtitle: proposal.documentLink ?? "No document link saved",
      tags: [
        proposal.archived ? (
          <Badge key="state" variant="outline">
            Archived
          </Badge>
        ) : null,
      ],
      meta: [
        getYearFromNumber(proposal.proposalNumber),
        `${linkedInvoices.length} invoices`,
      ],
      detailTitle: proposal.proposalNumber,
      detailDescription:
        "Proposal context, document reference, client ownership, and invoice relationship.",
      detailSections: [
        {
          title: "Properties",
          items: [
            {
              label: "State",
              value: proposal.archived ? "Archived" : "Active",
            },
            {
              label: "Year",
              value: getYearFromNumber(proposal.proposalNumber),
            },
            { label: "Proposal #", value: proposal.proposalNumber },
          ],
        },
        {
          title: "Client",
          items: [
            {
              label: "Client",
              value: clientLabel,
              links: client
                ? [
                    {
                      href: `/clients?record=${client.id}`,
                      label: clientLabel,
                      meta: client.clientNumber,
                    },
                  ]
                : undefined,
            },
            { label: "Email", value: client?.email },
          ],
        },
        {
          title: "Document",
          items: [
            {
              label: "Link",
              value: proposal.documentLink ?? "No document link saved",
            },
          ],
        },
        {
          title: "Linked invoices",
          items: [
            {
              label: "Invoices",
              value:
                linkedInvoices.length > 0 ? "Linked invoices" : "Not invoiced",
              links: linkedInvoices.map((invoice) => ({
                href: `/invoices?record=${invoice.id}`,
                label: invoice.invoiceNumber,
                meta: invoice.status,
              })),
            },
          ],
        },
      ],
      activity: "Proposal created from seed data for workflow review.",
    } satisfies WorkspaceRecord;
  });
}

function buildInvoiceRecords() {
  return seedInvoices.map((invoice) => {
    const client = getClientById(invoice.clientId);
    const clientLabel = client?.company ?? client?.fullName ?? "Unknown client";
    const proposal = invoice.proposalId
      ? getProposalById(invoice.proposalId)
      : null;

    return {
      id: String(invoice.id),
      group: clientLabel,
      eyebrow: invoice.invoiceNumber,
      title: clientLabel,
      subtitle: proposal?.proposalNumber ?? "Direct invoice",
      tags: [
        <Badge
          className="capitalize"
          key="status"
          variant={getInvoiceStatusBadgeVariant(invoice.status)}
        >
          {invoice.status}
        </Badge>,
      ],
      meta: [
        getYearFromNumber(invoice.invoiceNumber),
        invoice.archived ? "Archived" : "Active",
      ],
      detailTitle: invoice.invoiceNumber,
      detailDescription:
        "Invoice lifecycle, document state, payment status, and commercial links.",
      detailSections: [
        {
          title: "Properties",
          items: [
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
            {
              label: "Year",
              value: getYearFromNumber(invoice.invoiceNumber),
            },
            { label: "Invoice #", value: invoice.invoiceNumber },
          ],
        },
        {
          title: "Client",
          items: [
            {
              label: "Client",
              value: clientLabel,
              links: client
                ? [
                    {
                      href: `/clients?record=${client.id}`,
                      label: clientLabel,
                      meta: client.clientNumber,
                    },
                  ]
                : undefined,
            },
            { label: "Email", value: client?.email },
          ],
        },
        {
          title: "Proposal",
          items: [
            {
              label: "Proposal",
              value: proposal?.proposalNumber ?? "Direct invoice",
              links: proposal
                ? [
                    {
                      href: `/proposals?record=${proposal.id}`,
                      label: proposal.proposalNumber,
                      meta: proposal.archived ? "Archived" : undefined,
                    },
                  ]
                : undefined,
            },
          ],
        },
        {
          title: "Document",
          items: [
            {
              label: "Link",
              value: invoice.documentLink ?? "No document link saved",
            },
          ],
        },
      ],
      activity: "Invoice created from seed data for workflow review.",
    } satisfies WorkspaceRecord;
  });
}

function buildExpenseRecords() {
  return seedExpenses.map((expense) => {
    const amountBand =
      expense.amount < 50
        ? "Under $50"
        : expense.amount < 150
          ? "$50-$149"
          : "$150+";

    return {
      id: String(expense.id),
      group: amountBand,
      eyebrow: `EXP-${String(expense.id).padStart(3, "0")}`,
      title: expense.description,
      subtitle: "Bookkeeping export",
      tags: [
        <Badge key="amount" variant="secondary">
          {formatCurrency(expense.amount)}
        </Badge>,
      ],
      detailTitle: expense.description,
      detailDescription:
        "Expense entry, amount classification, and export context.",
      detailSections: [
        {
          title: "Properties",
          items: [
            { label: "Amount", value: formatCurrency(expense.amount) },
            { label: "Band", value: amountBand },
            {
              label: "Expense #",
              value: `EXP-${String(expense.id).padStart(3, "0")}`,
            },
          ],
        },
        {
          title: "Export",
          items: [
            { label: "Scope", value: "Bookkeeping export" },
            { label: "State", value: "Included" },
          ],
        },
      ],
      activity: "Expense created from seed data for workflow review.",
    } satisfies WorkspaceRecord;
  });
}

export function getWorkspaceRecords(type: WorkspaceEntityType) {
  switch (type) {
    case "client":
      return buildClientRecords();
    case "proposal":
      return buildProposalRecords();
    case "invoice":
      return buildInvoiceRecords();
    case "expense":
      return buildExpenseRecords();
  }
}

export function getWorkspaceEntityContext(
  target: WorkspaceTarget,
): WorkspaceEntityContext | null {
  const records = getWorkspaceRecords(target.type);
  const record = records.find((item) => item.id === String(target.id)) ?? null;

  switch (target.type) {
    case "client":
      return {
        title: "Clients",
        basePath: "/clients",
        icon: RiUser3Line,
        records,
        record,
      };
    case "proposal":
      return {
        title: "Proposals",
        basePath: "/proposals",
        icon: RiFileList3Line,
        records,
        record,
      };
    case "invoice":
      return {
        title: "Invoices",
        basePath: "/invoices",
        icon: RiBillLine,
        records,
        record,
      };
    case "expense":
      return {
        title: "Expenses",
        basePath: "/expenses",
        icon: RiReceiptLine,
        records,
        record,
      };
  }
}
