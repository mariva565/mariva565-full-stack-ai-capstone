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

import { useTheme, useThemedStyles } from "../../lib/app-preferences";
import { EmptyState } from "../../components/empty-state";
import { FavoritesSkeleton } from "../../components/favorites/favorites-skeleton";
import { NetworkBanner } from "../../components/network-banner";
import { RequestState } from "../../components/request-state";
import { getUserFriendlyError } from "../../lib/api";
import { fetchFavorites, removeFavorite, removeOptimisticFavorite } from "../../lib/favorites";
import { fetchSharedMaterials, fetchSharedByMe } from "../../lib/share";
import { splitTags } from "../../lib/material-utils";
import { useIsOffline } from "../../lib/network";
import { invalidateFavoritesList, queryKeys } from "../../lib/query-keys";
import type { FavoriteItem } from "../../lib/studyhub-types";
import { useToast } from "../../lib/toast-context";
import { SharedMaterialCard } from "../../components/favorites/shared-material-card";
import { SharedByMeCard } from "../../components/favorites/shared-by-me-card";
import {
  makeFavoritesStyles,
  type FavoritesStyles,
} from "../../components/favorites/favorites.styles";

type FavoriteCardProps = {
  item: FavoriteItem;
  busy: boolean;
  onOpenMaterial: () => void;
  onOpenModule: () => void;
  onOpenCourse: () => void;
  onUnpin: () => void;
  styles: FavoritesStyles;
};

