export type CsvValue = string | number | boolean | null | undefined;

export type CsvColumn<TRow> = {
  key: string;
  label: string;
  value: (row: TRow) => CsvValue;
};

const FORMULA_PREFIX_PATTERN = /^\s*[=+\-@]/;

export function neutralizeCsvFormula(value: string) {
  if (!FORMULA_PREFIX_PATTERN.test(value)) {
    return value;
  }

  return `'${value}`;
}

export function escapeCsvCell(value: CsvValue) {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = neutralizeCsvFormula(String(value));
  const escapedValue = stringValue.replaceAll('"', '""');

  if (/[",\r\n]/.test(escapedValue)) {
    return `"${escapedValue}"`;
  }

  return escapedValue;
}

export function buildCsv<TRow>(columns: CsvColumn<TRow>[], rows: TRow[]) {
  const header = columns.map((column) => escapeCsvCell(column.label)).join(",");
  const body = rows.map((row) =>
    columns.map((column) => escapeCsvCell(column.value(row))).join(","),
  );

  return [header, ...body].join("\r\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
