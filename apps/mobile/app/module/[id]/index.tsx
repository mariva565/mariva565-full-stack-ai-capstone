import { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { BrandedSpinner } from "../../../components/branded-spinner";
import { ConfirmModal } from "../../../components/confirm-modal";
import { EmptyState } from "../../../components/empty-state";
import { MaterialCard } from "../../../components/material-card";
import { SearchBar } from "../../../components/search-bar";
import { TypeFilterChips } from "../../../components/type-filter-chips";
import { apiFetch, getUserFriendlyError } from "../../../lib/api";
import { COLORS, GRADIENTS } from "../../../lib/colors";
import type { MaterialType } from "../../../lib/material-utils";
import { invalidateCourseQueries, invalidateModuleQueries, queryKeys } from "../../../lib/query-keys";
import { useToast } from "../../../lib/toast-context";
import type { Material, Module, ModuleContext } from "../../../lib/studyhub-types";

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
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Search and filter
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<MaterialType | null>(null);

  // Confirm modal state
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{ type: "module" } | { type: "material"; material: Material } | null>(null);

  const moduleQuery = useQuery({
    queryKey: queryKeys.modules.detail(routeId),
    queryFn: async () => {
      return apiFetch<ModuleResponse>(`/api/modules/${routeId}`, {
        cache: false,
      });
    },
  });

  const materialsQuery = useQuery({
    queryKey: queryKeys.modules.materials(routeId),
    queryFn: async () => {
      const data = await apiFetch<{ materials: Material[] }>(`/api/modules/${routeId}/materials`, {
        cache: false,
      });
      return data.materials;
    },
  });

  const deleteModuleMutation = useMutation({
    mutationFn: async (payload: { moduleId: number; courseId: number }) => {
      await apiFetch(`/api/modules/${payload.moduleId}`, { method: "DELETE" });
      return payload;
    },
    onMutate: async ({ moduleId, courseId }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: queryKeys.modules.detail(moduleId) }),
        queryClient.cancelQueries({ queryKey: queryKeys.modules.materials(moduleId) }),
        queryClient.cancelQueries({ queryKey: queryKeys.courses.modules(courseId) }),
      ]);

      const previousModuleContext = queryClient.getQueryData<ModuleResponse>(
        queryKeys.modules.detail(moduleId)
      );
      const previousModuleMaterials = queryClient.getQueryData<Material[]>(
        queryKeys.modules.materials(moduleId)
      );
      const previousCourseModules =
        queryClient.getQueryData<Module[]>(queryKeys.courses.modules(courseId)) ?? [];

      queryClient.setQueryData<Module[]>(
        queryKeys.courses.modules(courseId),
        previousCourseModules.filter((item) => item.id !== moduleId)
      );

      return { previousModuleContext, previousModuleMaterials, previousCourseModules };
    },
    onError: (error, { courseId }, context) => {
      if (context?.previousModuleContext) {
        queryClient.setQueryData(queryKeys.modules.detail(routeId), context.previousModuleContext);
      }
      if (context && context.previousModuleMaterials !== undefined) {
        queryClient.setQueryData(queryKeys.modules.materials(routeId), context.previousModuleMaterials);
      }
      if (context && context.previousCourseModules !== undefined) {
        queryClient.setQueryData(
          queryKeys.courses.modules(courseId),
          context.previousCourseModules
        );
      }
      showToast(getUserFriendlyError(error, "Failed to delete module"), "error");
    },
    onSuccess: ({ moduleId }) => {
      queryClient.removeQueries({ queryKey: queryKeys.modules.detail(moduleId) });
      queryClient.removeQueries({ queryKey: queryKeys.modules.materials(moduleId) });
      showToast("Module deleted");
    },
    onSettled: async (_data, _error, variables) => {
      await invalidateCourseQueries(queryClient, variables.courseId);
    },
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: async (material: Material) => {
      await apiFetch(`/api/materials/${material.id}`, { method: "DELETE" });
      return material;
    },
    onMutate: async (material) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.modules.materials(routeId) });
      const previousMaterials =
        queryClient.getQueryData<Material[]>(queryKeys.modules.materials(routeId)) ?? [];

      queryClient.setQueryData<Material[]>(
        queryKeys.modules.materials(routeId),
        previousMaterials.filter((item) => item.id !== material.id)
      );
      queryClient.removeQueries({ queryKey: queryKeys.materials.detail(material.id) });

      return { previousMaterials };
    },
    onError: (error, _material, context) => {
      if (context && context.previousMaterials !== undefined) {
        queryClient.setQueryData(queryKeys.modules.materials(routeId), context.previousMaterials);
      }
      showToast(getUserFriendlyError(error, "Failed to delete material"), "error");
    },
    onSuccess: () => {
      showToast("Material deleted");
    },
    onSettled: async () => {
      await invalidateModuleQueries(queryClient, routeId);
    },
  });

  const context = moduleQuery.data ?? null;
  const materials = materialsQuery.data ?? [];
  const loading = moduleQuery.isPending && !context;
  const refreshing =
    (moduleQuery.isRefetching || materialsQuery.isRefetching) &&
    !moduleQuery.isPending &&
    !materialsQuery.isPending;
  const error =
    moduleQuery.error || materialsQuery.error
      ? getUserFriendlyError(moduleQuery.error ?? materialsQuery.error, "Failed to load module")
      : "";

  useFocusEffect(
    useCallback(() => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.modules.detail(routeId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.modules.materials(routeId) }),
      ]);
    }, [queryClient, routeId])
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
        await deleteModuleMutation.mutateAsync({
          moduleId: context.module.id,
          courseId: context.course.id,
        });
        router.replace({ pathname: "/course/[id]", params: { id: context.course.id } });
      } catch {
        // Error toast is handled in mutation callbacks.
      } finally {
        setConfirmVisible(false);
      }
    } else if (confirmTarget.type === "material") {
      const { material } = confirmTarget;
      try {
        await deleteMaterialMutation.mutateAsync(material);
      } catch {
        // Error toast is handled in mutation callbacks.
      } finally {
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
          onPress={() => {
            void Promise.all([moduleQuery.refetch(), materialsQuery.refetch()]);
          }}
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void Promise.all([moduleQuery.refetch(), materialsQuery.refetch()]);
            }}
            tintColor={COLORS.brandPrimary}
          />
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
