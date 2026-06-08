export type WorkspaceListRecord = {
  filterKeys?: string[];
  filterAttributes?: Record<string, string>;
  sortValues?: Record<string, string | number>;
};

export type WorkspaceSort = {
  key: string;
  direction: "asc" | "desc";
};

export function filterWorkspaceRecords<T extends WorkspaceListRecord>(
  records: T[],
  activeView: string,
  activeFilters: Record<string, Set<string>>,
) {
  return records.filter((record) => {
    const passesView =
      !activeView ||
      activeView === "All" ||
      record.filterKeys?.includes(activeView);

    const passesFilters = Object.entries(activeFilters).every(
      ([attribute, selectedValues]) =>
        selectedValues.size === 0 ||
        (record.filterAttributes?.[attribute] !== undefined &&
          selectedValues.has(record.filterAttributes[attribute])),
    );

    return passesView && passesFilters;
  });
}

export function sortWorkspaceRecords<T extends WorkspaceListRecord>(
  records: T[],
  sort: WorkspaceSort | null,
) {
  if (!sort) {
    return records;
  }

  return [...records].sort((left, right) => {
    const leftValue = left.sortValues?.[sort.key];
    const rightValue = right.sortValues?.[sort.key];

    if (leftValue === undefined && rightValue === undefined) return 0;
    if (leftValue === undefined) return 1;
    if (rightValue === undefined) return -1;

    const comparison =
      typeof leftValue === "number" && typeof rightValue === "number"
        ? leftValue - rightValue
        : String(leftValue).localeCompare(String(rightValue), undefined, {
            numeric: true,
            sensitivity: "base",
          });

    return sort.direction === "asc" ? comparison : -comparison;
  });
}
