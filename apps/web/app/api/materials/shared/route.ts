import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { materials, sharedMaterials, users, modules, courses } from "../../../../../../drizzle/schema";
import { requireAuth } from "../../../../lib/api-utils";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const sharedRecords = await db
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
    .where(eq(sharedMaterials.sharedWithUserId, auth.user.sub))
    .orderBy(desc(sharedMaterials.createdAt));

  const formatted = sharedRecords.map((r) => ({
    id: r.id,
    title: r.title,
    materialType: r.materialType,
    fileUrl: r.fileUrl,
    createdAt: r.createdAt.toISOString(),
    sharedAt: r.sharedAt.toISOString(),
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

  return NextResponse.json({ shared: formatted });
}
