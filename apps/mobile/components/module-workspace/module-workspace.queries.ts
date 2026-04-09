import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery, type QueryClient } from "@tanstack/react-query";

import { apiFetch } from "../../lib/api";
import { queryKeys } from "../../lib/query-keys";
import type { Material } from "../../lib/studyhub-types";
import type { ModuleResponse } from "./module-workspace.types";

export function useModuleDetailQuery(routeId: string) {
  return useQuery({
    queryKey: queryKeys.modules.detail(routeId),
    queryFn: async () => {
      return apiFetch<ModuleResponse>(`/api/modules/${routeId}`, { cache: false });
    },
  });
}

export function useModuleMaterialsQuery(routeId: string) {
  return useQuery({
    queryKey: queryKeys.modules.materials(routeId),
    queryFn: async () => {
      const data = await apiFetch<{ materials: Material[] }>(
        `/api/modules/${routeId}/materials`,
        { cache: false }
      );
      return data.materials;
    },
  });
}

export function useRefetchOnFocus(queryClient: QueryClient, routeId: string) {
  useFocusEffect(
    useCallback(() => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.modules.detail(routeId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.modules.materials(routeId) }),
      ]);
    }, [queryClient, routeId])
  );
}
