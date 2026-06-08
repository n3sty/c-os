import type { VariantProps } from "class-variance-authority";

import type { badgeVariants } from "@/components/ui/badge";
import type { invoiceStatusEnum } from "@/lib/database/schema";
import type { ExpenseCategory } from "@/lib/expense-category";
import { formatTrackedNumber } from "@/lib/numbering";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export type InvoiceStatus = (typeof invoiceStatusEnum.enumValues)[number];
export type SeedProposalStatus = "draft" | "sent" | "accepted" | "declined";

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
  title: string;
  description: string | null;
  date: string;
  status: SeedProposalStatus;
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
  date: string;
  supplier: string;
  amount: number;
  vatAmount: number;
  category: ExpenseCategory;
  archived: boolean;
};

export type SeedNotificationTarget = {
  type: "client" | "proposal" | "invoice" | "expense";
  id: number;
};

export type SeedNotification = {
  id: string;
  title: string;
  description: string;
  source: string;
  accent: string;
  time: string;
  target: SeedNotificationTarget;
};

export const seedClients: SeedClient[] = [
  {
    id: 1,
    fullName: "Jules Vermeer",
    email: "jules@atlasbio.nl",
    company: "Atlas Bio",
    clientNumber: formatTrackedNumber("client", 1),
    archived: false,
  },
  {
    id: 2,
    fullName: "Mina Alvarez",
    email: "mina@northstarlabs.co",
    company: "Northstar Labs",
    clientNumber: formatTrackedNumber("client", 2),
    archived: false,
  },
  {
    id: 3,
    fullName: "Tobias Jensen",
    email: "tobias@cinderstudio.io",
    company: "Cinder Studio",
    clientNumber: formatTrackedNumber("client", 3),
    archived: false,
  },
  {
    id: 4,
    fullName: "Leah Okafor",
    email: "leah@solvance.health",
    company: "Solvance Health",
    clientNumber: formatTrackedNumber("client", 4),
    archived: true,
  },
];

export const seedProposals: SeedProposal[] = [
  {
    id: 1,
    clientId: 1,
    proposalNumber: formatTrackedNumber("proposal", 1, { year: 2026 }),
    title: "Atlas Bio research sprint",
    description: null,
    date: "2026-01-12",
    status: "accepted",
    documentLink: "https://docs.example.com/proposals/prop-2026-001",
    archived: false,
  },
  {
    id: 2,
    clientId: 2,
    proposalNumber: formatTrackedNumber("proposal", 2, { year: 2026 }),
    title: "Northstar launch workshop",
    description: null,
    date: "2026-02-03",
    status: "sent",
    documentLink: null,
    archived: false,
  },
  {
    id: 3,
    clientId: 3,
    proposalNumber: formatTrackedNumber("proposal", 3, { year: 2026 }),
    title: "Cinder Studio data cleanup",
    description: null,
    date: "2026-03-18",
    status: "draft",
    documentLink: "https://docs.example.com/proposals/prop-2026-003",
    archived: false,
  },
  {
    id: 4,
    clientId: 4,
    proposalNumber: formatTrackedNumber("proposal", 14, { year: 2025 }),
    title: "Solvance archive migration",
    description: null,
    date: "2025-11-29",
    status: "declined",
    documentLink: "https://docs.example.com/proposals/prop-2025-014",
    archived: true,
  },
];

export const seedInvoices: SeedInvoice[] = [
  {
    id: 1,
    clientId: 1,
    proposalId: 1,
    invoiceNumber: formatTrackedNumber("invoice", 31, { year: 2026 }),
    documentLink: "https://docs.example.com/invoices/inv-2026-031",
    status: "draft",
    archived: false,
  },
  {
    id: 2,
    clientId: 2,
    proposalId: 2,
    invoiceNumber: formatTrackedNumber("invoice", 32, { year: 2026 }),
    documentLink: "https://docs.example.com/invoices/inv-2026-032",
    status: "sent",
    archived: false,
  },
  {
    id: 3,
    clientId: 3,
    proposalId: 3,
    invoiceNumber: formatTrackedNumber("invoice", 33, { year: 2026 }),
    documentLink: null,
    status: "paid",
    archived: false,
  },
  {
    id: 4,
    clientId: 1,
    proposalId: null,
    invoiceNumber: formatTrackedNumber("invoice", 34, { year: 2026 }),
    documentLink: "https://docs.example.com/invoices/inv-2026-034",
    status: "overdue",
    archived: false,
  },
  {
    id: 5,
    clientId: 4,
    proposalId: 4,
    invoiceNumber: formatTrackedNumber("invoice", 118, { year: 2025 }),
    documentLink: "https://docs.example.com/invoices/inv-2025-118",
    status: "void",
    archived: true,
  },
];

export const seedExpenses: SeedExpense[] = [
  {
    id: 1,
    date: "2026-01-08",
    supplier: "Figma",
    amount: 24,
    vatAmount: 4.17,
    category: "software",
    archived: false,
  },
  {
    id: 2,
    date: "2026-02-14",
    supplier: "NS International",
    amount: 186.4,
    vatAmount: 16.96,
    category: "travel",
    archived: false,
  },
  {
    id: 3,
    date: "2026-03-02",
    supplier: "Cloudflare",
    amount: 19.99,
    vatAmount: 3.47,
    category: "software",
    archived: false,
  },
  {
    id: 4,
    date: "2026-04-22",
    supplier: "Ledgerworks",
    amount: 92.5,
    vatAmount: 16.05,
    category: "professional_services",
    archived: false,
  },
];

export const seedNotifications: SeedNotification[] = [
  {
    id: "invoice-sent",
    title: "Invoice marked sent",
    description: "INV-2026-032 is ready for follow-up.",
    source: "Invoices",
    accent: "bg-blue-400",
    time: "2h",
    target: { type: "invoice", id: 2 },
  },
  {
    id: "proposal-missing-document",
    title: "Proposal needs a document",
    description: "PROP-2026-002 has no document link yet.",
    source: "Proposals",
    accent: "bg-cyan-400",
    time: "1d",
    target: { type: "proposal", id: 2 },
  },
  {
    id: "expense-review",
    title: "Expense ready for review",
    description: "Client workshop travel is included in export.",
    source: "Expenses",
    accent: "bg-emerald-400",
    time: "3d",
    target: { type: "expense", id: 2 },
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
