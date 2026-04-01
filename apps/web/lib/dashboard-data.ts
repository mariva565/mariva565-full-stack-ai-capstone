import { asc, desc, eq } from "drizzle-orm";
import {
  courses,
  events,
  favorites,
  materials,
  milestones,
  modules,
} from "../../../drizzle/schema";
import { db } from "./db";

export async function getDashboardData(userId: number) {
  const [courseRows, favoriteRows, milestoneRows, eventRows] = await Promise.all([
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
    db
      .select()
      .from(milestones)
      .where(eq(milestones.userId, userId))
      .orderBy(asc(milestones.orderIndex)),
    db
      .select()
      .from(events)
      .where(eq(events.userId, userId))
      .orderBy(asc(events.date)),
  ]);

  return {
    courses: courseRows,
    favorites: favoriteRows,
    milestones: milestoneRows,
    events: eventRows,
  };
}
