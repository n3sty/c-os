import type {
  SeedClient,
  SeedExpense,
  SeedInvoice,
  SeedProposal,
  SeedProposalStatus,
} from "@/lib/database/seed-data";
import { getNextTrackedNumber } from "@/lib/numbering";

export const creationTargets = [
  "client",
  "proposal",
  "invoice",
  "expense",
] as const;

export type CreationTarget = (typeof creationTargets)[number];
export type SelectOption = { label: string; value: string };

export type CreationField = {
  name: string;
  label: string;
  type?: "text" | "email" | "date" | "url";
  placeholder?: string;
  value?: string;
  required?: boolean;
  readOnly?: boolean;
  options?: SelectOption[];
};

export type CreationConfig = {
  target: CreationTarget;
  title: string;
  description: string;
  submitLabel: string;
  fields: CreationField[];
};

export type FormOptionsContext = {
  clients: SelectOption[];
  proposals: SelectOption[];
  clientNumbers: string[];
  proposalNumbers: string[];
  invoiceNumbers: string[];
};

export type EditConfig = CreationConfig & {
  id: number;
  basePath: string;
  deleteLabel: string;
};

export const proposalStatuses = [
  "draft",
  "sent",
  "accepted",
  "declined",
] as const satisfies readonly SeedProposalStatus[];

