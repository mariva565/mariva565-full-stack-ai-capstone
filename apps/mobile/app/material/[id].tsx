import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams } from "expo-router";
import { apiFetch, getUserFriendlyError } from "../../lib/api";
import { BrandedSpinner } from "../../components/branded-spinner";
import { COLORS, GRADIENTS } from "../../lib/colors";
import { useToast } from "../../lib/toast-context";
import { getMaterialTypeConfig, splitTags } from "../../lib/material-utils";
import { queryKeys } from "../../lib/query-keys";

type Material = {
  id: number;
  title: string;
  content: string | null;
  materialType: string;
  fileUrl: string | null;
  tags: string | null;
  createdAt: string;
};

export default function MaterialScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const routeId = String(id);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const materialQuery = useQuery({
    queryKey: queryKeys.materials.detail(routeId),
    queryFn: async () => {
      const data = await apiFetch<{ material: Material }>(`/api/materials/${routeId}`);
      return data.material;
    },
  });

  useFocusEffect(
    useCallback(() => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.materials.detail(routeId) });
    }, [queryClient, routeId])
  );

  const material = materialQuery.data ?? null;
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

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: "Loading..." }} />
        <BrandedSpinner message="Loading material..." />
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

      {/* Header */}
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
      </LinearGradient>

      {/* Content */}
      <View style={styles.contentCard}>
        {material.content ? (
          <Text style={styles.contentText}>{material.content}</Text>
        ) : (
          <Text style={styles.noContent}>No content</Text>
        )}
      </View>

      {/* Link / File URL */}
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

      {/* Tags */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.canvas,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.canvas,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.danger,
    marginBottom: 16,
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: COLORS.brandPrimary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: COLORS.textOnBrand,
    fontWeight: "600",
  },
  hero: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textOnBrand,
    marginBottom: 6,
  },
  heroDate: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  contentCard: {
    backgroundColor: COLORS.surface,
    margin: 16,
    borderRadius: 14,
    padding: 20,
    shadowColor: COLORS.brandDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  contentText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  noContent: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    paddingVertical: 12,
  },
  linkCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.link,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.link,
    marginBottom: 4,
  },
  linkUrl: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  tagsCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
  },
  tagsLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textTertiary,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: COLORS.violetSoft,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 13,
    color: COLORS.brandPrimary,
    fontWeight: "500",
  },
  bottomSpacer: {
    height: 32,
  },
});
