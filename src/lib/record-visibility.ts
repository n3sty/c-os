type ProposalVisibility = {
  archived: boolean;
  documentLink: string | null;
  status: "draft" | "sent" | "accepted" | "declined";
};

type InvoiceVisibility = {
  archived: boolean;
  status: "draft" | "sent" | "paid" | "overdue" | "void";
};

export function getProposalFilterKeys(proposal: ProposalVisibility) {
  if (proposal.archived) {
    return ["Archived"];
  }

  const keys = ["All"];

  if (!["accepted", "declined"].includes(proposal.status)) {
    keys.push("Open");
  }

  if (!proposal.documentLink) {
    keys.push("Missing docs");
  }

  return keys;
}

export function getInvoiceFilterKeys(invoice: InvoiceVisibility) {
  if (invoice.archived) {
    return ["Archived"];
  }

  const keys = ["All"];

  if (!["paid", "void"].includes(invoice.status)) {
    keys.push("Open");
  }

  if (invoice.status === "paid") {
    keys.push("Paid");
  }

  if (invoice.status === "overdue") {
    keys.push("Overdue");
  }

  return keys;
}
