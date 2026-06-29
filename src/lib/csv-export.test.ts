import { describe, expect, test } from "bun:test";

import { buildCsv, escapeCsvCell } from "@/lib/csv-export";

describe("CSV export", () => {
  test("escapes CSV syntax characters", () => {
    expect(escapeCsvCell('Coscience, "OS"')).toBe('"Coscience, ""OS"""');
    expect(escapeCsvCell("line\nbreak")).toBe('"line\nbreak"');
  });

  test("neutralizes spreadsheet formula prefixes", () => {
    expect(escapeCsvCell('=HYPERLINK("https://example.com")')).toBe(
      '"\'=HYPERLINK(""https://example.com"")"',
    );
    expect(escapeCsvCell(" +SUM(1,1)")).toBe('"\' +SUM(1,1)"');
    expect(escapeCsvCell("-10")).toBe("'-10");
    expect(escapeCsvCell("@user")).toBe("'@user");
  });

  test("builds a header and rows", () => {
    const csv = buildCsv(
      [
        {
          key: "name",
          label: "Name",
          value: (row: { name: string }) => row.name,
        },
        { key: "active", label: "Active", value: () => true },
      ],
      [{ name: "Atlas Bio" }],
    );

    expect(csv).toBe("Name,Active\r\nAtlas Bio,true");
  });
});
