import type { QueryClient } from "@tanstack/react-query";

type QueryEntityId = string | number;

function toKeyId(id: QueryEntityId): string {
  return String(id);
}

export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => ["auth", "me"] as const,
  },
  dashboard: {
    courseStatsRoot: () => ["courses-tree-stats"] as const,
    courseStats: (courseIds: ReadonlyArray<QueryEntityId>) =>
      ["courses-tree-stats", [...courseIds]] as const,
  },
  courses: {
    all: ["courses"] as const,
    lists: () => ["courses", "list"] as const,
    detail: (courseId: QueryEntityId) =>
      ["courses", "detail", toKeyId(courseId)] as const,
    modules: (courseId: QueryEntityId) =>
      ["courses", "detail", toKeyId(courseId), "modules"] as const,
  },
  modules: {
    all: ["modules"] as const,
    detail: (moduleId: QueryEntityId) =>
      ["modules", "detail", toKeyId(moduleId)] as const,
    materials: (moduleId: QueryEntityId) =>
      ["modules", "detail", toKeyId(moduleId), "materials"] as const,
  },
  materials: {
    all: ["materials"] as const,
    detail: (materialId: QueryEntityId) =>
      ["materials", "detail", toKeyId(materialId)] as const,
  },
  favorites: {
    all: ["favorites"] as const,
    lists: () => ["favorites", "list"] as const,
  },
} as const;

async function invalidateCourseStats(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({
    queryKey: queryKeys.dashboard.courseStatsRoot(),
  });
}

export async function invalidateAuthMe(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
}

export async function invalidateCoursesList(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.courses.lists() }),
    invalidateCourseStats(queryClient),
  ]);
}

export async function invalidateCourseQueries(
  queryClient: QueryClient,
  courseId: QueryEntityId
): Promise<void> {
  await Promise.all([
    invalidateCourseStats(queryClient),
    queryClient.invalidateQueries({ queryKey: queryKeys.courses.lists() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.courses.detail(courseId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.courses.modules(courseId) }),
  ]);
}

export async function invalidateModuleQueries(
  queryClient: QueryClient,
  moduleId: QueryEntityId
): Promise<void> {
  await Promise.all([
    invalidateCourseStats(queryClient),
    queryClient.invalidateQueries({ queryKey: queryKeys.modules.detail(moduleId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.modules.materials(moduleId) }),
  ]);
}

export async function invalidateMaterialQueries(
  queryClient: QueryClient,
  materialId: QueryEntityId
): Promise<void> {
  await Promise.all([
    invalidateCourseStats(queryClient),
    queryClient.invalidateQueries({
      queryKey: queryKeys.materials.detail(materialId),
    }),
  ]);
}

export async function invalidateFavoritesList(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    invalidateCourseStats(queryClient),
    queryClient.invalidateQueries({ queryKey: queryKeys.favorites.lists() }),
  ]);
}
