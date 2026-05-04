import { useCallback } from "react";
import { Linking } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch, getUserFriendlyError } from "../../lib/api";
import {
  addFavorite,
  appendOptimisticFavorite,
  fetchFavorites,
  isFavoriteMaterial,
  removeFavorite,
  removeOptimisticFavorite,
} from "../../lib/favorites";
import { useIsOffline } from "../../lib/network";
import { invalidateFavoritesList, queryKeys } from "../../lib/query-keys";
import type { FavoriteItem, Material } from "../../lib/studyhub-types";
import { useToast } from "../../lib/toast-context";
import { normalizeMaterialType } from "../../lib/material-utils";

type MaterialDetailResponse = {
  material: Material & {
    createdAt: string;
  };
  module: {
    id: number;
    title: string;
  };
  course: {
    id: number;
    title: string;
  };
};

type MaterialFileLinkResponse = {
  url: string;
  expiresIn: number;
};

export function useMaterialScreen(routeId: string) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const offline = useIsOffline();

  const materialQuery = useQuery({
    queryKey: queryKeys.materials.detail(routeId),
    queryFn: async () =>
      apiFetch<MaterialDetailResponse>(`/api/materials/${routeId}`, {
        cache: false,
      }),
  });

  const favoritesQuery = useQuery({
    queryKey: queryKeys.favorites.lists(),
    queryFn: fetchFavorites,
  });

  const {
    mutateAsync: createFileLink,
    isPending: openMaterialBusy,
  } = useMutation({
    mutationFn: (materialId: number) =>
      apiFetch<MaterialFileLinkResponse>(`/api/materials/${materialId}/file-link`, {
        method: "POST",
        cache: false,
      }),
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ materialId, isPinned }: { materialId: number; isPinned: boolean }) => {
      if (isPinned) {
        await removeFavorite(materialId);
        return { isPinned: false };
      }
      await addFavorite(materialId);
      return { isPinned: true };
    },
    onMutate: async ({ materialId, isPinned }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites.lists() });
      const previousFavorites =
        queryClient.getQueryData<FavoriteItem[]>(queryKeys.favorites.lists()) ?? [];

      if (isPinned) {
        queryClient.setQueryData<FavoriteItem[]>(
          queryKeys.favorites.lists(),
          removeOptimisticFavorite(previousFavorites, materialId)
        );
      } else if (materialQuery.data) {
        queryClient.setQueryData<FavoriteItem[]>(
          queryKeys.favorites.lists(),
          appendOptimisticFavorite(previousFavorites, materialQuery.data)
        );
      }

      return { previousFavorites };
    },
    onError: (error, _variables, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(queryKeys.favorites.lists(), context.previousFavorites);
      }
      showToast(getUserFriendlyError(error, "Could not update favorites"), "error");
    },
    onSuccess: ({ isPinned }) => {
      showToast(isPinned ? "Material pinned." : "Material unpinned.", "success", {
        haptic: isPinned ? "default" : "destructive",
      });
    },
    onSettled: async () => {
      await invalidateFavoritesList(queryClient);
    },
  });

  useFocusEffect(
    useCallback(() => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.materials.detail(routeId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.favorites.lists() }),
      ]);
    }, [queryClient, routeId])
  );

  const materialData = materialQuery.data ?? null;
  const material = materialData?.material ?? null;
  const isPinned = material ? isFavoriteMaterial(favoritesQuery.data, material.id) : false;
  const loading = materialQuery.isPending && !material;
  const refreshing = materialQuery.isRefetching && !materialQuery.isPending;
  const error = materialQuery.error
    ? getUserFriendlyError(materialQuery.error, "Failed to load material")
    : "";

  const openMaterialUrl = useCallback(async () => {
    if (!material?.fileUrl) {
      return;
    }

    try {
      const targetUrl =
        normalizeMaterialType(material.materialType) === "file"
          ? (await createFileLink(material.id)).url
          : material.fileUrl;

      const supported = await Linking.canOpenURL(targetUrl);
      if (!supported) {
        showToast("This URL cannot be opened on your device", "error");
        return;
      }
      await Linking.openURL(targetUrl);
    } catch (error) {
      showToast(getUserFriendlyError(error, "Could not open this material"), "error");
    }
  }, [createFileLink, material, showToast]);

  const toggleFavorite = useCallback(async () => {
    if (!material || toggleFavoriteMutation.isPending) {
      return;
    }

    try {
      await toggleFavoriteMutation.mutateAsync({
        materialId: material.id,
        isPinned,
      });
    } catch {
      // Error toast is handled in mutation callbacks.
    }
  }, [isPinned, material, toggleFavoriteMutation]);

  const refresh = useCallback(() => {
    void materialQuery.refetch();
  }, [materialQuery]);

  return {
    material,
    loading,
    refreshing,
    error,
    offline,
    isPinned,
    toggleFavoriteBusy: toggleFavoriteMutation.isPending,
    openMaterialBusy,
    openMaterialUrl,
    toggleFavorite,
    refresh,
  };
}
