import { useCallback, useMemo, useState } from "react";
import { useRouter } from "expo-router";

import type { Material } from "../../lib/studyhub-types";
import { getConfirmCopy } from "./module-workspace.helpers";
import { runConfirmDelete, useDeleteMaterialMutation, useDeleteModuleMutation } from "./module-workspace.mutations";
import type { DeleteTarget, ModuleResponse } from "./module-workspace.types";

type ModuleDeleteMutation = ReturnType<typeof useDeleteModuleMutation>;
type MaterialDeleteMutation = ReturnType<typeof useDeleteMaterialMutation>;
type Router = ReturnType<typeof useRouter>;

export type DeleteDialogState = {
  confirmVisible: boolean;
  confirmTitle: string;
  confirmMessage: string;
  openDeleteModule: () => void;
  openDeleteMaterial: (material: Material) => void;
  confirmDelete: () => void;
  cancelDelete: () => void;
};

export type NavigationActions = {
  openCourse: () => void;
  editModule: () => void;
  addMaterial: () => void;
  openMaterial: (materialId: number) => void;
  editMaterial: (materialId: number) => void;
};

export function useDeleteDialogState(
  context: ModuleResponse | null,
  router: Router,
  deleteModuleMutation: ModuleDeleteMutation,
  deleteMaterialMutation: MaterialDeleteMutation
): DeleteDialogState {
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<DeleteTarget | null>(null);

  const confirmCopy = useMemo(
    () => getConfirmCopy(confirmTarget, context?.module.title),
    [confirmTarget, context?.module.title]
  );

  const openDeleteModule = useCallback(() => {
    setConfirmTarget({ type: "module" });
    setConfirmVisible(true);
  }, []);

  const openDeleteMaterial = useCallback((material: Material) => {
    setConfirmTarget({ type: "material", material });
    setConfirmVisible(true);
  }, []);

  const cancelDelete = useCallback(() => {
    setConfirmVisible(false);
  }, []);

  const confirmDelete = useCallback(() => {
    void runConfirmDelete({
      confirmTarget,
      context,
      deleteModule: deleteModuleMutation.mutateAsync,
      deleteMaterial: deleteMaterialMutation.mutateAsync,
      onModuleDeleted: (courseId) =>
        router.replace({ pathname: "/course/[id]", params: { id: courseId } }),
      closeModal: () => setConfirmVisible(false),
    });
  }, [confirmTarget, context, deleteMaterialMutation, deleteModuleMutation, router]);

  return {
    confirmVisible,
    confirmTitle: confirmCopy.title,
    confirmMessage: confirmCopy.message,
    openDeleteModule,
    openDeleteMaterial,
    confirmDelete,
    cancelDelete,
  };
}

export function useNavigationActions(
  routeId: string,
  context: ModuleResponse | null,
  router: Router
): NavigationActions {
  const openCourse = useCallback(() => {
    if (!context) {
      return;
    }
    router.push({ pathname: "/course/[id]", params: { id: context.course.id } });
  }, [context, router]);

  const editModule = useCallback(() => {
    router.push({ pathname: "/module/[id]/edit", params: { id: routeId } });
  }, [routeId, router]);

  const addMaterial = useCallback(() => {
    router.push({ pathname: "/module/[id]/add-material", params: { id: routeId } });
  }, [routeId, router]);

  const openMaterial = useCallback(
    (materialId: number) => {
      router.push({ pathname: "/material/[id]", params: { id: materialId } });
    },
    [router]
  );

  const editMaterial = useCallback(
    (materialId: number) => {
      router.push({ pathname: "/material/[id]/edit", params: { id: materialId } });
    },
    [router]
  );

  return { openCourse, editModule, addMaterial, openMaterial, editMaterial };
}
