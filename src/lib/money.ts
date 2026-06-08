export function parseMoney(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const multiplier = /k$/i.test(trimmed) ? 1_000 : 1;
  const unsigned = trimmed
    .replace(/k$/i, "")
    .replace(/[^\d.,+-]/g, "")
    .replace(/(?!^)[+-]/g, "");
  if (!/\d/.test(unsigned)) return null;

  const negative = unsigned.startsWith("-");
  const normalizedSign = unsigned.replace(/^[+-]/, "");
  const comma = normalizedSign.lastIndexOf(",");
  const dot = normalizedSign.lastIndexOf(".");
  const decimalSeparator =
    comma >= 0 && dot >= 0
      ? comma > dot
        ? ","
        : "."
      : comma >= 0
        ? getSingleSeparator(normalizedSign, ",")
        : dot >= 0
          ? getSingleSeparator(normalizedSign, ".")
          : null;
  const normalized = decimalSeparator
    ? `${normalizedSign
        .slice(0, normalizedSign.lastIndexOf(decimalSeparator))
        .replace(/[.,]/g, "")}.${normalizedSign
        .slice(normalizedSign.lastIndexOf(decimalSeparator) + 1)
        .replace(/[.,]/g, "")}`
    : normalizedSign.replace(/[.,]/g, "");
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) return null;
  return Math.round((negative ? -parsed : parsed) * multiplier * 100) / 100;
}

function getSingleSeparator(value: string, separator: "," | ".") {
  const occurrences = value.split(separator).length - 1;
  const fractionLength = value.length - value.lastIndexOf(separator) - 1;

  if (occurrences === 1 && fractionLength > 0 && fractionLength <= 2) {
    return separator;
  }

  if (occurrences > 1 && fractionLength > 0 && fractionLength <= 2) {
    return separator;
  }

  return null;
}

export function completeMoney(value: string) {
  const parsed = parseMoney(value);
  return parsed === null ? value : parsed.toFixed(2);
}
