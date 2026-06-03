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
      const amount = asNumber(formData.get("amount"));

      if (amount === null) {
        return { ok: false, message: "Amount is required." };
      }

      const result = await createExpense({
        amount,
        description: asOptionalString(formData.get("expenseTitle")),
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

export async function archiveInvoiceAction(
  invoiceId: number,
  archived: boolean,
) {
  const result = await archiveInvoice(invoiceId, archived);

  if (!result.ok) {
    return { ok: false, message: result.message } satisfies ActionState;
  }

  revalidatePath("/invoices");
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
  | { entity: "expense"; id: number; field: "description" | "amount" };

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
      const input =
        target.field === "amount"
          ? { amount: Number(value) }
          : { description: value };
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
      const result = await updateExpense(id, { description });
      if (!result.ok) return { ok: false, message: result.message };
      revalidatePath("/expenses");
      return { ok: true };
    }
  }
}
