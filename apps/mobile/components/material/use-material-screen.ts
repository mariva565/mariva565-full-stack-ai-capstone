import { useCallback } from "react";
import { Linking } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError, apiFetch, getUserFriendlyError } from "../../lib/api";
import { API_BASE } from "../../lib/api.constants";
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
import { isImageFileUrl, normalizeMaterialType } from "../../lib/material-utils";
import { captureTelemetryException } from "../../lib/telemetry";

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

function fetchMaterialFileLink(materialId: number): Promise<MaterialFileLinkResponse> {
  return apiFetch<MaterialFileLinkResponse>(`/api/materials/${materialId}/file-link`, {
    method: "POST",
    cache: false,
  });
}

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

  const extractTextMutation = useMutation({
    mutationFn: async (materialId: number) => {
      const res = await apiFetch<{ text: string }>(`/api/materials/${materialId}/extract-text`, {
        method: "POST",
        cache: false,
      });
      return res.text;
    },
    onSuccess: async (text) => {
      const current = materialQuery.data?.material;
      if (!current) return;
      const existing = current.content?.trim() ?? "";
      const newContent = existing ? `${existing}\n\n${text}` : text;
      await apiFetch(`/api/materials/${current.id}`, {
        method: "PUT",
        body: {
          title: current.title,
          content: newContent,
          materialType: current.materialType,
          fileUrl: current.fileUrl,
          tags: current.tags,
        },
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.materials.detail(routeId) });
      showToast("Text extracted and saved to material.", "success");
    },
    onError: (error) => {
      showToast(getUserFriendlyError(error, "Could not extract text from file"), "error");
    },
  });

  const favoritesQuery = useQuery({
    queryKey: queryKeys.favorites.lists(),
    queryFn: fetchFavorites,
  });

  const {
    mutateAsync: createFileLink,
    isPending: openMaterialBusy,
  } = useMutation({
    mutationFn: fetchMaterialFileLink,
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
  const moduleInfo = materialData?.module ?? null;
  const isFileMaterial = material
    ? normalizeMaterialType(material.materialType) === "file"
    : false;
  const canPreviewImageFile =
    isFileMaterial && isImageFileUrl(material?.fileUrl);

  const filePreviewQuery = useQuery({
    queryKey: [...queryKeys.materials.detail(routeId), "filePreview"],
    queryFn: async () => {
      if (!material) {
        throw new Error("Material is not loaded.");
      }
      return fetchMaterialFileLink(material.id);
    },
    enabled: canPreviewImageFile,
    retry: 1,
    staleTime: 45_000,
    gcTime: 60_000,
  });

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

      await Linking.openURL(targetUrl);
    } catch (error) {
      captureTelemetryException(error, {
        area: "material_file_open",
        details: {
          apiBase: API_BASE,
          materialId: material.id,
          materialType: material.materialType,
          errorCode: error instanceof ApiError ? error.code : null,
          errorStatus: error instanceof ApiError ? error.status : null,
        },
      });
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

  const extractText = useCallback(async () => {
    if (!material || extractTextMutation.isPending) return;
    await extractTextMutation.mutateAsync(material.id);
  }, [material, extractTextMutation]);

  return {
    material,
    moduleInfo,
    loading,
    refreshing,
    error,
    offline,
    isPinned,
    toggleFavoriteBusy: toggleFavoriteMutation.isPending,
    openMaterialBusy,
    extractingText: extractTextMutation.isPending,
    filePreviewUrl: filePreviewQuery.data?.url ?? null,
    filePreviewLoading: filePreviewQuery.isPending && canPreviewImageFile,
    openMaterialUrl,
    toggleFavorite,
    extractText,
    refresh,
  };
}
