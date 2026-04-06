import { useMemo } from "react";

export function useFilteredData<T extends Record<string, unknown>>(
  items: T[],
  searchQuery: string,
  searchableFields: (keyof T)[],
  viewAsFilter?: string,
  authorField?: keyof T
): T[] {
  return useMemo(() => {
    let result = items;

    // Apply "View As" user filter
    if (viewAsFilter && viewAsFilter !== "all" && authorField) {
      result = result.filter((item) => item[authorField] === viewAsFilter);
    }

    // Apply search filter
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      result = result.filter((item) =>
        searchableFields.some((field) => {
          const value = item[field];
          if (value == null) return false;
          return String(value).toLowerCase().includes(q);
        })
      );
    }

    return result;
  }, [items, searchQuery, searchableFields, viewAsFilter, authorField]);
}
