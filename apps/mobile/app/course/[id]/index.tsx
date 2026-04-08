import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { BrandedSpinner } from "../../../components/branded-spinner";
import { ConfirmModal } from "../../../components/confirm-modal";
import { EmptyState } from "../../../components/empty-state";
import { ModuleListCard } from "../../../components/module-list-card";
import { ApiError, apiFetch } from "../../../lib/api";
import { useToast } from "../../../lib/toast-context";
import type { Course, Module } from "../../../lib/studyhub-types";

export default function CourseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const routeId = String(id);
  const router = useRouter();
  const { showToast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{ type: "course" } | { type: "module"; module: Module } | null>(null);

  const fetchCourse = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setError("");
      const [courseData, modulesData] = await Promise.all([
        apiFetch<{ course: Course }>(`/api/courses/${id}`),
        apiFetch<{ modules: Module[] }>(`/api/courses/${id}/modules`),
      ]);
      setCourse(courseData.course);
      setModules(modulesData.modules);
    } catch {
      setError("Failed to load course");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchCourse();
    }, [fetchCourse])
  );

  function openDeleteCourse() {
    setConfirmTarget({ type: "course" });
    setConfirmVisible(true);
  }

  function openDeleteModule(module: Module) {
    setConfirmTarget({ type: "module", module });
    setConfirmVisible(true);
  }

  async function handleConfirmDelete() {
    if (!confirmTarget) return;
    if (confirmTarget.type === "course" && course) {
      try {
        await apiFetch(`/api/courses/${course.id}`, { method: "DELETE" });
        showToast("Course deleted");
        setConfirmVisible(false);
        router.replace("/");
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Failed to delete course";
        showToast(message, "error");
        setConfirmVisible(false);
      }
    } else if (confirmTarget.type === "module") {
      const { module } = confirmTarget;
      try {
        await apiFetch(`/api/modules/${module.id}`, { method: "DELETE" });
        setModules((current) => current.filter((item) => item.id !== module.id));
        showToast("Module deleted");
        setConfirmVisible(false);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Failed to delete module";
        showToast(message, "error");
        setConfirmVisible(false);
      }
    }
  }

  const confirmTitle =
    confirmTarget?.type === "course"
      ? "Delete course"
      : "Delete module";
  const confirmMessage =
    confirmTarget?.type === "course"
      ? `Delete "${course?.title}"? This will also remove its modules and materials.`
      : confirmTarget?.type === "module"
        ? `Delete "${confirmTarget.module.title}" and all its materials?`
        : "";

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: "Loading..." }} />
        <BrandedSpinner message="Loading course..." />
      </>
    );
  }

  if (error || !course) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Error" }} />
        <Text style={styles.errorText}>{error || "Course not found"}</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => fetchCourse()}
          accessibilityRole="button"
          accessibilityLabel="Retry loading course"
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
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchCourse(true)} tintColor="#4d33c4" />
        }
      >
        <Stack.Screen options={{ title: course.title }} />

        <LinearGradient colors={["#2e1d7a", "#4d33c4", "#7c5ce7"]} style={styles.hero}>
          <Text style={styles.heroEyebrow}>Course overview</Text>
          <Text style={styles.heroTitle}>{course.title}</Text>
          {course.description ? <Text style={styles.heroDesc}>{course.description}</Text> : null}
          <View style={styles.heroMetaRow}>
            <Text style={styles.heroMeta}>{modules.length} modules</Text>
            <Text style={styles.heroMeta}>Created {new Date(course.createdAt).toLocaleDateString()}</Text>
          </View>
          <View style={styles.courseActionsRow}>
            <TouchableOpacity
              style={[styles.courseActionBtn, styles.courseEditBtn]}
              onPress={() => router.push({ pathname: "/course/[id]/edit", params: { id: routeId } })}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Edit course ${course.title}`}
            >
              <Text style={[styles.courseActionText, styles.courseEditText]}>Edit Course</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.courseActionBtn, styles.courseDeleteBtn]}
              onPress={openDeleteCourse}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Delete course ${course.title}`}
            >
              <Text style={[styles.courseActionText, styles.courseDeleteText]}>Delete Course</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Modules</Text>
            <Text style={styles.sectionSubtitle}>Open a module to manage its materials in a dedicated workspace.</Text>
          </View>
          <TouchableOpacity
            style={styles.addModuleBtn}
            onPress={() => router.push({ pathname: "/course/[id]/add-module", params: { id: routeId } })}
            accessibilityRole="button"
            accessibilityLabel="Add module"
          >
            <Text style={styles.addModuleBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {modules.length === 0 ? (
          <EmptyState icon="Modules" title="No modules yet" subtitle="Add your first module to start organizing materials." />
        ) : (
          modules.map((module, index) => (
            <ModuleListCard
              key={module.id}
              index={index}
              module={module}
              onOpen={() => router.push({ pathname: "/module/[id]", params: { id: module.id } })}
              onEdit={() => router.push({ pathname: "/module/[id]/edit", params: { id: module.id } })}
              onDelete={() => openDeleteModule(module)}
            />
          ))
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
  heroEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    color: "rgba(255,255,255,0.65)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  heroTitle: { fontSize: 24, fontWeight: "800", color: "#ffffff", marginBottom: 10 },
  heroDesc: { fontSize: 15, color: "rgba(255,255,255,0.84)", lineHeight: 22, marginBottom: 12 },
  heroMetaRow: { gap: 4 },
  heroMeta: { fontSize: 12, color: "rgba(255,255,255,0.6)" },
  courseActionsRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  courseActionBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  courseEditBtn: { backgroundColor: "rgba(255,255,255,0.14)", borderColor: "rgba(255,255,255,0.35)" },
  courseDeleteBtn: { backgroundColor: "rgba(190,24,93,0.18)", borderColor: "rgba(253,164,175,0.4)" },
  courseActionText: { fontSize: 13, fontWeight: "700" },
  courseEditText: { color: "#ffffff" },
  courseDeleteText: { color: "#ffe4e6" },
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
  sectionSubtitle: { fontSize: 13, color: "#64748b", lineHeight: 19, marginTop: 4, maxWidth: 250 },
  addModuleBtn: {
    backgroundColor: "#ede9fe",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addModuleBtnText: { fontSize: 13, fontWeight: "700", color: "#4d33c4" },
  bottomSpacer: { height: 32 },
});
