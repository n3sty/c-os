import { describe, expect, test } from "bun:test";

import {
  getInvoiceFilterKeys,
  getProposalFilterKeys,
} from "@/lib/record-visibility";

describe("record visibility", () => {
  test("keeps archived proposals out of normal views", () => {
    expect(
      getProposalFilterKeys({
        archived: true,
        documentLink: null,
        status: "draft",
      }),
    ).toEqual(["Archived"]);
  });

  test("keeps archived invoices out of normal views", () => {
    expect(
      getInvoiceFilterKeys({
        archived: true,
        status: "overdue",
      }),
    ).toEqual(["Archived"]);
  });

  test("assigns active records to their normal views", () => {
    expect(
      getProposalFilterKeys({
        archived: false,
        documentLink: null,
        status: "sent",
      }),
    ).toEqual(["All", "Open", "Missing docs"]);
    expect(
      getInvoiceFilterKeys({
        archived: false,
        status: "paid",
      }),
    ).toEqual(["All", "Paid"]);
  });
});
