import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { apiFetch, getUserFriendlyError } from "../../lib/api";
import { invalidateCourseQueries, queryKeys } from "../../lib/query-keys";
import type { Course, Module } from "../../lib/studyhub-types";
import { useToast } from "../../lib/toast-context";

type ConfirmTarget = { type: "course" } | { type: "module"; module: Module } | null;

type ConfirmCopy = {
  title: string;
  message: string;
};

type CourseFetchState = {
  course: Course | null;
  modules: Module[];
  loading: boolean;
  refreshing: boolean;
  error: string;
  refresh: () => void;
};

type ConfirmDialogState = {
  confirmVisible: boolean;
  confirmTitle: string;
  confirmMessage: string;
  openDeleteCourse: () => void;
  openDeleteModule: (module: Module) => void;
  closeConfirm: () => void;
  confirmDelete: () => void;
};

export type CourseDetailsViewModel = {
  routeId: string;
  course: Course | null;
  modules: Module[];
  loading: boolean;
  refreshing: boolean;
  error: string;
  confirmVisible: boolean;
  confirmTitle: string;
  confirmMessage: string;
  retry: () => void;
  refresh: () => void;
  openDeleteCourse: () => void;
  openDeleteModule: (module: Module) => void;
  confirmDelete: () => void;
  closeConfirm: () => void;
};

function useCourseQuery(routeId: string) {
  return useQuery({
    queryKey: queryKeys.courses.detail(routeId),
    queryFn: async () => {
      const data = await apiFetch<{ course: Course }>(`/api/courses/${routeId}`, {
        cache: false,
      });
      return data.course;
    },
  });
}

function useModulesQuery(routeId: string) {
  return useQuery({
    queryKey: queryKeys.courses.modules(routeId),
    queryFn: async () => {
      const data = await apiFetch<{ modules: Module[] }>(`/api/courses/${routeId}/modules`, {
        cache: false,
      });
      return data.modules;
    },
  });
}

function useDeleteCourseMutation(queryClient: ReturnType<typeof useQueryClient>, showToast: ReturnType<typeof useToast>["showToast"]) {
  return useMutation({
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
      showToast("Course deleted", "success", { haptic: "destructive" });
    },
  });
}

function useDeleteModuleMutation(
  queryClient: ReturnType<typeof useQueryClient>,
  showToast: ReturnType<typeof useToast>["showToast"],
  routeId: string
) {
  return useMutation({
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
      showToast("Module deleted", "success", { haptic: "destructive" });
    },
    onSettled: async () => {
      await invalidateCourseQueries(queryClient, routeId);
    },
  });
}

function buildConfirmCopy(confirmTarget: ConfirmTarget, courseTitle?: string): ConfirmCopy {
  if (!confirmTarget) {
    return { title: "Delete module", message: "" };
  }
  if (confirmTarget.type === "course") {
    return {
      title: "Delete course",
      message: `Delete "${courseTitle}"? This will also remove its modules and materials.`,
    };
  }
  return {
    title: "Delete module",
    message: `Delete "${confirmTarget.module.title}" and all its materials?`,
  };
}

function useCourseFetchState(
  routeId: string,
  queryClient: ReturnType<typeof useQueryClient>
): CourseFetchState {
  const courseQuery = useCourseQuery(routeId);
  const modulesQuery = useModulesQuery(routeId);
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
  const refresh = useCallback(() => {
    void Promise.all([courseQuery.refetch(), modulesQuery.refetch()]);
  }, [courseQuery, modulesQuery]);

  useFocusEffect(
    useCallback(() => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.courses.detail(routeId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.courses.modules(routeId) }),
      ]);
    }, [queryClient, routeId])
  );

  return { course, modules, loading, refreshing, error, refresh };
}

function useConfirmDialogState(
  course: Course | null,
  deleteCourseMutation: ReturnType<typeof useDeleteCourseMutation>,
  deleteModuleMutation: ReturnType<typeof useDeleteModuleMutation>,
  queryClient: ReturnType<typeof useQueryClient>,
  router: ReturnType<typeof useRouter>
): ConfirmDialogState {
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null);
  const confirmCopy = useMemo(
    () => buildConfirmCopy(confirmTarget, course?.title),
    [confirmTarget, course?.title]
  );
  const openDeleteCourse = useCallback(() => {
    setConfirmTarget({ type: "course" });
    setConfirmVisible(true);
  }, []);
  const openDeleteModule = useCallback((module: Module) => {
    setConfirmTarget({ type: "module", module });
    setConfirmVisible(true);
  }, []);
  const closeConfirm = useCallback(() => {
    setConfirmVisible(false);
  }, []);
  const confirmDelete = useCallback(() => {
    if (!confirmTarget) {
      return;
    }
    const deleteAction = async () => {
      if (confirmTarget.type === "course" && course) {
        await deleteCourseMutation.mutateAsync(course.id);
        await invalidateCourseQueries(queryClient, course.id);
        router.replace("/");
        return;
      }
      if (confirmTarget.type === "module") {
        await deleteModuleMutation.mutateAsync(confirmTarget.module);
      }
    };
    void deleteAction()
      .catch(() => {
        // Error toast is handled in mutation callbacks.
      })
      .finally(() => {
        setConfirmVisible(false);
      });
  }, [confirmTarget, course, deleteCourseMutation, deleteModuleMutation, queryClient, router]);

  return {
    confirmVisible,
    confirmTitle: confirmCopy.title,
    confirmMessage: confirmCopy.message,
    openDeleteCourse,
    openDeleteModule,
    closeConfirm,
    confirmDelete,
  };
}

export function useCourseDetailsScreen(routeId: string): CourseDetailsViewModel {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const fetchState = useCourseFetchState(routeId, queryClient);
  const deleteCourseMutation = useDeleteCourseMutation(queryClient, showToast);
  const deleteModuleMutation = useDeleteModuleMutation(queryClient, showToast, routeId);
  const deleteDialog = useConfirmDialogState(
    fetchState.course,
    deleteCourseMutation,
    deleteModuleMutation,
    queryClient,
    router
  );

  return {
    routeId,
    course: fetchState.course,
    modules: fetchState.modules,
    loading: fetchState.loading,
    refreshing: fetchState.refreshing,
    error: fetchState.error,
    confirmVisible: deleteDialog.confirmVisible,
    confirmTitle: deleteDialog.confirmTitle,
    confirmMessage: deleteDialog.confirmMessage,
    retry: fetchState.refresh,
    refresh: fetchState.refresh,
    openDeleteCourse: deleteDialog.openDeleteCourse,
    openDeleteModule: deleteDialog.openDeleteModule,
    confirmDelete: deleteDialog.confirmDelete,
    closeConfirm: deleteDialog.closeConfirm,
  };
}
