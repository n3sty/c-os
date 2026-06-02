import {
  boolean,
  numeric,
  pgTable,
  serial,
  text,
  varchar,
} from "drizzle-orm/pg-core";

export const clients = pgTable("clients", {
  id: serial().primaryKey().generatedAlwaysAs(1),
  fullName: text().notNull(),
  email: text().notNull(),
  company: text(),
  client_number: varchar().unique(),
  archived: boolean().default(false),
});

export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  client_id: serial().references(() => clients.id),
  document_link: text(),
  proposal_number: varchar().unique(),
  archived: boolean().default(false),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  client_id: serial().references(() => clients.id),
  proposal_id: serial().references(() => proposals.id),
  document_link: text(),
  invoice_number: varchar().unique(),
  archived: boolean().default(false),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  amount: numeric({ mode: "number" }).notNull(),
  description: text(),
});
