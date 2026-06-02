import type { VariantProps } from "class-variance-authority";

import type { badgeVariants } from "@/components/ui/badge";
import type { invoiceStatusEnum } from "@/lib/schema";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export type InvoiceStatus = (typeof invoiceStatusEnum.enumValues)[number];

export type SeedClient = {
  id: number;
  fullName: string;
  email: string;
  company: string | null;
  clientNumber: string;
  archived: boolean;
};

export type SeedProposal = {
  id: number;
  clientId: number;
  proposalNumber: string;
  documentLink: string | null;
  archived: boolean;
};

export type SeedInvoice = {
  id: number;
  clientId: number;
  proposalId: number | null;
  invoiceNumber: string;
  documentLink: string | null;
  status: InvoiceStatus;
  archived: boolean;
};

export type SeedExpense = {
  id: number;
  description: string;
  amount: number;
};

export const seedClients: SeedClient[] = [
  {
    id: 1,
    fullName: "Jules Vermeer",
    email: "jules@atlasbio.nl",
    company: "Atlas Bio",
    clientNumber: "CLI-1001",
    archived: false,
  },
  {
    id: 2,
    fullName: "Mina Alvarez",
    email: "mina@northstarlabs.co",
    company: "Northstar Labs",
    clientNumber: "CLI-1002",
    archived: false,
  },
  {
    id: 3,
    fullName: "Tobias Jensen",
    email: "tobias@cinderstudio.io",
    company: "Cinder Studio",
    clientNumber: "CLI-1003",
    archived: false,
  },
  {
    id: 4,
    fullName: "Leah Okafor",
    email: "leah@solvance.health",
    company: "Solvance Health",
    clientNumber: "CLI-1004",
    archived: true,
  },
];

export const seedProposals: SeedProposal[] = [
  {
    id: 1,
    clientId: 1,
    proposalNumber: "PROP-2026-001",
    documentLink: "https://docs.example.com/proposals/prop-2026-001",
    archived: false,
  },
  {
    id: 2,
    clientId: 2,
    proposalNumber: "PROP-2026-002",
    documentLink: null,
    archived: false,
  },
  {
    id: 3,
    clientId: 3,
    proposalNumber: "PROP-2026-003",
    documentLink: "https://docs.example.com/proposals/prop-2026-003",
    archived: false,
  },
  {
    id: 4,
    clientId: 4,
    proposalNumber: "PROP-2025-014",
    documentLink: "https://docs.example.com/proposals/prop-2025-014",
    archived: true,
  },
];

export const seedInvoices: SeedInvoice[] = [
  {
    id: 1,
    clientId: 1,
    proposalId: 1,
    invoiceNumber: "INV-2026-031",
    documentLink: "https://docs.example.com/invoices/inv-2026-031",
    status: "draft",
    archived: false,
  },
  {
    id: 2,
    clientId: 2,
    proposalId: 2,
    invoiceNumber: "INV-2026-032",
    documentLink: "https://docs.example.com/invoices/inv-2026-032",
    status: "sent",
    archived: false,
  },
  {
    id: 3,
    clientId: 3,
    proposalId: 3,
    invoiceNumber: "INV-2026-033",
    documentLink: null,
    status: "paid",
    archived: false,
  },
  {
    id: 4,
    clientId: 1,
    proposalId: null,
    invoiceNumber: "INV-2026-034",
    documentLink: "https://docs.example.com/invoices/inv-2026-034",
    status: "overdue",
    archived: false,
  },
  {
    id: 5,
    clientId: 4,
    proposalId: 4,
    invoiceNumber: "INV-2025-118",
    documentLink: "https://docs.example.com/invoices/inv-2025-118",
    status: "void",
    archived: true,
  },
];

export const seedExpenses: SeedExpense[] = [
  {
    id: 1,
    description: "Figma professional plan",
    amount: 24,
  },
  {
    id: 2,
    description: "Client workshop travel",
    amount: 186.4,
  },
  {
    id: 3,
    description: "Domain renewal",
    amount: 19.99,
  },
  {
    id: 4,
    description: "Bookkeeping handoff review",
    amount: 92.5,
  },
];

export function getClientById(clientId: number) {
  return seedClients.find((client) => client.id === clientId) ?? null;
}

export function getProposalById(proposalId: number) {
  return seedProposals.find((proposal) => proposal.id === proposalId) ?? null;
}

export function getClientProposalCount(clientId: number) {
  return seedProposals.filter((proposal) => proposal.clientId === clientId)
    .length;
}

export function getClientInvoiceCount(clientId: number) {
  return seedInvoices.filter((invoice) => invoice.clientId === clientId).length;
}

export function getInvoiceStatusBadgeVariant(
  status: InvoiceStatus,
): BadgeVariant {
  switch (status) {
    case "paid":
      return "secondary";
    case "overdue":
    case "void":
      return "outline";
    case "sent":
      return "default";
    default:
      return "muted";
  }
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
