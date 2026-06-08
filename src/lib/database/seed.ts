import { sql } from "drizzle-orm";

import { drib } from "@/lib/database/db";
import { clients, expenses, invoices, proposals } from "@/lib/database/schema";
import {
  seedClients,
  seedExpenses,
  seedInvoices,
  seedProposals,
} from "@/lib/database/seed-data";

async function main() {
  await drib.delete(invoices);
  await drib.delete(proposals);
  await drib.delete(expenses);
  await drib.delete(clients);

  await drib.insert(clients).values(
    seedClients.map((client) => ({
      id: client.id,
      fullName: client.fullName,
      email: client.email,
      company: client.company,
      client_number: client.clientNumber,
      archived: client.archived,
    })),
  );

  await drib.insert(proposals).values(
    seedProposals.map((proposal) => ({
      id: proposal.id,
      client_id: proposal.clientId,
      proposal_number: proposal.proposalNumber,
      title: proposal.title,
      date: proposal.date,
      status: proposal.status,
      document_link: proposal.documentLink,
      archived: proposal.archived,
    })),
  );

  await drib.insert(invoices).values(
    seedInvoices.map((invoice) => ({
      id: invoice.id,
      client_id: invoice.clientId,
      proposal_id: invoice.proposalId ?? undefined,
      invoice_number: invoice.invoiceNumber,
      document_link: invoice.documentLink,
      status: invoice.status,
      archived: invoice.archived,
    })),
  );

  await drib.insert(expenses).values(
    seedExpenses.map((expense) => ({
      id: expense.id,
      date: expense.date,
      supplier: expense.supplier,
      amount: expense.amount,
      vat_amount: expense.vatAmount,
      category: expense.category,
      archived: expense.archived,
    })),
  );

  await drib.execute(
    sql`select setval('clients_id_seq', ${seedClients.length}, true)`,
  );
  await drib.execute(
    sql`select setval('proposals_id_seq', ${seedProposals.length}, true)`,
  );
  await drib.execute(
    sql`select setval('invoices_id_seq', ${seedInvoices.length}, true)`,
  );
  await drib.execute(
    sql`select setval('expenses_id_seq', ${seedExpenses.length}, true)`,
  );

  console.log(
    `Seeded ${seedClients.length} clients, ${seedProposals.length} proposals, ${seedInvoices.length} invoices, and ${seedExpenses.length} expenses.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
