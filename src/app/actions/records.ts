"use server";

import { revalidatePath } from "next/cache";

import {
  archiveInvoice,
  createClient,
  createExpense,
  createInvoice,
  createProposal,
  type InvoiceStatus,
  setInvoiceStatus,
  updateClient,
  updateExpense,
  updateInvoice,
  updateProposal,
} from "@/lib/database";
import {
  type ExpenseCategory,
  isExpenseCategory,
} from "@/lib/expense-category";
import { parseMoney } from "@/lib/money";

type ActionState = {
  ok: boolean;
  message?: string;
};

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function asOptionalString(value: FormDataEntryValue | null) {
  const normalized = asString(value);
  return normalized.length > 0 ? normalized : null;
}

function asNumber(value: FormDataEntryValue | null) {
  const normalized = asString(value);
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

export async function createRecordAction(
  target: "client" | "proposal" | "invoice" | "expense",
  formData: FormData,
): Promise<ActionState> {
  switch (target) {
    case "client": {
      const result = await createClient({
        company: asString(formData.get("projectOrClientName")),
        fullName: asString(formData.get("contactName")),
        email: asString(formData.get("contactEmail")),
      });

      if (!result.ok) {
        return { ok: false, message: result.message };
      }

      revalidatePath("/clients");
      return { ok: true };
    }

    case "proposal": {
      const clientId = asNumber(formData.get("clientId"));

      if (clientId === null) {
        return { ok: false, message: "Client is required." };
      }

      const result = await createProposal({
        clientId,
        title: asString(formData.get("title")),
        date: asString(formData.get("date")),
        status:
          (asString(formData.get("status")) as
            | "draft"
            | "sent"
            | "accepted"
            | "declined") || "draft",
        proposalNumber:
          asOptionalString(formData.get("proposalNumber")) ?? undefined,
        documentLink: asOptionalString(formData.get("description")),
      });

      if (!result.ok) {
        return { ok: false, message: result.message };
      }

      revalidatePath("/proposals");
      return { ok: true };
    }

    case "invoice": {
      const clientId = asNumber(formData.get("clientId"));

      if (clientId === null) {
        return { ok: false, message: "Client is required." };
      }

      const result = await createInvoice({
        clientId,
        documentLink: asOptionalString(formData.get("documentLink")),
        invoiceNumber:
          asOptionalString(formData.get("invoiceNumber")) ?? undefined,
        status: (asString(formData.get("status")) as InvoiceStatus) || "draft",
      });

      if (!result.ok) {
        return { ok: false, message: result.message };
      }

      revalidatePath("/invoices");
      return { ok: true };
    }

    case "expense": {
      const date = asString(formData.get("date"));
      const supplier = asString(formData.get("supplier"));
      const amount = parseMoney(asString(formData.get("amount")));
      const vatAmount = parseMoney(asString(formData.get("vatAmount")));
      const category = asString(formData.get("category"));

      if (!date) {
        return { ok: false, message: "Date is required." };
      }

      if (!supplier) {
        return { ok: false, message: "Supplier is required." };
      }

      if (amount === null || amount < 0) {
        return { ok: false, message: "Amount is required." };
      }

      if (vatAmount === null || vatAmount < 0) {
        return { ok: false, message: "VAT amount is required." };
      }

      if (!isExpenseCategory(category)) {
        return { ok: false, message: "Category is required." };
      }

      const result = await createExpense({
        date,
        supplier,
        amount,
        vatAmount,
        category,
      });

      if (!result.ok) {
        return { ok: false, message: result.message };
      }

      revalidatePath("/expenses");
      return { ok: true };
    }
  }
}

export async function setInvoiceStatusAction(
  invoiceId: number,
  status: Exclude<InvoiceStatus, "void">,
) {
  const result = await setInvoiceStatus(invoiceId, status);

  if (!result.ok) {
    return { ok: false, message: result.message } satisfies ActionState;
  }

  revalidatePath("/invoices");
  return { ok: true } satisfies ActionState;
}

export async function archiveRecordAction(
  entity: "proposal" | "invoice" | "expense",
  recordId: number,
  archived: boolean,
) {
  const result =
    entity === "proposal"
      ? await updateProposal(recordId, { archived })
      : entity === "invoice"
        ? await archiveInvoice(recordId, archived)
        : await updateExpense(recordId, { archived });

  if (!result.ok) {
    return { ok: false, message: result.message } satisfies ActionState;
  }

  revalidatePath(
    entity === "proposal"
      ? "/proposals"
      : entity === "invoice"
        ? "/invoices"
        : "/expenses",
  );
  return { ok: true } satisfies ActionState;
}

export type UpdateRecordTarget =
  | {
      entity: "client";
      id: number;
      field: "fullName" | "email" | "company" | "archived";
    }
  | {
      entity: "proposal";
      id: number;
      field:
        | "title"
        | "date"
        | "status"
        | "documentLink"
        | "archived"
        | "clientId";
    }
  | {
      entity: "invoice";
      id: number;
      field: "documentLink" | "status" | "archived" | "clientId" | "proposalId";
    }
  | {
      entity: "expense";
      id: number;
      field:
        | "date"
        | "supplier"
        | "amount"
        | "vatAmount"
        | "category"
        | "archived";
    };

export async function updateRecordFieldAction(
  target: UpdateRecordTarget,
  value: string,
): Promise<ActionState> {
  switch (target.entity) {
    case "client": {
      const input =
        target.field === "archived"
          ? { archived: value === "true" }
          : target.field === "fullName"
            ? { fullName: value }
            : target.field === "email"
              ? { email: value }
              : { company: value || null };
      const result = await updateClient(target.id, input);
      if (!result.ok) return { ok: false, message: result.message };
      revalidatePath("/clients");
      return { ok: true };
    }
    case "proposal": {
      const input =
        target.field === "archived"
          ? { archived: value === "true" }
          : target.field === "status"
            ? { status: value as "draft" | "sent" | "accepted" | "declined" }
            : target.field === "date"
              ? { date: value }
              : target.field === "clientId"
                ? { clientId: Number(value) }
                : target.field === "documentLink"
                  ? { documentLink: value || null }
                  : { title: value };
      const result = await updateProposal(target.id, input);
      if (!result.ok) return { ok: false, message: result.message };
      revalidatePath("/proposals");
      return { ok: true };
    }
    case "invoice": {
      const input =
        target.field === "archived"
          ? { archived: value === "true" }
          : target.field === "status"
            ? { status: value as InvoiceStatus }
            : target.field === "clientId"
              ? { clientId: Number(value) }
              : target.field === "proposalId"
                ? {
                    proposalId:
                      value && value !== "none" ? Number(value) : null,
                  }
                : { documentLink: value || null };
      const result = await updateInvoice(target.id, input);
      if (!result.ok) return { ok: false, message: result.message };
      revalidatePath("/invoices");
      return { ok: true };
    }
    case "expense": {
      if (target.field === "amount" || target.field === "vatAmount") {
        const parsed = parseMoney(value);
        if (parsed === null || parsed < 0) {
          return { ok: false, message: "Enter a valid money amount." };
        }

        const result = await updateExpense(target.id, {
          [target.field]: parsed,
        });
        if (!result.ok) return { ok: false, message: result.message };
        revalidatePath("/expenses");
        return { ok: true };
      }

      if (target.field === "category" && !isExpenseCategory(value)) {
        return { ok: false, message: "Select a valid category." };
      }

      if (
        (target.field === "date" || target.field === "supplier") &&
        !value.trim()
      ) {
        return { ok: false, message: `${target.field} is required.` };
      }

      const input =
        target.field === "archived"
          ? { archived: value === "true" }
          : target.field === "category"
            ? { category: value as ExpenseCategory }
            : { [target.field]: value };
      const result = await updateExpense(target.id, input);
      if (!result.ok) return { ok: false, message: result.message };
      revalidatePath("/expenses");
      return { ok: true };
    }
  }
}

export async function updateRecordDescriptionAction(
  target: "client" | "proposal" | "expense",
  id: number,
  description: string,
): Promise<ActionState> {
  switch (target) {
    case "client": {
      const result = await updateClient(id, { fullName: description });
      if (!result.ok) return { ok: false, message: result.message };
      revalidatePath("/clients");
      return { ok: true };
    }
    case "proposal": {
      const result = await updateProposal(id, { description });
      if (!result.ok) return { ok: false, message: result.message };
      revalidatePath("/proposals");
      return { ok: true };
    }
    case "expense": {
      const result = await updateExpense(id, { supplier: description });
      if (!result.ok) return { ok: false, message: result.message };
      revalidatePath("/expenses");
      return { ok: true };
    }
  }
}
