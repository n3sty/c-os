import { sql } from "drizzle-orm";
import {
  boolean,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  varchar,
} from "drizzle-orm/pg-core";

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
  "overdue",
  "void",
]);

export const proposalStatusEnum = pgEnum("proposal_status", [
  "draft",
  "sent",
  "accepted",
  "declined",
]);

export const expenseCategoryEnum = pgEnum("expense_category", [
  "software",
  "travel",
  "office",
  "professional_services",
  "marketing",
  "meals",
  "other",
]);

export const clients = pgTable("clients", {
  id: serial().primaryKey(),
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
  title: text().notNull(),
  description: text(),
  date: varchar().notNull(),
  status: proposalStatusEnum().notNull().default("draft"),
  archived: boolean().default(false),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  client_id: serial().references(() => clients.id),
  proposal_id: serial().references(() => proposals.id),
  document_link: text(),
  invoice_number: varchar().unique(),
  status: invoiceStatusEnum().notNull().default("draft"),
  archived: boolean().default(false),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  date: varchar().notNull().default(sql`CURRENT_DATE::text`),
  supplier: text().notNull(),
  amount: numeric({ mode: "number", precision: 12, scale: 2 }).notNull(),
  vat_amount: numeric({ mode: "number", precision: 12, scale: 2 })
    .notNull()
    .default(0),
  category: expenseCategoryEnum().notNull().default("other"),
  archived: boolean().notNull().default(false),
});