function FavoriteCard({
  item,
  busy,
  onOpenMaterial,
  onOpenModule,
  onOpenCourse,
  onUnpin,
  styles,
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
  const { colors } = useTheme();
  const styles = useThemedStyles(makeFavoritesStyles);
  const heroGradient = [colors.brandDeep, colors.brandPrimary] as const;
  const [busyMaterialId, setBusyMaterialId] = useState<number | null>(null);
  
  const [activeTab, setActiveTab] = useState<"pinned" | "shared" | "sharedByMe">("pinned");

  const favoritesQuery = useQuery({
    queryKey: queryKeys.favorites.lists(),
    queryFn: fetchFavorites,
    staleTime: 30_000,
  });

  const sharedQuery = useQuery({
    queryKey: queryKeys.sharedMaterials.lists(),
    queryFn: fetchSharedMaterials,
    staleTime: 60_000,
  });

  const sharedByMeQuery = useQuery({
    queryKey: queryKeys.sharedMaterials.sharedByMe(),
    queryFn: fetchSharedByMe,
    staleTime: 60_000,
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
      await invalidateFavoritesList(queryClient);
    },
  });

  const isPinnedTab = activeTab === "pinned";
  const isSharedWithMeTab = activeTab === "shared";
  const isSharedByMeTab = activeTab === "sharedByMe";

  const favorites = favoritesQuery.data ?? [];
  const sharedMaterials = sharedQuery.data ?? [];
  const sharedByMeItems = sharedByMeQuery.data ?? [];

  const activeQuery = isPinnedTab ? favoritesQuery : isSharedWithMeTab ? sharedQuery : sharedByMeQuery;
  const dataList = isPinnedTab ? favorites : isSharedWithMeTab ? sharedMaterials : sharedByMeItems;

  const loading = activeQuery.isPending && dataList.length === 0;
  const refreshing = activeQuery.isRefetching && !activeQuery.isPending;
  const error = activeQuery.error
    ? getUserFriendlyError(
        activeQuery.error,
        isPinnedTab ? "Failed to load favorites" : isSharedWithMeTab ? "Failed to load shared materials" : "Failed to load shared by me"
      )
    : "";

  useFocusEffect(
    useCallback(() => {
      // Only invalidate favorites — they change when user pins/unpins on other screens.
      // Shared queries have staleTime and refetch via pull-to-refresh.
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
        subtitle="Reconnect to load your latest shelf items."
        actionLabel="Retry"
        onAction={() => void activeQuery.refetch()}
        accessibilityLabel="Retry loading items while offline"
      />
    ) : (
      <RequestState
        icon="Error"
        title="Could not load items"
        subtitle={error}
        actionLabel="Retry"
        onAction={() => void activeQuery.refetch()}
        accessibilityLabel="Retry loading items"
      />
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={heroGradient} style={styles.hero}>
        <RNText style={styles.heroTitle} maxFontSizeMultiplier={1.3}>
          My Shelf
        </RNText>
        
        <View style={styles.tabsWrap}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "pinned" && styles.tabBtnActive]}
            onPress={() => setActiveTab("pinned")}
            activeOpacity={0.8}
            accessibilityRole="tab"
          >
            <RNText style={[styles.tabBtnText, activeTab === "pinned" && styles.tabBtnTextActive]}>
              Pinned
            </RNText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "shared" && styles.tabBtnActive]}
            onPress={() => setActiveTab("shared")}
            activeOpacity={0.8}
            accessibilityRole="tab"
          >
            <RNText style={[styles.tabBtnText, activeTab === "shared" && styles.tabBtnTextActive]}>
              Shared with me
            </RNText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "sharedByMe" && styles.tabBtnActive]}
            onPress={() => setActiveTab("sharedByMe")}
            activeOpacity={0.8}
            accessibilityRole="tab"
          >
            <RNText style={[styles.tabBtnText, activeTab === "sharedByMe" && styles.tabBtnTextActive]}>
              Shared by me
            </RNText>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {offline ? (
        <View style={styles.offlineBannerWrap}>
          <NetworkBanner message="Showing last synced items until connection is restored." />
        </View>
      ) : null}

      {dataList.length === 0 ? (
        offline ? (
          <RequestState
            icon="Offline"
            title="No offline items yet"
            subtitle="Reconnect to keep quick access items here."
            actionLabel="Retry"
            onAction={() => void activeQuery.refetch()}
            accessibilityLabel="Retry syncing items"
          />
        ) : (
          <EmptyState
            icon={isPinnedTab ? "Heart" : "ChatGroup"}
            title={
              isPinnedTab ? "No favorites yet" :
              isSharedWithMeTab ? "Nothing shared with you" :
              "You haven't shared anything yet"
            }
            subtitle={
              isPinnedTab ? "Pin materials from the material screen for quick access." :
              isSharedWithMeTab ? "Curate materials shared from your peers here." :
              "Share a material from the material screen to see it here."
            }
          />
        )
      ) : (
        <FlatList
          data={dataList as any}
          keyExtractor={(item: any) =>
            isPinnedTab ? String(item.id) :
            isSharedWithMeTab ? String(item.sharedAt) + String(item.id) :
            String(item.sharedAt) + String(item.materialId) + (item.sharedWith?.email ?? "")
          }
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void activeQuery.refetch()}
              tintColor={colors.brandPrimary}
            />
          }
          renderItem={({ item }) =>
            isPinnedTab ? (
              <FavoriteCard
                item={item as FavoriteItem}
                busy={busyMaterialId === (item as FavoriteItem).materialId}
                onOpenMaterial={() =>
                  router.push({ pathname: "/material/[id]", params: { id: (item as FavoriteItem).materialId } })
                }
                onOpenModule={() =>
                  router.push({ pathname: "/module/[id]", params: { id: (item as FavoriteItem).moduleId } })
                }
                onOpenCourse={() =>
                  router.push({ pathname: "/course/[id]", params: { id: (item as FavoriteItem).courseId } })
                }
                onUnpin={() => {
                  removeFavoriteMutation.mutate((item as FavoriteItem).materialId);
                }}
                styles={styles}
              />
            ) : isSharedWithMeTab ? (
              <SharedMaterialCard
                item={item as any}
                onOpenMaterial={() =>
                  router.push({ pathname: "/material/[id]", params: { id: (item as any).id } })
                }
                styles={styles}
              />
            ) : (
              <SharedByMeCard
                item={item as any}
                onOpenMaterial={() =>
                  router.push({ pathname: "/material/[id]", params: { id: (item as any).materialId } })
                }
                styles={styles}
              />
            )
          }
        />
      )}
    </View>
  );
}
