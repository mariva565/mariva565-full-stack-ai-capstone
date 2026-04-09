import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { getUserFriendlyError } from "../../lib/api";
import {
  addFavorite,
  appendOptimisticFavorite,
  fetchFavorites,
  isFavoriteMaterial,
  removeFavorite,
  removeOptimisticFavorite,
  type FavoriteMaterialDetail,
} from "../../lib/favorites";
import { invalidateFavoritesList, queryKeys } from "../../lib/query-keys";
import type { FavoriteItem, Material } from "../../lib/studyhub-types";
import { useToast } from "../../lib/toast-context";
import { getConfirmCopy, useModuleFilters } from "./module-workspace.helpers";
import {
  runConfirmDelete,
  useDeleteMaterialMutation,
  useDeleteModuleMutation,
} from "./module-workspace.mutations";
import {
  useModuleDetailQuery,
  useModuleMaterialsQuery,
  useRefetchOnFocus,
} from "./module-workspace.queries";
import type {
  DeleteTarget,
  ModuleResponse,
  ModuleWorkspaceViewModel,
} from "./module-workspace.types";

type ModuleDeleteMutation = ReturnType<typeof useDeleteModuleMutation>;
type MaterialDeleteMutation = ReturnType<typeof useDeleteMaterialMutation>;
type Router = ReturnType<typeof useRouter>;

type ModuleWorkspaceData = {
  context: ModuleResponse | null;
  materials: Material[];
  loading: boolean;
  refreshing: boolean;
  error: string;
  refresh: () => void;
  deleteModuleMutation: ModuleDeleteMutation;
  deleteMaterialMutation: MaterialDeleteMutation;
};

type DeleteDialogState = {
  confirmVisible: boolean;
  confirmTitle: string;
  confirmMessage: string;
  openDeleteModule: () => void;
  openDeleteMaterial: (material: Material) => void;
  confirmDelete: () => void;
  cancelDelete: () => void;
};

type NavigationActions = {
  openCourse: () => void;
  editModule: () => void;
  addMaterial: () => void;
  openMaterial: (materialId: number) => void;
  editMaterial: (materialId: number) => void;
};

type FavoritesActions = {
  isMaterialPinned: (materialId: number) => boolean;
  isFavoriteBusy: (materialId: number) => boolean;
  toggleMaterialFavorite: (material: Material) => void;
};

function toFavoriteDetail(
  material: Material,
  context: ModuleResponse | null
): FavoriteMaterialDetail | null {
  if (!context) {
    return null;
  }

  return {
    material: {
      id: material.id,
      title: material.title,
      materialType: material.materialType,
      tags: material.tags,
    },
    module: {
      id: context.module.id,
      title: context.module.title,
    },
    course: {
      id: context.course.id,
      title: context.course.title,
    },
  };
}

