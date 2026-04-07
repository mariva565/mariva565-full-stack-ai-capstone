import { useCallback, useState } from "react";
import {
  Alert,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams } from "expo-router";
import { apiFetch } from "../../lib/api";
import { BrandedSpinner } from "../../components/branded-spinner";

type Material = {
  id: number;
  title: string;
  content: string | null;
  materialType: string;
  fileUrl: string | null;
  tags: string | null;
  createdAt: string;
};

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  note: { label: "Note", color: "#7c5ce7", bg: "#f0ecff" },
  link: { label: "Link", color: "#0ea5e9", bg: "#e0f2fe" },
  file: { label: "File", color: "#f59e0b", bg: "#fef3c7" },
  video: { label: "Video", color: "#ef4444", bg: "#fef2f2" },
};

export default function MaterialScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchMaterial = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setError("");
      const data = await apiFetch<{ material: Material }>(`/api/materials/${id}`);
      setMaterial(data.material);
    } catch {
      setError("Failed to load material");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchMaterial();
    }, [fetchMaterial])
  );

  async function handleOpenUrl() {
    if (!material?.fileUrl) {
      return;
    }

    try {
      const supported = await Linking.canOpenURL(material.fileUrl);
      if (!supported) {
        Alert.alert("Invalid link", "This URL cannot be opened on your device.");
        return;
      }
      await Linking.openURL(material.fileUrl);
    } catch {
      Alert.alert("Open failed", "Could not open this link.");
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
        <TouchableOpacity style={styles.retryBtn} onPress={() => fetchMaterial()}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cfg = TYPE_CONFIG[material.materialType] ?? TYPE_CONFIG.note;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchMaterial(true)}
          tintColor="#4d33c4"
        />
      }
    >
      <Stack.Screen options={{ title: material.title }} />

      {/* Header */}
      <LinearGradient
        colors={["#2e1d7a", "#4d33c4"]}
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
      {material.tags ? (
        <View style={styles.tagsCard}>
          <Text style={styles.tagsLabel}>Tags</Text>
          <View style={styles.tagsRow}>
            {material.tags.split(",").map((tag) => (
              <View key={tag.trim()} style={styles.tag}>
                <Text style={styles.tagText}>{tag.trim()}</Text>
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
    backgroundColor: "#f8f6ff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f6ff",
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
    marginBottom: 16,
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: "#4d33c4",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: "#ffffff",
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
    color: "#ffffff",
    marginBottom: 6,
  },
  heroDate: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  contentCard: {
    backgroundColor: "#ffffff",
    margin: 16,
    borderRadius: 14,
    padding: 20,
    shadowColor: "#2e1d7a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  contentText: {
    fontSize: 15,
    color: "#1e293b",
    lineHeight: 24,
  },
  noContent: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    paddingVertical: 12,
  },
  linkCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#0ea5e9",
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0ea5e9",
    marginBottom: 4,
  },
  linkUrl: {
    fontSize: 13,
    color: "#64748b",
  },
  tagsCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
  },
  tagsLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#f0ecff",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 13,
    color: "#4d33c4",
    fontWeight: "500",
  },
  bottomSpacer: {
    height: 32,
  },
});
