import { describe, expect, test } from "bun:test";
import { completeMoney, parseMoney } from "@/lib/money";

describe("money parsing", () => {
  test("accepts common decimal and thousands separators", () => {
    expect(parseMoney("1,234.56")).toBe(1234.56);
    expect(parseMoney("1.234,56")).toBe(1234.56);
    expect(parseMoney("1234,5")).toBe(1234.5);
  });

  test("accepts currency symbols and compact thousands", () => {
    expect(parseMoney("€ 24.50")).toBe(24.5);
    expect(parseMoney("1.5k")).toBe(1500);
  });

  test("completes valid values to two decimals", () => {
    expect(completeMoney("19,9")).toBe("19.90");
    expect(completeMoney("invalid")).toBe("invalid");
  });
});
