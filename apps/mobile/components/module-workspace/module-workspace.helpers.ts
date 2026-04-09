import { useMemo, useState } from "react";

import type { MaterialType } from "../../lib/material-utils";
import type { Material } from "../../lib/studyhub-types";
import type { DeleteTarget } from "./module-workspace.types";

type ConfirmCopy = {
  title: string;
  message: string;
};

function filterMaterials(
  materials: Material[],
  searchQuery: string,
  typeFilter: MaterialType | null
) {
  const normalizedSearch = searchQuery.trim().toLowerCase();
  return materials.filter((material) => {
    if (typeFilter && material.materialType !== typeFilter) {
      return false;
    }
    if (!normalizedSearch) {
      return true;
    }
    return (
      material.title.toLowerCase().includes(normalizedSearch) ||
      material.content?.toLowerCase().includes(normalizedSearch) ||
      material.tags?.toLowerCase().includes(normalizedSearch) ||
      false
    );
  });
}

export function getConfirmCopy(
  confirmTarget: DeleteTarget | null,
  moduleTitle: string | undefined
): ConfirmCopy {
  if (!confirmTarget) {
    return { title: "Delete material", message: "" };
  }
  if (confirmTarget.type === "module") {
    return {
      title: "Delete module",
      message: `Delete "${moduleTitle}" and all its materials?`,
    };
  }
  return {
    title: "Delete material",
    message: `Delete "${confirmTarget.material.title}"?`,
  };
}

export function useModuleFilters(materials: Material[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<MaterialType | null>(null);

  const filteredMaterials = useMemo(
    () => filterMaterials(materials, searchQuery, typeFilter),
    [materials, searchQuery, typeFilter]
  );

  const hasFilters = searchQuery.trim().length > 0 || typeFilter !== null;
  return { searchQuery, setSearchQuery, typeFilter, setTypeFilter, filteredMaterials, hasFilters };
}
