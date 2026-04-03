import { desc, eq } from "drizzle-orm";

import { courses, materials, modules } from "../../../drizzle/schema";
import type { ModuleInfo } from "../components/course/module-section";
import type { ModuleWorkspaceCourse, ModuleWorkspaceData } from "../components/modules/types";
import type { CourseMaterial } from "./course-materials";
import { db } from "./db";
import { getCourseModules } from "./course-details-data";
import { getFavoriteItems } from "./favorites-data";

function toIsoString(value: Date | string) {
  return typeof value === "string" ? value : value.toISOString();
}

export async function getModuleContext(
  moduleId: number
): Promise<{ module: ModuleInfo; course: ModuleWorkspaceCourse } | null> {
  const [result] = await db
    .select({
      module: {
        id: modules.id,
        courseId: modules.courseId,
        title: modules.title,
        description: modules.description,
        orderIndex: modules.orderIndex,
      },
      course: {
        id: courses.id,
        title: courses.title,
        description: courses.description,
      },
    })
    .from(modules)
    .innerJoin(courses, eq(modules.courseId, courses.id))
    .where(eq(modules.id, moduleId))
    .limit(1);

  return result ?? null;
}

export async function getModuleMaterials(moduleId: number): Promise<CourseMaterial[]> {
  const rows = await db
    .select({
      id: materials.id,
      title: materials.title,
      materialType: materials.materialType,
      content: materials.content,
      fileUrl: materials.fileUrl,
      tags: materials.tags,
      createdAt: materials.createdAt,
    })
    .from(materials)
    .where(eq(materials.moduleId, moduleId))
    .orderBy(desc(materials.createdAt));

  return rows.map((material) => ({
    ...material,
    createdAt: toIsoString(material.createdAt),
  }));
}

export async function getModuleWorkspaceData(
  userId: number,
  moduleId: number
): Promise<ModuleWorkspaceData | null> {
  const context = await getModuleContext(moduleId);
  if (!context) {
    return null;
  }

  const [courseModules, moduleMaterials, favoriteItems] = await Promise.all([
    getCourseModules(context.course.id),
    getModuleMaterials(moduleId),
    getFavoriteItems(userId),
  ]);

  return {
    course: context.course,
    module: context.module,
    modules: courseModules,
    materials: moduleMaterials,
    favorites: favoriteItems,
  };
}
