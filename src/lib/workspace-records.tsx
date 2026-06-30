import {
  type RemixiconComponentType,
  RiBillLine,
  RiFileList3Line,
  RiReceiptLine,
  RiUser3Line,
} from "@remixicon/react";
import Link from "next/link";
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
import {
  expenseCategoryOptions,
  getExpenseCategoryLabel,
} from "@/lib/expense-category";
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

type WorkflowAction = {
  label: string;
  href: string;
  tone?: "primary" | "muted";
};

function WorkflowPanel({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions: WorkflowAction[];
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border/70 bg-muted/15 p-4">
      <div>
        <p className="font-heading text-sm font-semibold text-foreground">
          {title}
        </p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Link
            className={
              action.tone === "primary"
                ? "inline-flex h-8 items-center rounded-md bg-primary px-3 text-primary-foreground text-sm font-medium hover:bg-[#828fff]"
                : "inline-flex h-8 items-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-accent"
            }
            href={action.href}
            key={action.href}
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

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
      detailDescription: (
        <WorkflowPanel
          title="Lead won: confirm the commercial path"
          description="Use this client as the recovery point after a won lead. Link existing records first to avoid duplicates, then create only the missing proposal or invoice."
          actions={[
            {
              label:
                linkedProposals.length > 0 ? "Open proposal" : "Draft proposal",
              href:
                linkedProposals.length > 0
                  ? `/proposals?record=${linkedProposals[0].id}`
                  : `/clients?record=${client.id}&create=proposal&clientId=${client.id}&status=draft&returnTo=${encodeURIComponent(`/clients?record=${client.id}`)}`,
              tone: "primary",
            },
            {
              label:
                linkedInvoices.length > 0 ? "Open invoice" : "Create invoice",
              href:
                linkedInvoices.length > 0
                  ? `/invoices?record=${linkedInvoices[0].id}`
                  : `/clients?record=${client.id}&create=invoice&clientId=${client.id}&returnTo=${encodeURIComponent(`/clients?record=${client.id}`)}`,
            },
            {
              label: "Create follow-up task",
              href: `/clients?record=${client.id}`,
            },
          ]}
        />
      ),
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
      detailDescription: (
        <div className="space-y-4">
          {proposal.description ? <p>{proposal.description}</p> : null}
          <WorkflowPanel
            title={
              proposal.status === "accepted"
                ? "Proposal accepted: finish handoff"
                : "Proposal workflow"
            }
            description={
              linkedInvoices.length > 0
                ? "An invoice is already linked. Continue from the existing record instead of creating a duplicate."
                : proposal.status === "accepted"
                  ? "Confirm the client/project handoff, then create the invoice with this proposal already linked."
                  : "Keep the proposal moving. When it is accepted, the same workflow can create the linked invoice."
            }
            actions={[
              {
                label: "Open client",
                href: client ? `/clients?record=${client.id}` : "/clients",
              },
              {
                label:
                  linkedInvoices.length > 0
                    ? "Open linked invoice"
                    : "Create linked invoice",
                href:
                  linkedInvoices.length > 0
                    ? `/invoices?record=${linkedInvoices[0].id}`
                    : `/proposals?record=${proposal.id}&create=invoice&clientId=${proposal.clientId}&proposalId=${proposal.id}&returnTo=${encodeURIComponent(`/proposals?record=${proposal.id}`)}`,
                tone: proposal.status === "accepted" ? "primary" : "muted",
              },
              {
                label: "Create follow-up task",
                href: `/proposals?record=${proposal.id}`,
              },
            ]}
          />
        </div>
      ),
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
      detailDescription: (
        <WorkflowPanel
          title="Invoice created"
          description="This invoice keeps its client and proposal context. Use the links below to return to the originating workflow or relink the invoice if it was created after skipping a step."
          actions={[
            {
              label: "Open client",
              href: client ? `/clients?record=${client.id}` : "/clients",
            },
            {
              label: proposal ? "Return to proposal" : "Link a proposal",
              href: proposal
                ? `/proposals?record=${proposal.id}`
                : `/invoices?record=${invoice.id}`,
              tone: proposal ? "primary" : "muted",
            },
          ]}
        />
      ),
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
    const category = getExpenseCategoryLabel(expense.category);

    const expenseFilterKeys = ["All", expense.archived ? "Archived" : "Active"];

    const t = (
      field:
        | "date"
        | "supplier"
        | "amount"
        | "vatAmount"
        | "category"
        | "archived",
    ): EditableFieldDescriptor["target"] =>
      ({ entity: "expense", id: expense.id, field }) as const;

    return {
      id: String(expense.id),
      entity: "expense" as const,
      archived: expense.archived,
      group: category,
      filterKeys: expenseFilterKeys,
      filterAttributes: {
        Category: category,
        Date: expense.date.slice(0, 4),
        State: expense.archived ? "Archived" : "Active",
      },
      sortValues: {
        amount: expense.amount,
        category,
        date: expense.date,
        supplier: expense.supplier,
        state: expense.archived ? 1 : 0,
      },
      eyebrow: `EXP-${String(expense.id).padStart(3, "0")}`,
      title: expense.supplier,
      subtitle: category,
      tags: [
        <RowPill key="amount">{formatCurrency(expense.amount)}</RowPill>,
        expense.archived ? <RowPill key="state">Archived</RowPill> : null,
      ],
      meta: [expense.date, `VAT ${formatCurrency(expense.vatAmount)}`],
      actions: [
        <ArchiveRecordButton
          archived={expense.archived}
          entity="expense"
          key="archive"
          recordId={expense.id}
        />,
      ],
      detailTitle: expense.supplier,
      detailDescription: `Expense recorded on ${expense.date}.`,
      detailSections: [
        {
          title: "Properties",
          items: [
            {
              label: "State",
              value: String(expense.archived),
              editable: {
                type: "select",
                target: t("archived"),
                options: ARCHIVED_OPTIONS,
                shortcutKey: "a",
              } satisfies EditableFieldDescriptor,
            },
            {
              label: "Date",
              value: expense.date,
              editable: {
                type: "date",
                target: t("date"),
                shortcutKey: "d",
              } satisfies EditableFieldDescriptor,
            },
            {
              label: "Supplier",
              value: expense.supplier,
              editable: {
                type: "text",
                target: t("supplier"),
                shortcutKey: "s",
              } satisfies EditableFieldDescriptor,
            },
            {
              label: "Amount",
              value: String(expense.amount),
              editable: {
                type: "money",
                target: t("amount"),
                shortcutKey: "m",
              } satisfies EditableFieldDescriptor,
            },
            {
              label: "VAT amount",
              value: String(expense.vatAmount),
              editable: {
                type: "money",
                target: t("vatAmount"),
                shortcutKey: "v",
              } satisfies EditableFieldDescriptor,
            },
            {
              label: "Category",
              value: expense.category,
              editable: {
                type: "select",
                target: t("category"),
                options: [...expenseCategoryOptions],
                shortcutKey: "c",
              } satisfies EditableFieldDescriptor,
            },
            {
              label: "Expense #",
              value: `EXP-${String(expense.id).padStart(3, "0")}`,
            },
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
