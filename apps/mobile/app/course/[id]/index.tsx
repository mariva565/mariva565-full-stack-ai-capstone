import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { BrandedSpinner } from "../../../components/branded-spinner";
import { ConfirmModal } from "../../../components/confirm-modal";
import { EmptyState } from "../../../components/empty-state";
import { ModuleListCard } from "../../../components/module-list-card";
import { apiFetch, getUserFriendlyError } from "../../../lib/api";
import { COLORS, GRADIENTS } from "../../../lib/colors";
import { invalidateCourseQueries, queryKeys } from "../../../lib/query-keys";
import { useToast } from "../../../lib/toast-context";
import type { Course, Module } from "../../../lib/studyhub-types";

export default function CourseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const routeId = String(id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{ type: "course" } | { type: "module"; module: Module } | null>(null);

  const courseQuery = useQuery({
    queryKey: queryKeys.courses.detail(routeId),
    queryFn: async () => {
      const data = await apiFetch<{ course: Course }>(`/api/courses/${routeId}`);
      return data.course;
    },
  });

  const modulesQuery = useQuery({
    queryKey: queryKeys.courses.modules(routeId),
    queryFn: async () => {
      const data = await apiFetch<{ modules: Module[] }>(`/api/courses/${routeId}/modules`);
      return data.modules;
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: number) => {
      await apiFetch(`/api/courses/${courseId}`, { method: "DELETE" });
      return courseId;
    },
    onMutate: async (courseId) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: queryKeys.courses.lists() }),
        queryClient.cancelQueries({ queryKey: queryKeys.courses.detail(courseId) }),
        queryClient.cancelQueries({ queryKey: queryKeys.courses.modules(courseId) }),
      ]);

      const previousCourses = queryClient.getQueryData<Course[]>(queryKeys.courses.lists()) ?? [];
      const previousCourse = queryClient.getQueryData<Course>(queryKeys.courses.detail(courseId));
      const previousModules = queryClient.getQueryData<Module[]>(
        queryKeys.courses.modules(courseId)
      );

      queryClient.setQueryData<Course[]>(
        queryKeys.courses.lists(),
        previousCourses.filter((item) => item.id !== courseId)
      );
      queryClient.removeQueries({ queryKey: queryKeys.courses.detail(courseId) });
      queryClient.removeQueries({ queryKey: queryKeys.courses.modules(courseId) });

      return { previousCourses, previousCourse, previousModules };
    },
    onError: (error, courseId, context) => {
      if (context) {
        queryClient.setQueryData(queryKeys.courses.lists(), context.previousCourses);
        if (context.previousCourse) {
          queryClient.setQueryData(queryKeys.courses.detail(courseId), context.previousCourse);
        }
        if (context.previousModules !== undefined) {
          queryClient.setQueryData(queryKeys.courses.modules(courseId), context.previousModules);
        }
      }
      showToast(getUserFriendlyError(error, "Failed to delete course"), "error");
    },
    onSuccess: () => {
      showToast("Course deleted");
    },
  });

  const deleteModuleMutation = useMutation({
    mutationFn: async (module: Module) => {
      await apiFetch(`/api/modules/${module.id}`, { method: "DELETE" });
      return module;
    },
    onMutate: async (module) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.courses.modules(routeId) });
      const previousModules =
        queryClient.getQueryData<Module[]>(queryKeys.courses.modules(routeId)) ?? [];

      queryClient.setQueryData<Module[]>(
        queryKeys.courses.modules(routeId),
        previousModules.filter((item) => item.id !== module.id)
      );

      return { previousModules };
    },
    onError: (error, _module, context) => {
      if (context && context.previousModules !== undefined) {
        queryClient.setQueryData(queryKeys.courses.modules(routeId), context.previousModules);
      }
      showToast(getUserFriendlyError(error, "Failed to delete module"), "error");
    },
    onSuccess: (module) => {
      queryClient.removeQueries({ queryKey: queryKeys.modules.detail(module.id) });
      queryClient.removeQueries({ queryKey: queryKeys.modules.materials(module.id) });
      showToast("Module deleted");
    },
    onSettled: async () => {
      await invalidateCourseQueries(queryClient, routeId);
    },
  });

  const course = courseQuery.data ?? null;
  const modules = modulesQuery.data ?? [];
  const loading = courseQuery.isPending && !course;
  const refreshing =
    (courseQuery.isRefetching || modulesQuery.isRefetching) &&
    !courseQuery.isPending &&
    !modulesQuery.isPending;
  const error =
    courseQuery.error || modulesQuery.error
      ? getUserFriendlyError(courseQuery.error ?? modulesQuery.error, "Failed to load course")
      : "";

  useFocusEffect(
    useCallback(() => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.courses.detail(routeId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.courses.modules(routeId) }),
      ]);
    }, [queryClient, routeId])
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
        await deleteCourseMutation.mutateAsync(course.id);
        await invalidateCourseQueries(queryClient, course.id);
        router.replace("/");
      } catch {
        // Error toast is handled in mutation callbacks.
      } finally {
        setConfirmVisible(false);
      }
    } else if (confirmTarget.type === "module") {
      const { module } = confirmTarget;
      try {
        await deleteModuleMutation.mutateAsync(module);
      } catch {
        // Error toast is handled in mutation callbacks.
      } finally {
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
          onPress={() => {
            void Promise.all([courseQuery.refetch(), modulesQuery.refetch()]);
          }}
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void Promise.all([courseQuery.refetch(), modulesQuery.refetch()]);
            }}
            tintColor={COLORS.brandPrimary}
          />
        }
      >
        <Stack.Screen options={{ title: course.title }} />

        <LinearGradient colors={GRADIENTS.heroStrong} style={styles.hero}>
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
  heroEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    color: "rgba(255,255,255,0.65)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  heroTitle: { fontSize: 24, fontWeight: "800", color: COLORS.textOnBrand, marginBottom: 10 },
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
  courseEditText: { color: COLORS.textOnBrand },
  courseDeleteText: { color: COLORS.textOnDangerSoft },
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
  sectionSubtitle: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, marginTop: 4, maxWidth: 250 },
  addModuleBtn: {
    backgroundColor: COLORS.lavenderSoft,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addModuleBtnText: { fontSize: 13, fontWeight: "700", color: COLORS.brandPrimary },
  bottomSpacer: { height: 32 },
});
