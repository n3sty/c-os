CREATE TYPE "public"."expense_category" AS ENUM('software', 'travel', 'office', 'professional_services', 'marketing', 'meals', 'other');--> statement-breakpoint
ALTER TABLE "expenses" RENAME COLUMN "description" TO "supplier";--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "amount" SET DATA TYPE numeric(12, 2) USING "amount"::numeric(12, 2);--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "date" varchar DEFAULT CURRENT_DATE::text NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "vat_amount" numeric(12, 2) DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "category" "expense_category" DEFAULT 'other' NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "archived" boolean DEFAULT false NOT NULL;
