import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { useAuth } from "../../lib/auth-context";
import { apiFetch, getUserFriendlyError } from "../../lib/api";
import { invalidateCoursesList, queryKeys } from "../../lib/query-keys";
import { captureTelemetryMessage } from "../../lib/telemetry";
import { useToast } from "../../lib/toast-context";
import type { Course } from "../../lib/studyhub-types";
import type { CoursesStats, CoursesListViewModel } from "./courses-list.types";

type DeleteCoursesRollback = { previousCourses: Course[] };
type DeleteCourseMutation = UseMutationResult<
  Course,
  unknown,
  Course,
  DeleteCoursesRollback
>;

type DeleteDialogState = {
  confirmVisible: boolean;
  deleteTargetTitle: string;
  openDeleteCourse: (course: Course) => void;
  cancelDeleteCourse: () => void;
  confirmDeleteCourse: () => Promise<void>;
};

type CourseNavigation = {
  openCourse: (courseId: number) => void;
  editCourse: (courseId: number) => void;
  openCreateCourse: () => void;
};

function useCoursesQuery() {
  return useQuery({
    queryKey: queryKeys.courses.lists(),
    queryFn: async () => {
      const data = await apiFetch<{ courses: Course[] }>("/api/courses", { cache: false });
      return data.courses;
    },
  });
}

function useRefetchCoursesOnFocus(queryClient: QueryClient) {
  useFocusEffect(
    useCallback(() => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.courses.lists() });
    }, [queryClient])
  );
}

function useDeleteCourseMutation(queryClient: QueryClient, showToast: ReturnType<typeof useToast>["showToast"]) {
  return useMutation<Course, unknown, Course, DeleteCoursesRollback>({
    mutationFn: async (course) => {
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
      showToast("Course deleted", "success", { haptic: "destructive" });
      await invalidateCoursesList(queryClient);
    },
  });
}

function getFallbackStats(courses: Course[]): CoursesStats {
  return { courses: courses.length, modules: 0, materials: 0 };
}

type DashboardStatsResponse = {
  courses?: unknown;
  moduleCount?: unknown;
  materialCount?: unknown;
};

const DASHBOARD_STATS_SLOW_THRESHOLD_MS = 1500;

function toNonNegativeCount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.floor(value);
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return Math.floor(parsed);
    }
  }

  return 0;
}

function resolveCoursesCount(value: unknown, fallbackCount: number): number {
  if (Array.isArray(value)) {
    return value.length;
  }

  const normalized = toNonNegativeCount(value);
  return normalized > 0 ? normalized : fallbackCount;
}

function reportDashboardStatsLatency(elapsedMs: number, courseCount: number): void {
  if (elapsedMs < DASHBOARD_STATS_SLOW_THRESHOLD_MS) {
    return;
  }

  captureTelemetryMessage("Slow mobile dashboard stats fetch", {
    area: "courses_stats_latency",
    details: {
      path: "/api/dashboard",
      elapsedMs,
      courseCount,
      thresholdMs: DASHBOARD_STATS_SLOW_THRESHOLD_MS,
    },
  });

  if (__DEV__) {
    console.info(
      `[perf] /api/dashboard slow fetch: ${elapsedMs}ms for ${courseCount} courses`
    );
  }
}

async function fetchDashboardStats(fallbackCourseCount: number): Promise<CoursesStats> {
  const requestStartedAt = Date.now();
  const dashboard = await apiFetch<DashboardStatsResponse>("/api/dashboard", { cache: false });
  reportDashboardStatsLatency(Date.now() - requestStartedAt, fallbackCourseCount);

  return {
    courses: resolveCoursesCount(dashboard.courses, fallbackCourseCount),
    modules: toNonNegativeCount(dashboard.moduleCount),
    materials: toNonNegativeCount(dashboard.materialCount),
  };
}

function useDashboardStatsQuery(courses: Course[]) {
  return useQuery({
    queryKey: queryKeys.dashboard.courseStats(courses.map((course) => course.id)),
    queryFn: () => fetchDashboardStats(courses.length),
    enabled: courses.length > 0,
    retry: 1,
    staleTime: 1000 * 60,
  });
}

function useDeleteDialogState(deleteCourseMutation: DeleteCourseMutation): DeleteDialogState {
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);

  const openDeleteCourse = useCallback((course: Course) => {
    setDeleteTarget(course);
    setConfirmVisible(true);
  }, []);

  const cancelDeleteCourse = useCallback(() => {
    setConfirmVisible(false);
    setDeleteTarget(null);
  }, []);

  const confirmDeleteCourse = useCallback(async () => {
    if (!deleteTarget || deleteCourseMutation.isPending) {
      return;
    }

    try {
      await deleteCourseMutation.mutateAsync(deleteTarget);
    } catch {
      // Error toast is handled in mutation callbacks.
    } finally {
      cancelDeleteCourse();
    }
  }, [cancelDeleteCourse, deleteCourseMutation, deleteTarget]);

  return {
    confirmVisible,
    deleteTargetTitle: deleteTarget?.title ?? "",
    openDeleteCourse,
    cancelDeleteCourse,
    confirmDeleteCourse,
  };
}

function useCourseNavigation(): CourseNavigation {
  const router = useRouter();

  const openCourse = useCallback((courseId: number): void => {
    router.push({ pathname: "/course/[id]", params: { id: courseId } });
  }, [router]);

  const editCourse = useCallback((courseId: number): void => {
    router.push({ pathname: "/course/[id]/edit", params: { id: courseId } });
  }, [router]);

  const openCreateCourse = useCallback((): void => {
    router.push("/create-course");
  }, [router]);

  return { openCourse, editCourse, openCreateCourse };
}

export function useCoursesList(): CoursesListViewModel {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const coursesQuery = useCoursesQuery();
  const deleteCourseMutation = useDeleteCourseMutation(queryClient, showToast);
  useRefetchCoursesOnFocus(queryClient);

  const courses = coursesQuery.data ?? [];
  const statsQuery = useDashboardStatsQuery(courses);
  const loading = coursesQuery.isPending && courses.length === 0;
  const refreshing = coursesQuery.isRefetching && !coursesQuery.isPending;
  const error = coursesQuery.error
    ? getUserFriendlyError(coursesQuery.error, "Failed to load courses")
    : "";
  const stats = useMemo(
    () => statsQuery.data ?? getFallbackStats(courses),
    [courses, statsQuery.data]
  );

  const refresh = useCallback(() => {
    void coursesQuery.refetch();
  }, [coursesQuery]);

  const navigation = useCourseNavigation();
  const deleteDialog = useDeleteDialogState(deleteCourseMutation);

  return {
    userName: user?.name ?? "Student",
    courses,
    stats,
    loading,
    refreshing,
    error,
    confirmVisible: deleteDialog.confirmVisible,
    deleteTargetTitle: deleteDialog.deleteTargetTitle,
    retry: refresh,
    refresh,
    openCourse: navigation.openCourse,
    editCourse: navigation.editCourse,
    openCreateCourse: navigation.openCreateCourse,
    openDeleteCourse: deleteDialog.openDeleteCourse,
    confirmDeleteCourse: deleteDialog.confirmDeleteCourse,
    cancelDeleteCourse: deleteDialog.cancelDeleteCourse,
  };
}
