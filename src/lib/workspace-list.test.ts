import { describe, expect, test } from "bun:test";
import {
  filterWorkspaceRecords,
  sortWorkspaceRecords,
} from "@/lib/workspace-list";

const records = [
  {
    filterKeys: ["Open"],
    filterAttributes: {
      Client: "Atlas Bio",
      Status: "sent",
      State: "Active",
    },
    sortValues: { client: "Atlas Bio", date: "2026-01-12" },
  },
  {
    filterKeys: ["Open"],
    filterAttributes: {
      Client: "Northstar Labs",
      Status: "draft",
      State: "Active",
    },
    sortValues: { client: "Northstar Labs", date: "2026-03-18" },
  },
  {
    filterKeys: ["Archived"],
    filterAttributes: {
      Client: "Atlas Bio",
      Status: "declined",
      State: "Archived",
    },
    sortValues: { client: "Atlas Bio", date: "2025-11-29" },
  },
];

describe("workspace list controls", () => {
  test("combines the active view with filters from multiple groups", () => {
    expect(
      filterWorkspaceRecords(records, "Open", {
        Client: new Set(["Atlas Bio"]),
        Status: new Set(["sent"]),
      }),
    ).toEqual([records[0]]);
  });

  test("matches any selected value within one group", () => {
    expect(
      filterWorkspaceRecords(records, "All", {
        Status: new Set(["sent", "draft"]),
      }),
    ).toEqual([records[0], records[1]]);
  });

  test("sorts without mutating the source records", () => {
    const sorted = sortWorkspaceRecords(records, {
      key: "date",
      direction: "desc",
    });

    expect(sorted).toEqual([records[1], records[0], records[2]]);
    expect(records[0].sortValues.date).toBe("2026-01-12");
  });
});
