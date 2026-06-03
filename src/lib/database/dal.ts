import "server-only";

import { asc, eq } from "drizzle-orm";

import { requireAuthActor } from "@/lib/auth";
import { drib } from "@/lib/database/db";
import { clients, expenses, invoices, proposals } from "@/lib/database/schema";
import {
  type InvoiceStatus,
  type SeedClient,
  type SeedExpense,
  type SeedInvoice,
  type SeedProposal,
  seedClients,
  seedExpenses,
  seedInvoices,
  seedProposals,
} from "@/lib/database/seed-data";
import { getNextTrackedNumber } from "@/lib/numbering";

export type WorkspaceSnapshot = {
  clients: SeedClient[];
  proposals: SeedProposal[];
  invoices: SeedInvoice[];
  expenses: SeedExpense[];
  source: "database" | "seed-fallback";
};

export type MutationResult<T> =
  | {
      ok: true;
      data: T;
      source: "database";
    }
  | {
      ok: false;
      data: null;
      source: "fallback";
      message: string;
    };

export type CreateClientInput = {
  fullName: string;
  email: string;
  company?: string | null;
  clientNumber?: string;
  archived?: boolean;
};

export type UpdateClientInput = Partial<CreateClientInput>;

export type CreateProposalInput = {
  clientId: number;
  title: string;
  description?: string | null;
  date: string;
  status?: SeedProposal["status"];
  documentLink?: string | null;
  proposalNumber?: string;
  archived?: boolean;
};

export type UpdateProposalInput = Partial<CreateProposalInput>;

export type CreateInvoiceInput = {
  clientId: number;
  proposalId?: number | null;
  documentLink?: string | null;
  invoiceNumber?: string;
  status?: InvoiceStatus;
  archived?: boolean;
};

export type UpdateInvoiceInput = Partial<CreateInvoiceInput>;

export type CreateExpenseInput = {
  amount: number;
  description?: string | null;
};

export type UpdateExpenseInput = Partial<CreateExpenseInput>;

function mapClient(row: typeof clients.$inferSelect): SeedClient {
  return {
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    company: row.company,
    clientNumber: row.client_number ?? `client-${row.id}`,
    archived: row.archived ?? false,
  };
}

function mapProposal(row: typeof proposals.$inferSelect): SeedProposal {
  return {
    id: row.id,
    clientId: row.client_id ?? 0,
    proposalNumber: row.proposal_number ?? `proposal-${row.id}`,
    title: row.title,
    description: row.description ?? null,
    date: row.date,
    status: row.status,
    documentLink: row.document_link,
    archived: row.archived ?? false,
  };
}

function mapInvoice(row: typeof invoices.$inferSelect): SeedInvoice {
  return {
    id: row.id,
    clientId: row.client_id ?? 0,
    proposalId: row.proposal_id ?? null,
    invoiceNumber: row.invoice_number ?? `invoice-${row.id}`,
    documentLink: row.document_link,
    status: row.status,
    archived: row.archived ?? false,
  };
}

function mapExpense(row: typeof expenses.$inferSelect): SeedExpense {
  return {
    id: row.id,
    amount: row.amount,
    description: row.description ?? "",
  };
}

async function withFallback<T>(
  operation: () => Promise<T>,
  fallback: () => T | Promise<T>,
): Promise<{ data: T; source: WorkspaceSnapshot["source"] }> {
  try {
    return {
      data: await operation(),
      source: "database",
    };
  } catch {
    return {
      data: await fallback(),
      source: "seed-fallback",
    };
  }
}

function mutationFallback<T>(message: string): MutationResult<T> {
  return {
    ok: false,
    data: null,
    source: "fallback",
    message,
  };
}

export async function loadWorkspaceSnapshot(): Promise<WorkspaceSnapshot> {
  const result = await withFallback(
    async () => {
      const [clientRows, proposalRows, invoiceRows, expenseRows] =
        await Promise.all([
          drib.select().from(clients).orderBy(asc(clients.id)),
          drib.select().from(proposals).orderBy(asc(proposals.id)),
          drib.select().from(invoices).orderBy(asc(invoices.id)),
          drib.select().from(expenses).orderBy(asc(expenses.id)),
        ]);

      return {
        clients: clientRows.map(mapClient),
        proposals: proposalRows.map(mapProposal),
        invoices: invoiceRows.map(mapInvoice),
        expenses: expenseRows.map(mapExpense),
      };
    },
    () => ({
      clients: seedClients,
      proposals: seedProposals,
      invoices: seedInvoices,
      expenses: seedExpenses,
    }),
  );

  return {
    ...result.data,
    source: result.source,
  };
}

