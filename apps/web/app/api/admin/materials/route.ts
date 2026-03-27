import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { materials, modules, courses, users } from "../../../../../../drizzle/schema";
import { requireAuth, requireAdmin } from "../../../../lib/api-utils";
import { desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  const allMaterials = await db
    .select({
      id: materials.id,
      title: materials.title,
      materialType: materials.materialType,
      createdAt: materials.createdAt,
      moduleId: materials.moduleId,
      moduleTitle: modules.title,
      courseId: courses.id,
      courseTitle: courses.title,
      authorName: users.name,
      authorEmail: users.email,
    })
    .from(materials)
    .innerJoin(modules, eq(materials.moduleId, modules.id))
    .innerJoin(courses, eq(modules.courseId, courses.id))
    .innerJoin(users, eq(materials.createdBy, users.id))
    .orderBy(desc(materials.createdAt));

  return NextResponse.json({ materials: allMaterials });
}
