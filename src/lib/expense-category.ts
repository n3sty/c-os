export function getExpenseCategory(description: string) {
  const normalized = description.toLowerCase();

  if (
    ["travel", "train", "flight", "hotel", "taxi", "transport"].some(
      (keyword) => normalized.includes(keyword),
    )
  ) {
    return "Travel";
  }

  if (
    ["software", "figma", "domain", "hosting", "subscription", "plan"].some(
      (keyword) => normalized.includes(keyword),
    )
  ) {
    return "Software";
  }

  if (
    ["bookkeeping", "accounting", "legal", "consult"].some((keyword) =>
      normalized.includes(keyword),
    )
  ) {
    return "Professional services";
  }

  return "Other";
}