export async function listClients() {
  return (await loadWorkspaceSnapshot()).clients;
}

export async function listProposals() {
  return (await loadWorkspaceSnapshot()).proposals;
}

export async function listInvoices() {
  return (await loadWorkspaceSnapshot()).invoices;
}

export async function listExpenses() {
  return (await loadWorkspaceSnapshot()).expenses;
}

export async function createClient(
  input: CreateClientInput,
): Promise<MutationResult<SeedClient>> {
  await requireAuthActor();

  try {
    const existingClients = await drib.select().from(clients);
    const [row] = await drib
      .insert(clients)
      .values({
        fullName: input.fullName,
        email: input.email,
        company: input.company ?? null,
        client_number:
          input.clientNumber ??
          getNextTrackedNumber(
            "client",
            existingClients.map((client) => client.client_number),
          ),
        archived: input.archived ?? false,
      })
      .returning();

    return {
      ok: true,
      data: mapClient(row),
      source: "database",
    };
  } catch {
    return mutationFallback(
      "Client creation fell back because the database is unavailable.",
    );
  }
}

export async function updateClient(
  id: number,
  input: UpdateClientInput,
): Promise<MutationResult<SeedClient>> {
  await requireAuthActor();

  try {
    const [row] = await drib
      .update(clients)
      .set({
        fullName: input.fullName,
        email: input.email,
        company: input.company,
        client_number: input.clientNumber,
        archived: input.archived,
      })
      .where(eq(clients.id, id))
      .returning();

    return row
      ? { ok: true, data: mapClient(row), source: "database" }
      : mutationFallback("Client update did not find a matching record.");
  } catch {
    return mutationFallback(
      "Client update fell back because the database is unavailable.",
    );
  }
}

export async function deleteClient(
  id: number,
): Promise<MutationResult<{ id: number }>> {
  await requireAuthActor();

  try {
    await drib.transaction(async (tx) => {
      await tx.delete(invoices).where(eq(invoices.client_id, id));
      await tx.delete(proposals).where(eq(proposals.client_id, id));
      await tx.delete(clients).where(eq(clients.id, id));
    });

    return {
      ok: true,
      data: { id },
      source: "database",
    };
  } catch {
    return mutationFallback(
      "Client delete fell back because the database is unavailable.",
    );
  }
}

export async function createProposal(
  input: CreateProposalInput,
): Promise<MutationResult<SeedProposal>> {
  await requireAuthActor();

  try {
    const existingProposals = await drib.select().from(proposals);
    const [row] = await drib
      .insert(proposals)
      .values({
        client_id: input.clientId,
        title: input.title,
        description: input.description ?? null,
        date: input.date,
        status: input.status ?? "draft",
        document_link: input.documentLink ?? null,
        proposal_number:
          input.proposalNumber ??
          getNextTrackedNumber(
            "proposal",
            existingProposals.map((proposal) => proposal.proposal_number),
          ),
        archived: input.archived ?? false,
      })
      .returning();

    return {
      ok: true,
      data: mapProposal(row),
      source: "database",
    };
  } catch {
    return mutationFallback(
      "Proposal creation fell back because the database is unavailable.",
    );
  }
}

export async function updateProposal(
  id: number,
  input: UpdateProposalInput,
): Promise<MutationResult<SeedProposal>> {
  await requireAuthActor();

  try {
    const [row] = await drib
      .update(proposals)
      .set({
        client_id: input.clientId,
        title: input.title,
        description: input.description,
        date: input.date,
        status: input.status,
        document_link: input.documentLink,
        proposal_number: input.proposalNumber,
        archived: input.archived,
      })
      .where(eq(proposals.id, id))
      .returning();

    return row
      ? { ok: true, data: mapProposal(row), source: "database" }
      : mutationFallback("Proposal update did not find a matching record.");
  } catch {
    return mutationFallback(
      "Proposal update fell back because the database is unavailable.",
    );
  }
}

export async function deleteProposal(
  id: number,
): Promise<MutationResult<{ id: number }>> {
  await requireAuthActor();

  try {
    await drib.transaction(async (tx) => {
      await tx.delete(invoices).where(eq(invoices.proposal_id, id));
      await tx.delete(proposals).where(eq(proposals.id, id));
    });

    return {
      ok: true,
      data: { id },
      source: "database",
    };
  } catch {
    return mutationFallback(
      "Proposal delete fell back because the database is unavailable.",
    );
  }
}

