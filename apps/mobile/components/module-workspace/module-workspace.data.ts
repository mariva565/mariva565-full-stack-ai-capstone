import { useCallback } from "react";
import type { QueryClient } from "@tanstack/react-query";

import { getUserFriendlyError } from "../../lib/api";
import type { Material } from "../../lib/studyhub-types";
import { useToast } from "../../lib/toast-context";
import {
  useDeleteMaterialMutation,
  useDeleteModuleMutation,
} from "./module-workspace.mutations";
import {
  useModuleDetailQuery,
  useModuleMaterialsQuery,
  useRefetchOnFocus,
} from "./module-workspace.queries";
import type { ModuleResponse } from "./module-workspace.types";

type ModuleDeleteMutation = ReturnType<typeof useDeleteModuleMutation>;
type MaterialDeleteMutation = ReturnType<typeof useDeleteMaterialMutation>;

export type ModuleWorkspaceData = {
  context: ModuleResponse | null;
  materials: Material[];
  loading: boolean;
  refreshing: boolean;
  error: string;
  refresh: () => void;
  deleteModuleMutation: ModuleDeleteMutation;
  deleteMaterialMutation: MaterialDeleteMutation;
};

export function useWorkspaceData(
  routeId: string,
  queryClient: QueryClient,
  showToast: ReturnType<typeof useToast>["showToast"]
): ModuleWorkspaceData {
  const moduleQuery = useModuleDetailQuery(routeId);
  const materialsQuery = useModuleMaterialsQuery(routeId);
  const deleteModuleMutation = useDeleteModuleMutation(queryClient, showToast);
  const deleteMaterialMutation = useDeleteMaterialMutation(queryClient, showToast, routeId);
  useRefetchOnFocus(queryClient, routeId);

  const context = moduleQuery.data ?? null;
  const materials = materialsQuery.data ?? [];
  const loading = moduleQuery.isPending && !context;
  const refreshing =
    (moduleQuery.isRefetching || materialsQuery.isRefetching) &&
    !moduleQuery.isPending &&
    !materialsQuery.isPending;
  const error =
    moduleQuery.error || materialsQuery.error
      ? getUserFriendlyError(moduleQuery.error ?? materialsQuery.error, "Failed to load module")
      : "";
  const refresh = useCallback(() => {
    void Promise.all([moduleQuery.refetch(), materialsQuery.refetch()]);
  }, [moduleQuery, materialsQuery]);

  return {
    context,
    materials,
    loading,
    refreshing,
    error,
    refresh,
    deleteModuleMutation,
    deleteMaterialMutation,
  };
}
