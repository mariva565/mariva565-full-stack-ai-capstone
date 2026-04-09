import { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text as RNText,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { EmptyState } from "../../components/empty-state";
import { FavoritesSkeleton } from "../../components/favorites/favorites-skeleton";
import { NetworkBanner } from "../../components/network-banner";
import { RequestState } from "../../components/request-state";
import { getUserFriendlyError } from "../../lib/api";
import { COLORS, GRADIENTS } from "../../lib/colors";
import { fetchFavorites, removeFavorite, removeOptimisticFavorite } from "../../lib/favorites";
import { splitTags } from "../../lib/material-utils";
import { useIsOffline } from "../../lib/network";
import { queryKeys } from "../../lib/query-keys";
import type { FavoriteItem } from "../../lib/studyhub-types";
import { useToast } from "../../lib/toast-context";
import { styles } from "../../components/favorites/favorites.styles";

type FavoriteCardProps = {
  item: FavoriteItem;
  busy: boolean;
  onOpenMaterial: () => void;
  onOpenModule: () => void;
  onOpenCourse: () => void;
  onUnpin: () => void;
};

function FavoriteCard({
  item,
  busy,
  onOpenMaterial,
  onOpenModule,
  onOpenCourse,
  onUnpin,
}: FavoriteCardProps) {
  const tags = splitTags(item.tags);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardMain}
        onPress={onOpenMaterial}
        activeOpacity={0.78}
        accessibilityRole="button"
        accessibilityLabel={`Open favorite material ${item.materialTitle}`}
        accessibilityHint="Opens the material details screen"
      >
        <RNText style={styles.cardTitle} numberOfLines={2} maxFontSizeMultiplier={1.3}>
          {item.materialTitle}
        </RNText>
        <RNText style={styles.cardMeta} numberOfLines={1} maxFontSizeMultiplier={1.2}>
          {item.courseTitle} {"\u00B7"} {item.moduleTitle}
        </RNText>
      </TouchableOpacity>

      {tags.length > 0 ? (
        <View style={styles.tagsRow}>
          {tags.slice(0, 4).map((tag) => (
            <View key={tag} style={styles.tag}>
              <RNText style={styles.tagText} maxFontSizeMultiplier={1.2}>
                {tag}
              </RNText>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.linkBtn}
          onPress={onOpenCourse}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Open course ${item.courseTitle}`}
          accessibilityHint="Navigates to the related course"
        >
          <RNText style={styles.linkBtnText} maxFontSizeMultiplier={1.2}>
            Course
          </RNText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkBtn}
          onPress={onOpenModule}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Open module ${item.moduleTitle}`}
          accessibilityHint="Navigates to the related module workspace"
        >
          <RNText style={styles.linkBtnText} maxFontSizeMultiplier={1.2}>
            Module
          </RNText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.unpinBtn, busy && styles.unpinBtnDisabled]}
          onPress={onUnpin}
          activeOpacity={0.8}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${item.materialTitle} from favorites`}
          accessibilityHint="Unpins this material from quick access"
        >
          <RNText style={styles.unpinBtnText} maxFontSizeMultiplier={1.2}>
            {busy ? "Removing..." : "Unpin"}
          </RNText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function FavoritesTabScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const offline = useIsOffline();
  const [busyMaterialId, setBusyMaterialId] = useState<number | null>(null);

  const favoritesQuery = useQuery({
    queryKey: queryKeys.favorites.lists(),
    queryFn: fetchFavorites,
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (materialId: number) => {
      await removeFavorite(materialId);
      return materialId;
    },
    onMutate: async (materialId) => {
      setBusyMaterialId(materialId);
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites.lists() });
      const previousFavorites =
        queryClient.getQueryData<FavoriteItem[]>(queryKeys.favorites.lists()) ?? [];

      queryClient.setQueryData<FavoriteItem[]>(
        queryKeys.favorites.lists(),
        removeOptimisticFavorite(previousFavorites, materialId)
      );

      return { previousFavorites };
    },
    onError: (error, _materialId, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(queryKeys.favorites.lists(), context.previousFavorites);
      }
      showToast(getUserFriendlyError(error, "Could not update favorites"), "error");
    },
    onSuccess: () => {
      showToast("Removed from favorites", "success", { haptic: "destructive" });
    },
    onSettled: async () => {
      setBusyMaterialId(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.favorites.lists() });
    },
  });

  const favorites = favoritesQuery.data ?? [];
  const loading = favoritesQuery.isPending && favorites.length === 0;
  const refreshing = favoritesQuery.isRefetching && !favoritesQuery.isPending;
  const error = favoritesQuery.error
    ? getUserFriendlyError(favoritesQuery.error, "Failed to load favorites")
    : "";

  useFocusEffect(
    useCallback(() => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.favorites.lists() });
    }, [queryClient])
  );

  if (loading) {
    return <FavoritesSkeleton />;
  }

  if (error) {
    return offline ? (
      <RequestState
        icon="Offline"
        title="You are offline"
        subtitle="Reconnect to load your latest favorites."
        actionLabel="Retry"
        onAction={() => {
          void favoritesQuery.refetch();
        }}
        accessibilityLabel="Retry loading favorites while offline"
      />
    ) : (
      <RequestState
        icon="Error"
        title="Could not load favorites"
        subtitle={error}
        actionLabel="Retry"
        onAction={() => {
          void favoritesQuery.refetch();
        }}
        accessibilityLabel="Retry loading favorites"
      />
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={GRADIENTS.hero} style={styles.hero}>
        <RNText style={styles.heroLabel} maxFontSizeMultiplier={1.2}>
          Quick Access
        </RNText>
        <RNText style={styles.heroTitle} maxFontSizeMultiplier={1.3}>
          Favorites
        </RNText>
        <RNText style={styles.heroMeta} maxFontSizeMultiplier={1.2}>
          {favorites.length} {favorites.length === 1 ? "material pinned" : "materials pinned"}
        </RNText>
      </LinearGradient>

      {offline ? (
        <View style={styles.offlineBannerWrap}>
          <NetworkBanner message="Showing last synced favorites until connection is restored." />
        </View>
      ) : null}

      {favorites.length === 0 ? (
        offline ? (
          <RequestState
            icon="Offline"
            title="No offline favorites yet"
            subtitle="Reconnect and pin materials to keep quick access items here."
            actionLabel="Retry"
            onAction={() => {
              void favoritesQuery.refetch();
            }}
            accessibilityLabel="Retry syncing favorites"
          />
        ) : (
          <EmptyState
            icon="Heart"
            title="No favorites yet"
            subtitle="Pin materials from the material screen for quick access."
          />
        )
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                void favoritesQuery.refetch();
              }}
              tintColor={COLORS.brandPrimary}
            />
          }
          renderItem={({ item }) => (
            <FavoriteCard
              item={item}
              busy={busyMaterialId === item.materialId}
              onOpenMaterial={() =>
                router.push({ pathname: "/material/[id]", params: { id: item.materialId } })
              }
              onOpenModule={() =>
                router.push({ pathname: "/module/[id]", params: { id: item.moduleId } })
              }
              onOpenCourse={() =>
                router.push({ pathname: "/course/[id]", params: { id: item.courseId } })
              }
              onUnpin={() => {
                removeFavoriteMutation.mutate(item.materialId);
              }}
            />
          )}
        />
      )}
    </View>
  );
}
