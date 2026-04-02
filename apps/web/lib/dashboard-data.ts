import { desc, eq } from "drizzle-orm";
import {
  courses,
  favorites,
  materials,
  modules,
} from "../../../drizzle/schema";
import { db } from "./db";

export async function getDashboardData(userId: number) {
  const [courseRows, favoriteRows] = await Promise.all([
    db
      .select()
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
    courses: courseRows,
    favorites: favoriteRows,
  };
}
