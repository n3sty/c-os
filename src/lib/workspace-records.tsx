import {
  type RemixiconComponentType,
  RiBillLine,
  RiFileList3Line,
  RiReceiptLine,
  RiUser3Line,
} from "@remixicon/react";
import { ArchiveRecordButton } from "@/components/app/archive-record-button";
import { InvoiceStatusPicker } from "@/components/app/invoice-status-controls";
import {
  type EditableFieldDescriptor,
  RowPill,
  type WorkspaceRecord,
} from "@/components/app/record-workspace";
import {
  formatCurrency,
  loadWorkspaceSnapshot,
  type WorkspaceSnapshot,
} from "@/lib/database";
import { getExpenseCategory } from "@/lib/expense-category";
import {
  getInvoiceFilterKeys,
  getProposalFilterKeys,
} from "@/lib/record-visibility";

const ARCHIVED_OPTIONS = [
  { label: "Active", value: "false" },
  { label: "Archived", value: "true" },
];

const PROPOSAL_STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Accepted", value: "accepted" },
  { label: "Declined", value: "declined" },
];

const INVOICE_STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Paid", value: "paid" },
  { label: "Overdue", value: "overdue" },
  { label: "Void", value: "void" },
];

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

function getClientById(snapshot: WorkspaceSnapshot, clientId: number) {
  return snapshot.clients.find((client) => client.id === clientId) ?? null;
}

function getProposalById(snapshot: WorkspaceSnapshot, proposalId: number) {
  return (
    snapshot.proposals.find((proposal) => proposal.id === proposalId) ?? null
  );
}

function buildClientRecords(snapshot: WorkspaceSnapshot) {
  return snapshot.clients.map((client) => {
    const linkedProposals = snapshot.proposals.filter(
      (proposal) => proposal.clientId === client.id,
    );
    const linkedInvoices = snapshot.invoices.filter(
      (invoice) => invoice.clientId === client.id,
    );
    const companyLabel = client.company ?? "Independent";
    const t = (
      field: "fullName" | "email" | "company" | "archived",
    ): EditableFieldDescriptor["target"] =>
      ({ entity: "client", id: client.id, field }) as const;

    return {
      id: String(client.id),
      entity: "client" as const,
      archived: client.archived,
      group: companyLabel,
      filterKeys: [client.archived ? "Archived" : "Active"],
      filterAttributes: {
        Company: companyLabel,
        State: client.archived ? "Archived" : "Active",
      },
      sortValues: {
        client: client.fullName,
        company: companyLabel,
        state: client.archived ? 1 : 0,
      },
      eyebrow: client.clientNumber,
      title: client.fullName,
      subtitle: client.email,
      tags: [client.archived ? <RowPill key="state">Archived</RowPill> : null],
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
              value: String(client.archived),
              editable: {
                type: "select",
                target: t("archived"),
                options: ARCHIVED_OPTIONS,
                shortcutKey: "a",
              } satisfies EditableFieldDescriptor,
            },
            { label: "Client #", value: client.clientNumber },
            {
              label: "Company",
              value: client.company ?? "",
              editable: {
                type: "text",
                target: t("company"),
                shortcutKey: "o",
                placeholder: "Independent",
              } satisfies EditableFieldDescriptor,
            },
          ],
        },
        {
          title: "Contact",
          items: [
            {
              label: "Email",
              value: client.email,
              editable: {
                type: "text",
                target: t("email"),
                shortcutKey: "e",
                inputType: "email",
              } satisfies EditableFieldDescriptor,
            },
            {
              label: "Name",
              value: client.fullName,
              editable: {
                type: "text",
                target: t("fullName"),
                shortcutKey: "n",
              } satisfies EditableFieldDescriptor,
            },
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
      activity: "Client loaded from the workspace data layer.",
    } satisfies WorkspaceRecord;
  });
}

