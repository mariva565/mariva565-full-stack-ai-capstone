import { count, desc, eq } from "drizzle-orm";
import { courses, modules, materials } from "../../../drizzle/schema";
import type { DashboardData } from "../components/dashboard/types";
import { db } from "./db";
import { getFavoriteItems } from "./favorites-data";

function toIsoString(value: Date | string) {
  return typeof value === "string" ? value : value.toISOString();
}

export async function getDashboardData(userId: number): Promise<DashboardData> {
  const [courseRows, favoriteRows, moduleCountRow, materialCountRow] = await Promise.all([
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
    getFavoriteItems(userId),
    db.select({ count: count() }).from(modules).where(eq(modules.createdBy, userId)),
    db.select({ count: count() }).from(materials).where(eq(materials.createdBy, userId)),
  ]);

  return {
    courses: courseRows.map((course) => ({
      ...course,
      createdAt: toIsoString(course.createdAt),
    })),
    favorites: favoriteRows,
    moduleCount: moduleCountRow[0]?.count ?? 0,
    materialCount: materialCountRow[0]?.count ?? 0,
  };
}
