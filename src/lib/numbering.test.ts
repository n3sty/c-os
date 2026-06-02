import { describe, expect, test } from "bun:test";

import {
  formatTrackedNumber,
  getNextTrackedNumber,
  parseTrackedNumber,
} from "@/lib/numbering";

describe("number tracking", () => {
  test("formats invoice, proposal, and client numbers", () => {
    expect(formatTrackedNumber("invoice", 1, { year: 2026 })).toBe(
      "COS-2026001-F",
    );
    expect(formatTrackedNumber("proposal", 24, { year: 2026 })).toBe(
      "COS-2026024-O",
    );
    expect(formatTrackedNumber("client", 7)).toBe("COS-0007-C");
  });

  test("parses tracked numbers", () => {
    expect(parseTrackedNumber("COS-2026014-F")).toEqual({
      kind: "invoice",
      sequence: 14,
      year: 2026,
    });
    expect(parseTrackedNumber("COS-2026015-O")).toEqual({
      kind: "proposal",
      sequence: 15,
      year: 2026,
    });
    expect(parseTrackedNumber("COS-0016-C")).toEqual({
      kind: "client",
      sequence: 16,
      year: null,
    });
  });

  test("generates the next yearly invoice number without reusing gaps", () => {
    expect(
      getNextTrackedNumber(
        "invoice",
        ["COS-2026001-F", "COS-2026003-F", "COS-2025009-F"],
        { year: 2026 },
      ),
    ).toBe("COS-2026004-F");
  });

  test("generates the next yearly proposal number independently from invoices", () => {
    expect(
      getNextTrackedNumber("proposal", ["COS-2026008-F", "COS-2026002-O"], {
        year: 2026,
      }),
    ).toBe("COS-2026003-O");
  });

  test("generates the next client number without a year", () => {
    expect(getNextTrackedNumber("client", ["COS-0001-C", "COS-0004-C"])).toBe(
      "COS-0005-C",
    );
  });

  test("ignores malformed or unrelated numbers when calculating the next number", () => {
    expect(
      getNextTrackedNumber(
        "invoice",
        ["INV-2026-031", "COS-2026002-O", "COS-2026001-F"],
        { year: 2026 },
      ),
    ).toBe("COS-2026002-F");
  });
});
