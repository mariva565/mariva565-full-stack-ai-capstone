import { desc, eq } from "drizzle-orm";
import { courses } from "../../../drizzle/schema";
import type { DashboardData } from "../components/dashboard/types";
import { db } from "./db";
import { getFavoriteItems } from "./favorites-data";

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
    getFavoriteItems(userId),
  ]);

  return {
    courses: courseRows.map((course) => ({
      ...course,
      createdAt: toIsoString(course.createdAt),
    })),
    favorites: favoriteRows,
  };
}
