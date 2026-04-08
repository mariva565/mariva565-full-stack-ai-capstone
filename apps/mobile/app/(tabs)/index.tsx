import { useCallback, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text as RNText,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { EmptyState } from "../../components/empty-state";
import { BrandedSpinner } from "../../components/branded-spinner";
import { ConfirmModal } from "../../components/confirm-modal";
import { useAuth } from "../../lib/auth-context";
import { COLORS, GRADIENTS } from "../../lib/colors";
import { useToast } from "../../lib/toast-context";
import { apiFetch, getUserFriendlyError } from "../../lib/api";
import { invalidateCoursesList, queryKeys } from "../../lib/query-keys";

type Course = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  isPublic: boolean;
  createdAt: string;
};

type CourseCardProps = {
  item: Course;
  index: number;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function CourseCard({ item, index, onOpen, onEdit, onDelete }: CourseCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useFocusEffect(
    useCallback(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          delay: index * 80,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          delay: index * 80,
          useNativeDriver: true,
        }),
      ]).start();
    }, [fadeAnim, index, slideAnim])
  );

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={styles.courseCard}>
        <View style={styles.cardAccent} />
        <TouchableOpacity
          style={styles.cardContent}
          onPress={onOpen}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={`Open course ${item.title}`}
        >
          <RNText style={styles.courseTitle} numberOfLines={1}>
            {item.title}
          </RNText>
          {item.description ? (
            <RNText style={styles.courseDesc} numberOfLines={2}>
              {item.description}
            </RNText>
          ) : null}
          <RNText style={styles.courseDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </RNText>
        </TouchableOpacity>
        <View style={styles.inlineActions}>
          <TouchableOpacity
            style={[styles.inlineActionBtn, styles.inlineEditBtn]}
            onPress={onEdit}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={`Edit course ${item.title}`}
          >
            <RNText style={[styles.inlineActionText, styles.inlineEditText]}>Edit</RNText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.inlineActionBtn, styles.inlineDeleteBtn]}
            onPress={onDelete}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={`Delete course ${item.title}`}
          >
            <RNText style={[styles.inlineActionText, styles.inlineDeleteText]}>Delete</RNText>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

