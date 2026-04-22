import { count, desc, eq } from "drizzle-orm";
import { courses, modules, materials, sharedMaterials, users } from "../../../drizzle/schema";
import type { DashboardData } from "../components/dashboard/types";
import { db } from "./db";
import { getFavoriteItems } from "./favorites-data";

function toIsoString(value: any) {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  try {
    return new Date(value).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

export async function getDashboardData(userId: number): Promise<DashboardData> {
  const [courseRows, favoriteRows, moduleCountRow, materialCountRow, sharedRecords] = await Promise.all([
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
    db
      .select({
        id: materials.id,
        title: materials.title,
        materialType: materials.materialType,
        fileUrl: materials.fileUrl,
        createdAt: materials.createdAt,
        sharedAt: sharedMaterials.createdAt,
        sharedByEmail: users.email,
        sharedByName: users.name,
        moduleTitle: modules.title,
        courseTitle: courses.title,
        content: materials.content, // For snippets
      })
      .from(sharedMaterials)
      .innerJoin(materials, eq(sharedMaterials.materialId, materials.id))
      .innerJoin(users, eq(sharedMaterials.sharedByUserId, users.id))
      .innerJoin(modules, eq(materials.moduleId, modules.id))
      .innerJoin(courses, eq(modules.courseId, courses.id))
      .where(eq(sharedMaterials.sharedWithUserId, userId))
      .orderBy(desc(sharedMaterials.createdAt)),
  ]);

  const formattedShared = sharedRecords.map((r) => ({
    id: r.id,
    title: r.title,
    materialType: r.materialType,
    fileUrl: r.fileUrl,
    createdAt: toIsoString(r.createdAt),
    sharedAt: toIsoString(r.sharedAt),
    sharedBy: {
      email: r.sharedByEmail,
      name: r.sharedByName,
    },
    context: `${r.courseTitle} / ${r.moduleTitle}`,
    snippet:
      r.content
        ? r.content.length > 80
          ? r.content.substring(0, 80) + "..."
          : r.content
        : null,
  }));

  return {
    courses: courseRows.map((course) => ({
      ...course,
      createdAt: toIsoString(course.createdAt),
    })),
    favorites: favoriteRows,
    shared: formattedShared,
    moduleCount: moduleCountRow[0]?.count ?? 0,
    materialCount: materialCountRow[0]?.count ?? 0,
  };
}