export const emptyOptionsContext: FormOptionsContext = {
  clients: [],
  proposals: [],
  clientNumbers: [],
  proposalNumbers: [],
  invoiceNumbers: [],
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function getArchivedOptions(current = false) {
  return [
    { label: "Active", value: "false" },
    { label: "Archived", value: "true" },
  ].map((option) => ({
    ...option,
    label: option.value === String(current) ? `${option.label}` : option.label,
  }));
}

export function buildFormOptions({
  clients,
  proposals,
  invoices,
}: {
  clients: SeedClient[];
  proposals: SeedProposal[];
  invoices: SeedInvoice[];
}): FormOptionsContext {
  return {
    clients: clients
      .filter((client) => !client.archived)
      .map((client) => ({
        label: client.company ?? client.fullName,
        value: String(client.id),
      })),
    proposals: [
      { label: "Direct invoice", value: "none" },
      ...proposals.map((proposal) => ({
        label: proposal.proposalNumber,
        value: String(proposal.id),
      })),
    ],
    clientNumbers: clients.map((client) => client.clientNumber),
    proposalNumbers: proposals.map((proposal) => proposal.proposalNumber),
    invoiceNumbers: invoices.map((invoice) => invoice.invoiceNumber),
  };
}

export function getCreationConfig(
  target: CreationTarget,
  optionsContext: FormOptionsContext = emptyOptionsContext,
): CreationConfig {
  switch (target) {
    case "client":
      return {
        target,
        title: "New client",
        description: "Create a client record for proposals and invoices.",
        submitLabel: "Create client",
        fields: [
          {
            name: "projectOrClientName",
            label: "Project or client name",
            placeholder: "Atlas Bio",
            required: true,
          },
          {
            name: "contactName",
            label: "Contact person",
            placeholder: "Jules Vermeer",
            required: true,
          },
          {
            name: "contactEmail",
            label: "Contact email",
            type: "email",
            placeholder: "jules@atlasbio.nl",
            required: true,
          },
        ],
      };
    case "proposal":
      return {
        target,
        title: "New proposal",
        description: "Track a proposal number and link it to a client.",
        submitLabel: "Create proposal",
        fields: [
          {
            name: "proposalNumber",
            label: "Proposal number",
            readOnly: true,
            required: true,
            placeholder: getNextTrackedNumber(
              "proposal",
              optionsContext.proposalNumbers,
            ),
          },
          {
            name: "clientId",
            label: "Client",
            required: true,
            options: optionsContext.clients,
          },
          {
            name: "title",
            label: "Title",
            placeholder: "Research sprint proposal",
            required: true,
          },
          {
            name: "date",
            label: "Date",
            type: "date",
            required: true,
            placeholder: today(),
          },
          {
            name: "status",
            label: "Status",
            required: true,
            options: proposalStatuses.map((status) => ({
              label: status,
              value: status,
            })),
          },
        ],
      };
    case "invoice":
      return {
        target,
        title: "New invoice",
        description: "Create an invoice record and set its initial status.",
        submitLabel: "Create invoice",
        fields: [
          {
            name: "invoiceNumber",
            label: "Invoice number",
            readOnly: true,
            required: true,
            placeholder: getNextTrackedNumber(
              "invoice",
              optionsContext.invoiceNumbers,
            ),
          },
          {
            name: "clientId",
            label: "Client",
            required: true,
            options: optionsContext.clients,
          },
          {
            name: "proposalId",
            label: "Proposal",
            options: optionsContext.proposals,
          },
          {
            name: "documentLink",
            label: "Document link",
            type: "url",
            placeholder: "https://docs.example.com/invoices/...",
          },
          {
            name: "status",
            label: "Status",
            required: true,
            options: ["draft", "sent", "paid", "overdue"].map((status) => ({
              label: status,
              value: status,
            })),
          },
        ],
      };
    case "expense":
      return {
        target,
        title: "New expense",
        description: "Create an expense record for bookkeeping export.",
        submitLabel: "Create expense",
        fields: [
          {
            name: "expenseTitle",
            label: "Expense title",
            placeholder: "Client workshop travel",
            required: true,
          },
          {
            name: "amount",
            label: "Amount",
            placeholder: "186.40",
            required: true,
          },
        ],
      };
  }
}

export function getEditConfig({
  basePath,
  optionsContext,
  record,
  target,
}: {
  basePath: string;
  optionsContext: FormOptionsContext;
  record: SeedClient | SeedProposal | SeedInvoice | SeedExpense;
  target: CreationTarget;
}): EditConfig {
  switch (target) {
    case "client": {
      const client = record as SeedClient;
      return {
        id: client.id,
        basePath,
        target,
        title: "Edit client",
        description: "Update client details and archive state.",
        submitLabel: "Save client",
        deleteLabel: "Delete client",
        fields: [
          {
            name: "projectOrClientName",
            label: "Project or client name",
            required: true,
            value: client.company ?? "",
            placeholder: "Atlas Bio",
          },
          {
            name: "contactName",
            label: "Contact person",
            required: true,
            value: client.fullName,
          },
          {
            name: "contactEmail",
            label: "Contact email",
            type: "email",
            required: true,
            value: client.email,
          },
          {
            name: "archived",
            label: "State",
            options: getArchivedOptions(client.archived),
            required: true,
            value: String(client.archived),
          },
        ],
      };
    }
    case "proposal": {
      const proposal = record as SeedProposal;
      return {
        id: proposal.id,
        basePath,
        target,
        title: "Edit proposal",
        description: "Update proposal details, ownership, and state.",
        submitLabel: "Save proposal",
        deleteLabel: "Delete proposal",
        fields: [
          {
            name: "proposalNumber",
            label: "Proposal number",
            readOnly: true,
            required: true,
            value: proposal.proposalNumber,
          },
          {
            name: "clientId",
            label: "Client",
            required: true,
            options: optionsContext.clients,
            value: String(proposal.clientId),
          },
          {
            name: "title",
            label: "Title",
            required: true,
            value: proposal.title,
          },
          {
            name: "date",
            label: "Date",
            type: "date",
            required: true,
            value: proposal.date,
            placeholder: proposal.date,
          },
          {
            name: "status",
            label: "Status",
            required: true,
            options: proposalStatuses.map((status) => ({
              label: status,
              value: status,
            })),
            value: proposal.status,
          },
          {
            name: "archived",
            label: "State",
            options: getArchivedOptions(proposal.archived),
            required: true,
            value: String(proposal.archived),
          },
          {
            name: "documentLink",
            label: "Document link",
            type: "url",
            value: proposal.documentLink ?? "",
            placeholder: "https://docs.example.com/proposals/...",
          },
        ],
      };
    }
    case "invoice": {
      const invoice = record as SeedInvoice;
      return {
        id: invoice.id,
        basePath,
        target,
        title: "Edit invoice",
        description: "Update invoice links, status, and archive state.",
        submitLabel: "Save invoice",
        deleteLabel: "Delete invoice",
        fields: [
          {
            name: "invoiceNumber",
            label: "Invoice number",
            readOnly: true,
            required: true,
            value: invoice.invoiceNumber,
          },
          {
            name: "clientId",
            label: "Client",
            required: true,
            options: optionsContext.clients,
            value: String(invoice.clientId),
          },
          {
            name: "proposalId",
            label: "Proposal",
            options: optionsContext.proposals,
            value: invoice.proposalId ? String(invoice.proposalId) : "none",
          },
          {
            name: "status",
            label: "Status",
            required: true,
            options: ["draft", "sent", "paid", "overdue", "void"].map(
              (status) => ({
                label: status,
                value: status,
              }),
            ),
            value: invoice.status,
          },
          {
            name: "archived",
            label: "State",
            options: getArchivedOptions(invoice.archived),
            required: true,
            value: String(invoice.archived),
          },
          {
            name: "documentLink",
            label: "Document link",
            type: "url",
            value: invoice.documentLink ?? "",
            placeholder: "https://docs.example.com/invoices/...",
          },
        ],
      };
    }
    case "expense": {
      const expense = record as SeedExpense;
      return {
        id: expense.id,
        basePath,
        target,
        title: "Edit expense",
        description: "Update amount and bookkeeping description.",
        submitLabel: "Save expense",
        deleteLabel: "Delete expense",
        fields: [
          {
            name: "expenseTitle",
            label: "Expense title",
            required: true,
            value: expense.description,
          },
          {
            name: "amount",
            label: "Amount",
            required: true,
            value: String(expense.amount),
          },
        ],
      };
    }
  }
}

export function isCreationTarget(
  value: string | null,
): value is CreationTarget {
  return creationTargets.includes(value as CreationTarget);
}

export function getCreateHref(pathname: string, target: CreationTarget) {
  const separator = pathname.includes("?") ? "&" : "?";
  return `${pathname}${separator}create=${target}`;
}