function buildProposalRecords(snapshot: WorkspaceSnapshot) {
  return snapshot.proposals.map((proposal) => {
    const client = getClientById(snapshot, proposal.clientId);
    const clientLabel = client?.company ?? client?.fullName ?? "Unknown client";
    const linkedInvoices = snapshot.invoices.filter(
      (invoice) => invoice.proposalId === proposal.id,
    );
    const clientOptions = snapshot.clients
      .filter((c) => !c.archived)
      .map((c) => ({ label: c.company ?? c.fullName, value: String(c.id) }));

    const proposalFilterKeys = getProposalFilterKeys(proposal);

    const t = (
      field:
        | "title"
        | "date"
        | "status"
        | "documentLink"
        | "archived"
        | "clientId",
    ): EditableFieldDescriptor["target"] =>
      ({ entity: "proposal", id: proposal.id, field }) as const;

    return {
      id: String(proposal.id),
      entity: "proposal" as const,
      archived: proposal.archived,
      group: clientLabel,
      filterKeys: proposalFilterKeys,
      filterAttributes: {
        Client: clientLabel,
        Date: getYearFromNumber(proposal.proposalNumber),
        Status: proposal.status,
        State: proposal.archived ? "Archived" : "Active",
      },
      sortValues: {
        client: clientLabel,
        date: proposal.date,
        status: proposal.status,
        state: proposal.archived ? 1 : 0,
      },
      eyebrow: proposal.proposalNumber,
      title: proposal.title,
      subtitle: clientLabel,
      tags: [
        <RowPill href={`/proposals?record=${proposal.id}`} key="status">
          {proposal.status}
        </RowPill>,
        proposal.archived ? <RowPill key="state">Archived</RowPill> : null,
      ],
      meta: [proposal.date, `${linkedInvoices.length} invoices`],
      actions: [
        <ArchiveRecordButton
          archived={proposal.archived}
          entity="proposal"
          key="archive"
          recordId={proposal.id}
        />,
      ],
      detailTitle: proposal.title,
      detailDescription: proposal.description ?? "",
      descriptionSaveTarget: { entityType: "proposal", id: proposal.id },
      detailSections: [
        {
          title: "Properties",
          items: [
            {
              label: "State",
              value: String(proposal.archived),
              editable: {
                type: "select",
                target: t("archived"),
                options: ARCHIVED_OPTIONS,
                shortcutKey: "a",
              } satisfies EditableFieldDescriptor,
            },
            {
              label: "Year",
              value: getYearFromNumber(proposal.proposalNumber),
            },
            {
              label: "Status",
              value: proposal.status,
              editable: {
                type: "select",
                target: t("status"),
                options: PROPOSAL_STATUS_OPTIONS,
                shortcutKey: "s",
              } satisfies EditableFieldDescriptor,
            },
            {
              label: "Date",
              value: proposal.date,
              editable: {
                type: "date",
                target: t("date"),
                shortcutKey: "d",
              } satisfies EditableFieldDescriptor,
            },
            { label: "Proposal #", value: proposal.proposalNumber },
          ],
        },
        {
          title: "Client",
          items: [
            {
              label: "Client",
              value: String(proposal.clientId),
              editable: {
                type: "select",
                target: t("clientId"),
                options: clientOptions,
                shortcutKey: "c",
              } satisfies EditableFieldDescriptor,
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
              label: "Title",
              value: proposal.title,
              editable: {
                type: "text",
                target: t("title"),
                shortcutKey: "t",
              } satisfies EditableFieldDescriptor,
            },
            {
              label: "Link",
              value: proposal.documentLink ?? "",
              editable: {
                type: "text",
                target: t("documentLink"),
                inputType: "url",
                placeholder: "https://...",
              } satisfies EditableFieldDescriptor,
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
      activity: "Proposal loaded from the workspace data layer.",
    } satisfies WorkspaceRecord;
  });
}

function buildInvoiceRecords(snapshot: WorkspaceSnapshot) {
  return snapshot.invoices.map((invoice) => {
    const client = getClientById(snapshot, invoice.clientId);
    const clientLabel = client?.company ?? client?.fullName ?? "Unknown client";
    const proposal = invoice.proposalId
      ? getProposalById(snapshot, invoice.proposalId)
      : null;
    const clientOptions = snapshot.clients
      .filter((c) => !c.archived)
      .map((c) => ({ label: c.company ?? c.fullName, value: String(c.id) }));
    const proposalOptions = [
      { label: "Direct invoice", value: "none" },
      ...snapshot.proposals.map((p) => ({
        label: p.proposalNumber,
        value: String(p.id),
      })),
    ];

    const invoiceFilterKeys = getInvoiceFilterKeys(invoice);

    const t = (
      field: "documentLink" | "status" | "archived" | "clientId" | "proposalId",
    ): EditableFieldDescriptor["target"] =>
      ({ entity: "invoice", id: invoice.id, field }) as const;

    return {
      id: String(invoice.id),
      entity: "invoice" as const,
      archived: invoice.archived,
      group: clientLabel,
      filterKeys: invoiceFilterKeys,
      filterAttributes: {
        Client: clientLabel,
        Date: getYearFromNumber(invoice.invoiceNumber),
        Status: invoice.status,
        State: invoice.archived ? "Archived" : "Active",
      },
      sortValues: {
        client: clientLabel,
        date: invoice.invoiceNumber,
        status: invoice.status,
        state: invoice.archived ? 1 : 0,
      },
      eyebrow: invoice.invoiceNumber,
      title: clientLabel,
      subtitle: proposal?.proposalNumber ?? "Direct invoice",
      tags: [
        <RowPill href={`/invoices?record=${invoice.id}`} key="status">
          {invoice.status}
        </RowPill>,
      ],
      meta: [
        getYearFromNumber(invoice.invoiceNumber),
        invoice.archived ? "Archived" : "Active",
      ],
      actions: [
        invoice.status !== "void" ? (
          <InvoiceStatusPicker
            invoiceId={invoice.id}
            key="status-picker"
            status={invoice.status}
          />
        ) : null,
        <ArchiveRecordButton
          archived={invoice.archived}
          entity="invoice"
          key="archive"
          recordId={invoice.id}
        />,
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
              value: invoice.status,
              editable: {
                type: "select",
                target: t("status"),
                options: INVOICE_STATUS_OPTIONS,
                shortcutKey: "s",
              } satisfies EditableFieldDescriptor,
            },
            {
              label: "State",
              value: String(invoice.archived),
              editable: {
                type: "select",
                target: t("archived"),
                options: ARCHIVED_OPTIONS,
                shortcutKey: "a",
              } satisfies EditableFieldDescriptor,
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
              value: String(invoice.clientId),
              editable: {
                type: "select",
                target: t("clientId"),
                options: clientOptions,
                shortcutKey: "c",
              } satisfies EditableFieldDescriptor,
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
              value: invoice.proposalId ? String(invoice.proposalId) : "none",
              editable: {
                type: "select",
                target: t("proposalId"),
                options: proposalOptions,
                shortcutKey: "p",
              } satisfies EditableFieldDescriptor,
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
              value: invoice.documentLink ?? "",
              editable: {
                type: "text",
                target: t("documentLink"),
                inputType: "url",
                placeholder: "https://...",
              } satisfies EditableFieldDescriptor,
            },
          ],
        },
      ],
      activity: "Invoice loaded from the workspace data layer.",
    } satisfies WorkspaceRecord;
  });
}

function buildExpenseRecords(snapshot: WorkspaceSnapshot) {
  return snapshot.expenses.map((expense) => {
    const category = getExpenseCategory(expense.description);
    const amountBand =
      expense.amount < 50
        ? "Under $50"
        : expense.amount < 150
          ? "$50-$149"
          : "$150+";

    const expenseFilterKeys = ["All"];
    if (expense.amount >= 150) expenseFilterKeys.push("Needs review");
    else expenseFilterKeys.push("Export ready");

    const t = (
      field: "description" | "amount",
    ): EditableFieldDescriptor["target"] =>
      ({ entity: "expense", id: expense.id, field }) as const;

    return {
      id: String(expense.id),
      entity: "expense" as const,
      archived: false,
      group: category,
      filterKeys: expenseFilterKeys,
      filterAttributes: {
        Category: category,
      },
      sortValues: {
        amount: expense.amount,
        category,
      },
      eyebrow: `EXP-${String(expense.id).padStart(3, "0")}`,
      title: expense.description,
      subtitle: category,
      tags: [<RowPill key="amount">{formatCurrency(expense.amount)}</RowPill>],
      detailTitle: expense.description,
      detailDescription: expense.description,
      descriptionSaveTarget: { entityType: "expense", id: expense.id },
      detailSections: [
        {
          title: "Properties",
          items: [
            {
              label: "Amount",
              value: String(expense.amount),
              editable: {
                type: "text",
                target: t("amount"),
                inputType: "number",
                shortcutKey: "m",
              } satisfies EditableFieldDescriptor,
            },
            { label: "Category", value: category },
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
      activity: "Expense loaded from the workspace data layer.",
    } satisfies WorkspaceRecord;
  });
}

export async function getWorkspaceRecords(
  type: WorkspaceEntityType,
  snapshot?: WorkspaceSnapshot,
) {
  const resolvedSnapshot = snapshot ?? (await loadWorkspaceSnapshot());

  switch (type) {
    case "client":
      return buildClientRecords(resolvedSnapshot);
    case "proposal":
      return buildProposalRecords(resolvedSnapshot);
    case "invoice":
      return buildInvoiceRecords(resolvedSnapshot);
    case "expense":
      return buildExpenseRecords(resolvedSnapshot);
  }
}

export async function getWorkspaceEntityContext(
  target: WorkspaceTarget,
): Promise<WorkspaceEntityContext | null> {
  const records = await getWorkspaceRecords(target.type);
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
