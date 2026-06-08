import { describe, expect, test } from "bun:test";
import {
  expenseCategoryOptions,
  getExpenseCategoryLabel,
  isExpenseCategory,
} from "@/lib/expense-category";

describe("expense categories", () => {
  test("formats stored category values", () => {
    expect(getExpenseCategoryLabel("software")).toBe("Software");
    expect(getExpenseCategoryLabel("professional_services")).toBe(
      "Professional services",
    );
  });

  test("offers every supported category", () => {
    expect(expenseCategoryOptions.map((option) => option.value)).toEqual([
      "software",
      "travel",
      "office",
      "professional_services",
      "marketing",
      "meals",
      "other",
    ]);
    expect(isExpenseCategory("meals")).toBe(true);
    expect(isExpenseCategory("unknown")).toBe(false);
  });
});