export default function CoursesListScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);

  const coursesQuery = useQuery({
    queryKey: queryKeys.courses.lists(),
    queryFn: async () => {
      const data = await apiFetch<{ courses: Course[] }>("/api/courses");
      return data.courses;
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (course: Course) => {
      await apiFetch(`/api/courses/${course.id}`, { method: "DELETE" });
      return course;
    },
    onMutate: async (course) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.courses.lists() });
      const previousCourses = queryClient.getQueryData<Course[]>(queryKeys.courses.lists()) ?? [];
      queryClient.setQueryData<Course[]>(
        queryKeys.courses.lists(),
        previousCourses.filter((item) => item.id !== course.id)
      );

      return { previousCourses };
    },
    onError: (error, _course, context) => {
      if (context && context.previousCourses !== undefined) {
        queryClient.setQueryData(queryKeys.courses.lists(), context.previousCourses);
      }
      showToast(getUserFriendlyError(error, "Failed to delete course"), "error");
    },
    onSuccess: async (course) => {
      queryClient.removeQueries({ queryKey: queryKeys.courses.detail(course.id) });
      queryClient.removeQueries({ queryKey: queryKeys.courses.modules(course.id) });
      showToast("Course deleted");
      await invalidateCoursesList(queryClient);
    },
  });

  const courses = coursesQuery.data ?? [];
  const loading = coursesQuery.isPending && courses.length === 0;
  const refreshing = coursesQuery.isRefetching && !coursesQuery.isPending;
  const error = coursesQuery.error
    ? getUserFriendlyError(coursesQuery.error, "Failed to load courses")
    : "";

  useFocusEffect(
    useCallback(() => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.courses.lists() });
    }, [queryClient])
  );

  function openDeleteCourse(course: Course) {
    setDeleteTarget(course);
    setConfirmVisible(true);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget || deleteCourseMutation.isPending) return;

    try {
      await deleteCourseMutation.mutateAsync(deleteTarget);
    } catch {
      // Error toast is handled in mutation callbacks.
    } finally {
      setConfirmVisible(false);
      setDeleteTarget(null);
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={GRADIENTS.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View>
            <RNText style={styles.headerGreeting}>Welcome back,</RNText>
            <RNText style={styles.headerName}>{user?.name ?? "Student"}</RNText>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <RNText style={styles.statNumber}>{courses.length}</RNText>
            <RNText style={styles.statLabel}>{courses.length === 1 ? "Course" : "Courses"}</RNText>
          </View>
          <View style={styles.statItem}>
            <RNText style={styles.statNumber}>
              {courses.filter((course) => course.status === "published").length}
            </RNText>
            <RNText style={styles.statLabel}>Published</RNText>
          </View>
          <View style={styles.statItem}>
            <RNText style={styles.statNumber}>
              {courses.filter((course) => course.status === "draft").length}
            </RNText>
            <RNText style={styles.statLabel}>Drafts</RNText>
          </View>
        </View>
      </LinearGradient>

      {loading ? (
        <BrandedSpinner message="Loading courses..." />
      ) : error ? (
        <View style={styles.centered}>
          <RNText style={styles.errorText}>{error}</RNText>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              void coursesQuery.refetch();
            }}
            accessibilityRole="button"
            accessibilityLabel="Retry loading courses"
          >
            <RNText style={styles.retryText}>Retry</RNText>
          </TouchableOpacity>
        </View>
      ) : courses.length === 0 ? (
        <EmptyState icon="Courses" title="No courses yet" subtitle="Tap + to create your first course" />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                void coursesQuery.refetch();
              }}
              tintColor={COLORS.brandPrimary}
            />
          }
          renderItem={({ item, index }) => (
            <CourseCard
              item={item}
              index={index}
              onOpen={() => router.push({ pathname: "/course/[id]", params: { id: item.id } })}
              onEdit={() => router.push({ pathname: "/course/[id]/edit", params: { id: item.id } })}
              onDelete={() => openDeleteCourse(item)}
            />
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/create-course")}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Create course"
      >
        <LinearGradient colors={GRADIENTS.primaryAction} style={styles.fabGradient}>
          <RNText style={styles.fabText}>+</RNText>
        </LinearGradient>
      </TouchableOpacity>

      <ConfirmModal
        visible={confirmVisible}
        title="Delete course"
        message={`Delete "${deleteTarget?.title}"? This will also remove its modules and materials.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmVisible(false);
          setDeleteTarget(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.canvas },
  headerGradient: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20 },
  headerContent: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  headerGreeting: { fontSize: 14, color: "rgba(255,255,255,0.7)", fontWeight: "500" },
  headerName: { fontSize: 22, fontWeight: "800", color: COLORS.textOnBrand, marginTop: 2 },
  statsRow: { flexDirection: "row", marginTop: 20, gap: 12 },
  statItem: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  statNumber: { fontSize: 20, fontWeight: "800", color: COLORS.textOnBrand },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
    marginTop: 2,
  },
  list: { padding: 16, paddingBottom: 96 },
  courseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: COLORS.brandDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  cardAccent: { height: 4, backgroundColor: COLORS.brandPrimary },
  cardContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 },
  courseTitle: { fontSize: 17, fontWeight: "700", color: COLORS.textPrimary },
  inlineActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
  },
  inlineActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  inlineEditBtn: {
    backgroundColor: COLORS.violetSoft,
    borderColor: COLORS.violetBorder,
  },
  inlineDeleteBtn: {
    backgroundColor: COLORS.dangerSoft,
    borderColor: COLORS.dangerBorder,
  },
  inlineActionText: {
    fontSize: 12,
    fontWeight: "700",
  },
  inlineEditText: {
    color: COLORS.violetText,
  },
  inlineDeleteText: {
    color: COLORS.dangerText,
  },
  courseDesc: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginTop: 8 },
  courseDate: { fontSize: 12, color: COLORS.textMuted, marginTop: 10 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: { fontSize: 16, color: COLORS.danger, marginBottom: 16, textAlign: "center" },
  retryBtn: {
    backgroundColor: COLORS.brandPrimary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: COLORS.textOnBrand, fontWeight: "600" },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    borderRadius: 28,
    shadowColor: COLORS.brandPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  fabText: { fontSize: 28, fontWeight: "600", color: COLORS.textOnBrand, marginTop: -2 },
});
