import { useCallback, useState } from "react";
import { useMutation, useQuery, type QueryClient } from "@tanstack/react-query";

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
import type { ModuleResponse } from "./module-workspace.types";

export type FavoritesActions = {
  isMaterialPinned: (materialId: number) => boolean;
  isFavoriteBusy: (materialId: number) => boolean;
  toggleMaterialFavorite: (material: Material) => void;
};

type ToggleFavoriteVariables = {
  material: Material;
  isPinned: boolean;
};

type ToggleFavoriteRollback = {
  previousFavorites: FavoriteItem[];
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

function useToggleFavoriteMutation(
  context: ModuleResponse | null,
  queryClient: QueryClient,
  showToast: ReturnType<typeof useToast>["showToast"],
  setBusyMaterialId: (materialId: number | null) => void
) {
  return useMutation<
    { isPinned: boolean },
    unknown,
    ToggleFavoriteVariables,
    ToggleFavoriteRollback
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
}

export function useFavoritesActions(
  context: ModuleResponse | null,
  queryClient: QueryClient,
  showToast: ReturnType<typeof useToast>["showToast"]
): FavoritesActions {
  const [busyMaterialId, setBusyMaterialId] = useState<number | null>(null);

  const favoritesQuery = useQuery({
    queryKey: queryKeys.favorites.lists(),
    queryFn: fetchFavorites,
  });

  const toggleFavoriteMutation = useToggleFavoriteMutation(
    context,
    queryClient,
    showToast,
    setBusyMaterialId
  );

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
