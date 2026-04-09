import { useMutation, type QueryClient } from "@tanstack/react-query";

import { apiFetch, getUserFriendlyError } from "../../lib/api";
import {
  invalidateCourseQueries,
  invalidateModuleQueries,
  queryKeys,
} from "../../lib/query-keys";
import type { Material, Module } from "../../lib/studyhub-types";
import type {
  DeleteMaterialRollback,
  DeleteModulePayload,
  DeleteModuleRollback,
  DeleteTarget,
  ModuleResponse,
} from "./module-workspace.types";

type ToastType = "success" | "error" | "info";
type ShowToast = (
  message: string,
  type?: ToastType,
  options?: { haptic?: "default" | "destructive" | "none" }
) => void;

type ConfirmDeleteOptions = {
  confirmTarget: DeleteTarget | null;
  context: ModuleResponse | null;
  deleteModule: (payload: DeleteModulePayload) => Promise<unknown>;
  deleteMaterial: (material: Material) => Promise<unknown>;
  onModuleDeleted: (courseId: number) => void;
  closeModal: () => void;
};

async function prepareModuleDelete(
  queryClient: QueryClient,
  payload: DeleteModulePayload
): Promise<DeleteModuleRollback> {
  await Promise.all([
    queryClient.cancelQueries({ queryKey: queryKeys.modules.detail(payload.moduleId) }),
    queryClient.cancelQueries({ queryKey: queryKeys.modules.materials(payload.moduleId) }),
    queryClient.cancelQueries({ queryKey: queryKeys.courses.modules(payload.courseId) }),
  ]);

  const previousModuleContext = queryClient.getQueryData<ModuleResponse>(
    queryKeys.modules.detail(payload.moduleId)
  );
  const previousModuleMaterials = queryClient.getQueryData<Material[]>(
    queryKeys.modules.materials(payload.moduleId)
  );
  const previousCourseModules =
    queryClient.getQueryData<Module[]>(queryKeys.courses.modules(payload.courseId)) ?? [];

  queryClient.setQueryData<Module[]>(
    queryKeys.courses.modules(payload.courseId),
    previousCourseModules.filter((item) => item.id !== payload.moduleId)
  );

  return { previousModuleContext, previousModuleMaterials, previousCourseModules };
}

function rollbackModuleDelete(
  queryClient: QueryClient,
  payload: DeleteModulePayload,
  rollback: DeleteModuleRollback | undefined
) {
  if (!rollback) {
    return;
  }
  if (rollback.previousModuleContext) {
    queryClient.setQueryData(
      queryKeys.modules.detail(payload.moduleId),
      rollback.previousModuleContext
    );
  }
  if (rollback.previousModuleMaterials !== undefined) {
    queryClient.setQueryData(
      queryKeys.modules.materials(payload.moduleId),
      rollback.previousModuleMaterials
    );
  }
  if (rollback.previousCourseModules !== undefined) {
    queryClient.setQueryData(
      queryKeys.courses.modules(payload.courseId),
      rollback.previousCourseModules
    );
  }
}

export function useDeleteModuleMutation(queryClient: QueryClient, showToast: ShowToast) {
  return useMutation<
    DeleteModulePayload,
    unknown,
    DeleteModulePayload,
    DeleteModuleRollback
  >({
    mutationFn: async (payload) => {
      await apiFetch(`/api/modules/${payload.moduleId}`, { method: "DELETE" });
      return payload;
    },
    onMutate: async (payload) => {
      return prepareModuleDelete(queryClient, payload);
    },
    onError: (error, payload, rollback) => {
      rollbackModuleDelete(queryClient, payload, rollback);
      showToast(getUserFriendlyError(error, "Failed to delete module"), "error");
    },
    onSuccess: ({ moduleId }) => {
      queryClient.removeQueries({ queryKey: queryKeys.modules.detail(moduleId) });
      queryClient.removeQueries({ queryKey: queryKeys.modules.materials(moduleId) });
      showToast("Module deleted", "success", { haptic: "destructive" });
    },
    onSettled: async (_data, _error, payload) => {
      await invalidateCourseQueries(queryClient, payload.courseId);
    },
  });
}

export function useDeleteMaterialMutation(
  queryClient: QueryClient,
  showToast: ShowToast,
  routeId: string
) {
  return useMutation<Material, unknown, Material, DeleteMaterialRollback>({
    mutationFn: async (material) => {
      await apiFetch(`/api/materials/${material.id}`, { method: "DELETE" });
      return material;
    },
    onMutate: async (material) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.modules.materials(routeId) });
      const previousMaterials =
        queryClient.getQueryData<Material[]>(queryKeys.modules.materials(routeId)) ?? [];

      queryClient.setQueryData<Material[]>(
        queryKeys.modules.materials(routeId),
        previousMaterials.filter((item) => item.id !== material.id)
      );
      queryClient.removeQueries({ queryKey: queryKeys.materials.detail(material.id) });

      return { previousMaterials };
    },
    onError: (error, _material, rollback) => {
      if (rollback?.previousMaterials !== undefined) {
        queryClient.setQueryData(
          queryKeys.modules.materials(routeId),
          rollback.previousMaterials
        );
      }
      showToast(getUserFriendlyError(error, "Failed to delete material"), "error");
    },
    onSuccess: () => {
      showToast("Material deleted", "success", { haptic: "destructive" });
    },
    onSettled: async () => {
      await invalidateModuleQueries(queryClient, routeId);
    },
  });
}

export async function runConfirmDelete(options: ConfirmDeleteOptions) {
  if (!options.confirmTarget) {
    return;
  }
  try {
    if (options.confirmTarget.type === "module" && options.context) {
      await options.deleteModule({
        moduleId: options.context.module.id,
        courseId: options.context.course.id,
      });
      options.onModuleDeleted(options.context.course.id);
      return;
    }
    if (options.confirmTarget.type === "material") {
      await options.deleteMaterial(options.confirmTarget.material);
    }
  } catch {
    // Error toast is handled in mutation callbacks.
  } finally {
    options.closeModal();
  }
}
