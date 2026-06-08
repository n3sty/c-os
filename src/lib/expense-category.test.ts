import { describe, expect, test } from "bun:test";
import { getExpenseCategory } from "@/lib/expense-category";

describe("expense categories", () => {
  test("classifies the current expense descriptions", () => {
    expect(getExpenseCategory("Figma professional plan")).toBe("Software");
    expect(getExpenseCategory("Client workshop travel")).toBe("Travel");
    expect(getExpenseCategory("Bookkeeping handoff review")).toBe(
      "Professional services",
    );
  });

  test("uses Other when no category keyword matches", () => {
    expect(getExpenseCategory("Office coffee")).toBe("Other");
  });
});
