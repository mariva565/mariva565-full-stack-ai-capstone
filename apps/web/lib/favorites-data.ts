import { and, desc, eq } from "drizzle-orm";

import { courses, favorites, materials, modules } from "../../../drizzle/schema";
import type { ModuleFavoriteItem } from "../components/modules/types";
import { db } from "./db";

export async function getFavoriteItems(userId: number): Promise<ModuleFavoriteItem[]> {
  return db
    .select({
      id: favorites.id,
      materialId: favorites.materialId,
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
    .orderBy(desc(favorites.createdAt));
}

export async function isMaterialPinned(userId: number, materialId: number): Promise<boolean> {
  const [favorite] = await db
    .select({ id: favorites.id })
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.materialId, materialId)))
    .limit(1);

  return Boolean(favorite);
}