function useFavoritesActions(
  context: ModuleResponse | null,
  queryClient: QueryClient,
  showToast: ReturnType<typeof useToast>["showToast"]
): FavoritesActions {
  const [busyMaterialId, setBusyMaterialId] = useState<number | null>(null);

  const favoritesQuery = useQuery({
    queryKey: queryKeys.favorites.lists(),
    queryFn: fetchFavorites,
  });

  const toggleFavoriteMutation = useMutation<
    { isPinned: boolean },
    unknown,
    { material: Material; isPinned: boolean },
    { previousFavorites: FavoriteItem[] }
  >({
    mutationFn: async ({ material, isPinned }) => {
      if (isPinned) {
        await removeFavorite(material.id);
        return { isPinned: false };
      }

      await addFavorite(material.id);
      return { isPinned: true };
    },
    onMutate: async ({ material, isPinned }) => {
      setBusyMaterialId(material.id);
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites.lists() });
      const previousFavorites =
        queryClient.getQueryData<FavoriteItem[]>(queryKeys.favorites.lists()) ?? [];

      if (isPinned) {
        queryClient.setQueryData<FavoriteItem[]>(
          queryKeys.favorites.lists(),
          removeOptimisticFavorite(previousFavorites, material.id)
        );
      } else {
        const detail = toFavoriteDetail(material, context);
        if (detail) {
          queryClient.setQueryData<FavoriteItem[]>(
            queryKeys.favorites.lists(),
            appendOptimisticFavorite(previousFavorites, detail)
          );
        }
      }

      return { previousFavorites };
    },
    onError: (error, _variables, rollback) => {
      queryClient.setQueryData(
        queryKeys.favorites.lists(),
        rollback?.previousFavorites ?? []
      );
      showToast(getUserFriendlyError(error, "Could not update favorites"), "error");
    },
    onSuccess: ({ isPinned }) => {
      showToast(isPinned ? "Material pinned." : "Material unpinned.", "success", {
        haptic: isPinned ? "default" : "destructive",
      });
    },
    onSettled: async () => {
      setBusyMaterialId(null);
      await invalidateFavoritesList(queryClient);
    },
  });

  const isMaterialPinned = useCallback(
    (materialId: number) => isFavoriteMaterial(favoritesQuery.data, materialId),
    [favoritesQuery.data]
  );

  const isFavoriteBusy = useCallback(
    (materialId: number) => busyMaterialId === materialId,
    [busyMaterialId]
  );

  const toggleMaterialFavorite = useCallback(
    (material: Material) => {
      if (busyMaterialId === material.id) {
        return;
      }

      toggleFavoriteMutation.mutate({
        material,
        isPinned: isFavoriteMaterial(favoritesQuery.data, material.id),
      });
    },
    [busyMaterialId, favoritesQuery.data, toggleFavoriteMutation]
  );

  return {
    isMaterialPinned,
    isFavoriteBusy,
    toggleMaterialFavorite,
  };
}

function useWorkspaceData(
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

function useDeleteDialogState(
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

function useNavigationActions(
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

  const openMaterial = useCallback((materialId: number) => {
    router.push({ pathname: "/material/[id]", params: { id: materialId } });
  }, [router]);

  const editMaterial = useCallback((materialId: number) => {
    router.push({ pathname: "/material/[id]/edit", params: { id: materialId } });
  }, [router]);

  return { openCourse, editModule, addMaterial, openMaterial, editMaterial };
}

export function useModuleWorkspace(routeId: string): ModuleWorkspaceViewModel {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const workspaceData = useWorkspaceData(routeId, queryClient, showToast);
  const filters = useModuleFilters(workspaceData.materials);
  const deleteDialog = useDeleteDialogState(
    workspaceData.context,
    router,
    workspaceData.deleteModuleMutation,
    workspaceData.deleteMaterialMutation
  );
  const navigation = useNavigationActions(routeId, workspaceData.context, router);
  const favorites = useFavoritesActions(workspaceData.context, queryClient, showToast);

  return {
    routeId,
    context: workspaceData.context,
    materials: workspaceData.materials,
    filteredMaterials: filters.filteredMaterials,
    searchQuery: filters.searchQuery,
    typeFilter: filters.typeFilter,
    hasFilters: filters.hasFilters,
    confirmVisible: deleteDialog.confirmVisible,
    confirmTitle: deleteDialog.confirmTitle,
    confirmMessage: deleteDialog.confirmMessage,
    loading: workspaceData.loading,
    refreshing: workspaceData.refreshing,
    error: workspaceData.error,
    setSearchQuery: filters.setSearchQuery,
    setTypeFilter: filters.setTypeFilter,
    retry: workspaceData.refresh,
    refresh: workspaceData.refresh,
    openCourse: navigation.openCourse,
    editModule: navigation.editModule,
    openDeleteModule: deleteDialog.openDeleteModule,
    addMaterial: navigation.addMaterial,
    openMaterial: navigation.openMaterial,
    editMaterial: navigation.editMaterial,
    isMaterialPinned: favorites.isMaterialPinned,
    isFavoriteBusy: favorites.isFavoriteBusy,
    toggleMaterialFavorite: favorites.toggleMaterialFavorite,
    openDeleteMaterial: deleteDialog.openDeleteMaterial,
    confirmDelete: deleteDialog.confirmDelete,
    cancelDelete: deleteDialog.cancelDelete,
  };
}
