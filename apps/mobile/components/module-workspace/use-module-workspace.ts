import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { useToast } from "../../lib/toast-context";
import { useModuleFilters } from "./module-workspace.helpers";
import {
  useDeleteDialogState,
  useNavigationActions,
} from "./module-workspace.actions";
import { useWorkspaceData } from "./module-workspace.data";
import { useFavoritesActions } from "./module-workspace.favorites";
import type { ModuleWorkspaceViewModel } from "./module-workspace.types";

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
