import { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams } from "expo-router";
import { apiFetch, getUserFriendlyError } from "../../lib/api";
import { COLORS, GRADIENTS } from "../../lib/colors";
import {
  addFavorite,
  appendOptimisticFavorite,
  fetchFavorites,
  isFavoriteMaterial,
  removeFavorite,
  removeOptimisticFavorite,
} from "../../lib/favorites";
import { useToast } from "../../lib/toast-context";
import { getMaterialTypeConfig, splitTags } from "../../lib/material-utils";
import { invalidateFavoritesList, queryKeys } from "../../lib/query-keys";
import type { FavoriteItem, Material } from "../../lib/studyhub-types";
import { styles } from "../../components/material/material-screen.styles";
import { MaterialScreenSkeleton } from "../../components/material/material-screen-skeleton";

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

export default function MaterialScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const routeId = String(id);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const materialQuery = useQuery({
    queryKey: queryKeys.materials.detail(routeId),
    queryFn: async () => {
      return apiFetch<MaterialDetailResponse>(`/api/materials/${routeId}`, {
        cache: false,
      });
    },
  });

  const favoritesQuery = useQuery({
    queryKey: queryKeys.favorites.lists(),
    queryFn: fetchFavorites,
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
      showToast(isPinned ? "Material pinned." : "Material unpinned.");
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

  async function handleOpenUrl() {
    if (!material?.fileUrl) {
      return;
    }

    try {
      const supported = await Linking.canOpenURL(material.fileUrl);
      if (!supported) {
        showToast("This URL cannot be opened on your device", "error");
        return;
      }
      await Linking.openURL(material.fileUrl);
    } catch {
      showToast("Could not open this link", "error");
    }
  }

  async function handleToggleFavorite() {
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
  }

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: "Loading..." }} />
        <MaterialScreenSkeleton />
      </>
    );
  }

  if (error || !material) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Error" }} />
        <Text style={styles.errorText}>{error || "Material not found"}</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => {
            void materialQuery.refetch();
          }}
          accessibilityRole="button"
          accessibilityLabel="Retry loading material"
        >
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cfg = getMaterialTypeConfig(material.materialType);
  const tags = splitTags(material.tags);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            void materialQuery.refetch();
          }}
          tintColor={COLORS.brandPrimary}
        />
      }
    >
      <Stack.Screen options={{ title: material.title }} />

      <LinearGradient
        colors={GRADIENTS.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={[styles.typeBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.typeBadgeText, { color: cfg.color }]}>
            {cfg.label}
          </Text>
        </View>
        <Text style={styles.heroTitle}>{material.title}</Text>
        <Text style={styles.heroDate}>
          {new Date(material.createdAt).toLocaleDateString()}
        </Text>
        <TouchableOpacity
          style={[styles.pinBtn, isPinned ? styles.pinBtnDanger : styles.pinBtnNeutral]}
          onPress={() => {
            void handleToggleFavorite();
          }}
          disabled={toggleFavoriteMutation.isPending}
          accessibilityRole="button"
          accessibilityLabel={
            isPinned ? "Unpin material from favorites" : "Pin material to favorites"
          }
        >
          <Text style={styles.pinBtnText}>
            {toggleFavoriteMutation.isPending
              ? "Updating..."
              : isPinned
                ? "Unpin from Favorites"
                : "Pin to Favorites"}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.contentCard}>
        {material.content ? (
          <Text style={styles.contentText}>{material.content}</Text>
        ) : (
          <Text style={styles.noContent}>No content</Text>
        )}
      </View>

      {material.fileUrl ? (
        <TouchableOpacity
          style={styles.linkCard}
          onPress={handleOpenUrl}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={
            material.materialType === "link" ? "Open material link" : "Open material file"
          }
        >
          <Text style={styles.linkLabel}>
            {material.materialType === "link" ? "Open Link" : "Open File"}
          </Text>
          <Text style={styles.linkUrl} numberOfLines={2}>
            {material.fileUrl}
          </Text>
        </TouchableOpacity>
      ) : null}

      {tags.length > 0 ? (
        <View style={styles.tagsCard}>
          <Text style={styles.tagsLabel}>Tags</Text>
          <View style={styles.tagsRow}>
            {tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}
