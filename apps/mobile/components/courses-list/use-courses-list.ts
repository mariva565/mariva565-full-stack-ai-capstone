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
  confirmDeleteCourse: () => void;
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
      showToast("Course deleted");
      await invalidateCoursesList(queryClient);
    },
  });
}

function getCourseStats(courses: Course[]): CoursesStats {
  const published = courses.filter((course) => course.status === "published").length;
  const drafts = courses.filter((course) => course.status === "draft").length;
  return { total: courses.length, published, drafts };
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

  const confirmDeleteCourse = useCallback(() => {
    if (!deleteTarget || deleteCourseMutation.isPending) {
      return;
    }
    void deleteCourseMutation.mutateAsync(deleteTarget).finally(cancelDeleteCourse);
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
  const loading = coursesQuery.isPending && courses.length === 0;
  const refreshing = coursesQuery.isRefetching && !coursesQuery.isPending;
  const error = coursesQuery.error
    ? getUserFriendlyError(coursesQuery.error, "Failed to load courses")
    : "";
  const stats = useMemo(() => getCourseStats(courses), [courses]);

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
