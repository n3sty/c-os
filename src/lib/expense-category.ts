import type { expenseCategoryEnum } from "@/lib/database/schema";

export type ExpenseCategory = (typeof expenseCategoryEnum.enumValues)[number];

export const expenseCategoryOptions = [
  { label: "Software", value: "software" },
  { label: "Travel", value: "travel" },
  { label: "Office", value: "office" },
  { label: "Professional services", value: "professional_services" },
  { label: "Marketing", value: "marketing" },
  { label: "Meals", value: "meals" },
  { label: "Other", value: "other" },
] as const satisfies ReadonlyArray<{
  label: string;
  value: ExpenseCategory;
}>;

export function getExpenseCategoryLabel(category: ExpenseCategory) {
  return (
    expenseCategoryOptions.find((option) => option.value === category)?.label ??
    category
  );
}

export function isExpenseCategory(value: string): value is ExpenseCategory {
  return expenseCategoryOptions.some((option) => option.value === value);
}
