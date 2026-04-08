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
} as const;

export async function invalidateAuthMe(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
}

export async function invalidateCoursesList(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.courses.lists() });
}

export async function invalidateCourseQueries(
  queryClient: QueryClient,
  courseId: QueryEntityId
): Promise<void> {
  await Promise.all([
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
    queryClient.invalidateQueries({ queryKey: queryKeys.modules.detail(moduleId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.modules.materials(moduleId) }),
  ]);
}

export async function invalidateMaterialQueries(
  queryClient: QueryClient,
  materialId: QueryEntityId
): Promise<void> {
  await queryClient.invalidateQueries({
    queryKey: queryKeys.materials.detail(materialId),
  });
}
