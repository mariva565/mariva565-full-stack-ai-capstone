import { useState, useCallback, useMemo } from "react";

type CheckboxState = "none" | "some" | "all";

export function useBulkSelection(itemIds: number[]) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const toggle = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(itemIds));
  }, [itemIds]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => (prev.size === itemIds.length ? new Set() : new Set(itemIds)));
  }, [itemIds]);

  const checkboxState: CheckboxState = useMemo(() => {
    if (selectedIds.size === 0) return "none";
    if (selectedIds.size === itemIds.length) return "all";
    return "some";
  }, [selectedIds.size, itemIds.length]);

  const isSelected = useCallback((id: number) => selectedIds.has(id), [selectedIds]);

  return { selectedIds, toggle, selectAll, deselectAll, toggleAll, checkboxState, isSelected };
}
