import { useCallback, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { BrandedSpinner } from "../../../components/branded-spinner";
import { EmptyState } from "../../../components/empty-state";
import { MaterialCard } from "../../../components/material-card";
import { ApiError, apiFetch } from "../../../lib/api";
import type { Material, ModuleContext } from "../../../lib/studyhub-types";

type ModuleResponse = {
  module: ModuleContext;
  course: {
    id: number;
    title: string;
    description: string | null;
  };
};

export default function ModuleWorkspaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [context, setContext] = useState<ModuleResponse | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchModule = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setError("");
      const [moduleData, materialsData] = await Promise.all([
        apiFetch<ModuleResponse>(`/api/modules/${id}`),
        apiFetch<{ materials: Material[] }>(`/api/modules/${id}/materials`),
      ]);
      setContext(moduleData);
      setMaterials(materialsData.materials);
    } catch {
      setError("Failed to load module");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchModule();
    }, [fetchModule])
  );

  const handleDeleteModule = useCallback(() => {
    if (!context) {
      return;
    }

    Alert.alert(
      "Delete module",
      `Delete "${context.module.title}" and all its materials?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiFetch(`/api/modules/${context.module.id}`, { method: "DELETE" });
              router.replace(`/course/${context.course.id}` as any);
            } catch (err) {
              const message = err instanceof ApiError ? err.message : "Failed to delete module";
              Alert.alert("Delete failed", message);
            }
          },
        },
      ]
    );
  }, [context, router]);

  const handleDeleteMaterial = useCallback((material: Material) => {
    Alert.alert(
      "Delete material",
      `Delete "${material.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiFetch(`/api/materials/${material.id}`, { method: "DELETE" });
              setMaterials((current) => current.filter((item) => item.id !== material.id));
            } catch (err) {
              const message = err instanceof ApiError ? err.message : "Failed to delete material";
              Alert.alert("Delete failed", message);
            }
          },
        },
      ]
    );
  }, []);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: "Loading..." }} />
        <BrandedSpinner message="Loading module..." />
      </>
    );
  }

  if (error || !context) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Error" }} />
        <Text style={styles.errorText}>{error || "Module not found"}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => fetchModule()}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => fetchModule(true)} tintColor="#4d33c4" />
      }
    >
      <Stack.Screen options={{ title: context.module.title }} />

      <LinearGradient colors={["#2e1d7a", "#4d33c4", "#7c5ce7"]} style={styles.hero}>
        <TouchableOpacity
          style={styles.coursePill}
          onPress={() => router.push(`/course/${context.course.id}` as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.coursePillText}>{context.course.title}</Text>
        </TouchableOpacity>
        <Text style={styles.heroTitle}>{context.module.title}</Text>
        <Text style={styles.heroDesc}>
          {context.module.description?.trim() || "Module workspace for managing your study materials."}
        </Text>
        <Text style={styles.heroMeta}>{materials.length} materials in this workspace</Text>
        <View style={styles.heroActions}>
          <TouchableOpacity
            style={[styles.heroBtn, styles.heroGhostBtn]}
            onPress={() => router.push(`/module/${id}/edit` as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.heroGhostBtnText}>Edit Module</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.heroBtn, styles.heroDangerBtn]} onPress={handleDeleteModule} activeOpacity={0.8}>
            <Text style={styles.heroDangerBtnText}>Delete Module</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Materials</Text>
          <Text style={styles.sectionSubtitle}>Open any item for detail view and editing.</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push(`/module/${id}/add-material` as any)}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {materials.length === 0 ? (
        <EmptyState icon="Notes" title="No materials yet" subtitle="Add a note, link, file, or video to start this module." />
      ) : (
        <View style={styles.materialsList}>
          {materials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onOpen={() => router.push(`/material/${material.id}` as any)}
              onEdit={() => router.push(`/material/${material.id}/edit` as any)}
              onDelete={() => handleDeleteMaterial(material)}
            />
          ))}
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f6ff" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f6ff",
    paddingHorizontal: 32,
  },
  errorText: { fontSize: 16, color: "#dc2626", marginBottom: 16, textAlign: "center" },
  retryBtn: { backgroundColor: "#4d33c4", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryBtnText: { color: "#ffffff", fontWeight: "600" },
  hero: { paddingTop: 24, paddingBottom: 28, paddingHorizontal: 20 },
  coursePill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 14,
  },
  coursePillText: { fontSize: 12, fontWeight: "700", color: "#ffffff" },
  heroTitle: { fontSize: 24, fontWeight: "800", color: "#ffffff", marginBottom: 10 },
  heroDesc: { fontSize: 15, color: "rgba(255,255,255,0.84)", lineHeight: 22, marginBottom: 10 },
  heroMeta: { fontSize: 12, color: "rgba(255,255,255,0.6)" },
  heroActions: { flexDirection: "row", gap: 10, marginTop: 18 },
  heroBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  heroGhostBtn: { backgroundColor: "rgba(255,255,255,0.14)", borderColor: "rgba(255,255,255,0.35)" },
  heroDangerBtn: { backgroundColor: "rgba(190,24,93,0.18)", borderColor: "rgba(253,164,175,0.4)" },
  heroGhostBtnText: { fontSize: 13, fontWeight: "700", color: "#ffffff" },
  heroDangerBtnText: { fontSize: 13, fontWeight: "700", color: "#ffe4e6" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#2e1d7a" },
  sectionSubtitle: { fontSize: 13, color: "#64748b", lineHeight: 19, marginTop: 4, maxWidth: 240 },
  addBtn: {
    backgroundColor: "#ede9fe",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addBtnText: { fontSize: 13, fontWeight: "700", color: "#4d33c4" },
  materialsList: { paddingHorizontal: 16 },
  bottomSpacer: { height: 32 },
});