export async function createInvoice(
  input: CreateInvoiceInput,
): Promise<MutationResult<SeedInvoice>> {
  await requireAuthActor();

  try {
    const existingInvoices = await drib.select().from(invoices);
    const [row] = await drib
      .insert(invoices)
      .values({
        client_id: input.clientId,
        proposal_id: input.proposalId ?? undefined,
        document_link: input.documentLink ?? null,
        invoice_number:
          input.invoiceNumber ??
          getNextTrackedNumber(
            "invoice",
            existingInvoices.map((invoice) => invoice.invoice_number),
          ),
        status: input.status ?? "draft",
        archived: input.archived ?? false,
      })
      .returning();

    return {
      ok: true,
      data: mapInvoice(row),
      source: "database",
    };
  } catch {
    return mutationFallback(
      "Invoice creation fell back because the database is unavailable.",
    );
  }
}

export async function updateInvoice(
  id: number,
  input: UpdateInvoiceInput,
): Promise<MutationResult<SeedInvoice>> {
  await requireAuthActor();

  try {
    const [row] = await drib
      .update(invoices)
      .set({
        client_id: input.clientId,
        proposal_id: input.proposalId ?? undefined,
        document_link: input.documentLink,
        invoice_number: input.invoiceNumber,
        status: input.status,
        archived: input.archived,
      })
      .where(eq(invoices.id, id))
      .returning();

    return row
      ? { ok: true, data: mapInvoice(row), source: "database" }
      : mutationFallback("Invoice update did not find a matching record.");
  } catch {
    return mutationFallback(
      "Invoice update fell back because the database is unavailable.",
    );
  }
}

export async function deleteInvoice(
  id: number,
): Promise<MutationResult<{ id: number }>> {
  await requireAuthActor();

  try {
    await drib.delete(invoices).where(eq(invoices.id, id)).returning();

    return {
      ok: true,
      data: { id },
      source: "database",
    };
  } catch {
    return mutationFallback(
      "Invoice delete fell back because the database is unavailable.",
    );
  }
}

export async function createExpense(
  input: CreateExpenseInput,
): Promise<MutationResult<SeedExpense>> {
  await requireAuthActor();

  try {
    const [row] = await drib
      .insert(expenses)
      .values({
        amount: input.amount,
        description: input.description ?? null,
      })
      .returning();

    return {
      ok: true,
      data: mapExpense(row),
      source: "database",
    };
  } catch {
    return mutationFallback(
      "Expense creation fell back because the database is unavailable.",
    );
  }
}

export async function updateExpense(
  id: number,
  input: UpdateExpenseInput,
): Promise<MutationResult<SeedExpense>> {
  await requireAuthActor();

  try {
    const [row] = await drib
      .update(expenses)
      .set({
        amount: input.amount,
        description: input.description,
      })
      .where(eq(expenses.id, id))
      .returning();

    return row
      ? { ok: true, data: mapExpense(row), source: "database" }
      : mutationFallback("Expense update did not find a matching record.");
  } catch {
    return mutationFallback(
      "Expense update fell back because the database is unavailable.",
    );
  }
}

export async function deleteExpense(
  id: number,
): Promise<MutationResult<{ id: number }>> {
  await requireAuthActor();

  try {
    await drib.delete(expenses).where(eq(expenses.id, id)).returning();

    return {
      ok: true,
      data: { id },
      source: "database",
    };
  } catch {
    return mutationFallback(
      "Expense delete fell back because the database is unavailable.",
    );
  }
}

export async function listInvoicesByClientId(clientId: number) {
  try {
    const rows = await drib
      .select()
      .from(invoices)
      .where(eq(invoices.client_id, clientId))
      .orderBy(asc(invoices.id));

    return rows.map(mapInvoice);
  } catch {
    return seedInvoices.filter((invoice) => invoice.clientId === clientId);
  }
}

export async function listProposalsByClientId(clientId: number) {
  try {
    const rows = await drib
      .select()
      .from(proposals)
      .where(eq(proposals.client_id, clientId))
      .orderBy(asc(proposals.id));

    return rows.map(mapProposal);
  } catch {
    return seedProposals.filter((proposal) => proposal.clientId === clientId);
  }
}

export async function listInvoicesByProposalId(proposalId: number) {
  try {
    const rows = await drib
      .select()
      .from(invoices)
      .where(eq(invoices.proposal_id, proposalId))
      .orderBy(asc(invoices.id));

    return rows.map(mapInvoice);
  } catch {
    return seedInvoices.filter((invoice) => invoice.proposalId === proposalId);
  }
}

export async function archiveInvoice(id: number, archived: boolean) {
  return updateInvoice(id, { archived });
}

export async function setInvoiceStatus(
  id: number,
  status: Exclude<InvoiceStatus, "void">,
) {
  return updateInvoice(id, { status });
}
