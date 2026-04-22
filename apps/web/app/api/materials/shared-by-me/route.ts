import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { materials, sharedMaterials, users, modules, courses } from "../../../../../../drizzle/schema";
import { requireAuth } from "../../../../lib/api-utils";
import { eq, desc } from "drizzle-orm";

function toIsoString(value: any) {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  try { return new Date(value).toISOString(); } catch { return new Date().toISOString(); }
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  try {
    const rows = await db
      .select({
        materialId: materials.id,
        materialTitle: materials.title,
        materialType: materials.materialType,
        sharedAt: sharedMaterials.createdAt,
        recipientEmail: users.email,
        recipientName: users.name,
        moduleTitle: modules.title,
        courseTitle: courses.title,
      })
      .from(sharedMaterials)
      .innerJoin(materials, eq(sharedMaterials.materialId, materials.id))
      .innerJoin(users, eq(sharedMaterials.sharedWithUserId, users.id))
      .innerJoin(modules, eq(materials.moduleId, modules.id))
      .innerJoin(courses, eq(modules.courseId, courses.id))
      .where(eq(sharedMaterials.sharedByUserId, auth.user.sub))
      .orderBy(desc(sharedMaterials.createdAt));

    const formatted = rows.map((r) => ({
      materialId: r.materialId,
      materialTitle: r.materialTitle,
      materialType: r.materialType,
      sharedAt: toIsoString(r.sharedAt),
      sharedWith: { email: r.recipientEmail, name: r.recipientName },
      context: `${r.courseTitle} / ${r.moduleTitle}`,
    }));

    return NextResponse.json({ sharedByMe: formatted });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}
