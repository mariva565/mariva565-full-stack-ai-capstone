import { desc, eq } from "drizzle-orm";
import {
  courses,
  favorites,
  materials,
  modules,
} from "../../../drizzle/schema";
import type { DashboardData } from "../components/dashboard/types";
import { db } from "./db";

function toIsoString(value: Date | string) {
  return typeof value === "string" ? value : value.toISOString();
}

export async function getDashboardData(userId: number): Promise<DashboardData> {
  const [courseRows, favoriteRows] = await Promise.all([
    db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        status: courses.status,
        createdAt: courses.createdAt,
      })
      .from(courses)
      .where(eq(courses.createdBy, userId))
      .orderBy(desc(courses.createdAt)),
    db
      .select({
        id: favorites.id,
        materialId: favorites.materialId,
        createdAt: favorites.createdAt,
        materialTitle: materials.title,
        materialType: materials.materialType,
        tags: materials.tags,
        moduleId: modules.id,
        moduleTitle: modules.title,
        courseId: courses.id,
        courseTitle: courses.title,
      })
      .from(favorites)
      .innerJoin(materials, eq(favorites.materialId, materials.id))
      .innerJoin(modules, eq(materials.moduleId, modules.id))
      .innerJoin(courses, eq(modules.courseId, courses.id))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt)),
  ]);

  return {
    courses: courseRows.map((course) => ({
      ...course,
      createdAt: toIsoString(course.createdAt),
    })),
    favorites: favoriteRows,
  };
}
