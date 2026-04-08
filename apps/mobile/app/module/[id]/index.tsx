import { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { BrandedSpinner } from "../../../components/branded-spinner";
import { ConfirmModal } from "../../../components/confirm-modal";
import { EmptyState } from "../../../components/empty-state";
import { MaterialCard } from "../../../components/material-card";
import { SearchBar } from "../../../components/search-bar";
import { TypeFilterChips } from "../../../components/type-filter-chips";
import { ApiError, apiFetch } from "../../../lib/api";
import { COLORS, GRADIENTS } from "../../../lib/colors";
import type { MaterialType } from "../../../lib/material-utils";
import { useToast } from "../../../lib/toast-context";
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
  const routeId = String(id);
  const router = useRouter();
  const { showToast } = useToast();
  const [context, setContext] = useState<ModuleResponse | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Search and filter
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<MaterialType | null>(null);

  // Confirm modal state
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{ type: "module" } | { type: "material"; material: Material } | null>(null);

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

  function openDeleteModule() {
    setConfirmTarget({ type: "module" });
    setConfirmVisible(true);
  }

  function openDeleteMaterial(material: Material) {
    setConfirmTarget({ type: "material", material });
    setConfirmVisible(true);
  }

  async function handleConfirmDelete() {
    if (!confirmTarget) return;
    if (confirmTarget.type === "module" && context) {
      try {
        await apiFetch(`/api/modules/${context.module.id}`, { method: "DELETE" });
        showToast("Module deleted");
        setConfirmVisible(false);
        router.replace({ pathname: "/course/[id]", params: { id: context.course.id } });
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Failed to delete module";
        showToast(message, "error");
        setConfirmVisible(false);
      }
    } else if (confirmTarget.type === "material") {
      const { material } = confirmTarget;
      try {
        await apiFetch(`/api/materials/${material.id}`, { method: "DELETE" });
        setMaterials((current) => current.filter((item) => item.id !== material.id));
        showToast("Material deleted");
        setConfirmVisible(false);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Failed to delete material";
        showToast(message, "error");
        setConfirmVisible(false);
      }
    }
  }

  const filteredMaterials = useMemo(() => {
    let result = materials;
    if (typeFilter) {
      result = result.filter((m) => m.materialType === typeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.content?.toLowerCase().includes(q) ||
          m.tags?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [materials, searchQuery, typeFilter]);

  const hasFilters = searchQuery.trim().length > 0 || typeFilter !== null;

  const confirmTitle =
    confirmTarget?.type === "module"
      ? "Delete module"
      : "Delete material";
  const confirmMessage =
    confirmTarget?.type === "module"
      ? `Delete "${context?.module.title}" and all its materials?`
      : confirmTarget?.type === "material"
        ? `Delete "${confirmTarget.material.title}"?`
        : "";

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
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => fetchModule()}
          accessibilityRole="button"
          accessibilityLabel="Retry loading module"
        >
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchModule(true)} tintColor={COLORS.brandPrimary} />
        }
      >
        <Stack.Screen options={{ title: context.module.title }} />

        <LinearGradient colors={GRADIENTS.heroStrong} style={styles.hero}>
          <TouchableOpacity
            style={styles.coursePill}
            onPress={() => router.push({ pathname: "/course/[id]", params: { id: context.course.id } })}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Open course ${context.course.title}`}
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
              onPress={() => router.push({ pathname: "/module/[id]/edit", params: { id: routeId } })}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Edit module ${context.module.title}`}
            >
              <Text style={styles.heroGhostBtnText}>Edit Module</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.heroBtn, styles.heroDangerBtn]}
              onPress={openDeleteModule}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Delete module ${context.module.title}`}
            >
              <Text style={styles.heroDangerBtnText}>Delete Module</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Materials</Text>
            <Text style={styles.sectionSubtitle}>Open any item for detail view and editing.</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push({ pathname: "/module/[id]/add-material", params: { id: routeId } })}
            accessibilityRole="button"
            accessibilityLabel="Add material"
          >
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {materials.length > 0 ? (
          <>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search materials..."
            />
            <TypeFilterChips selected={typeFilter} onSelect={setTypeFilter} />
          </>
        ) : null}

        {materials.length === 0 ? (
          <EmptyState icon="Notes" title="No materials yet" subtitle="Add a note, link, file, or video to start this module." />
        ) : filteredMaterials.length === 0 ? (
          <EmptyState
            icon="Search"
            title="No matches"
            subtitle={hasFilters ? "Try a different search or filter." : "No materials found."}
          />
        ) : (
          <View style={styles.materialsList}>
            {filteredMaterials.map((material) => (
              <MaterialCard
                key={material.id}
                material={material}
                onOpen={() => router.push({ pathname: "/material/[id]", params: { id: material.id } })}
                onEdit={() => router.push({ pathname: "/material/[id]/edit", params: { id: material.id } })}
                onDelete={() => openDeleteMaterial(material)}
              />
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <ConfirmModal
        visible={confirmVisible}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel="Delete"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.canvas },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.canvas,
    paddingHorizontal: 32,
  },
  errorText: { fontSize: 16, color: COLORS.danger, marginBottom: 16, textAlign: "center" },
  retryBtn: { backgroundColor: COLORS.brandPrimary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryBtnText: { color: COLORS.textOnBrand, fontWeight: "600" },
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
  coursePillText: { fontSize: 12, fontWeight: "700", color: COLORS.textOnBrand },
  heroTitle: { fontSize: 24, fontWeight: "800", color: COLORS.textOnBrand, marginBottom: 10 },
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
  heroGhostBtnText: { fontSize: 13, fontWeight: "700", color: COLORS.textOnBrand },
  heroDangerBtnText: { fontSize: 13, fontWeight: "700", color: COLORS.textOnDangerSoft },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: COLORS.brandDeep },
  sectionSubtitle: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, marginTop: 4, maxWidth: 240 },
  addBtn: {
    backgroundColor: COLORS.lavenderSoft,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addBtnText: { fontSize: 13, fontWeight: "700", color: COLORS.brandPrimary },
  materialsList: { paddingHorizontal: 16 },
  bottomSpacer: { height: 32 },
});
