import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { materials, modules, courses } from "../../../../../../../drizzle/schema";
import { requireAuth, requireCourseMentor } from "../../../../../lib/api-utils";
import { logActivity } from "../../../../../lib/activity";
import { getModuleMaterials } from "../../../../../lib/module-workspace-data";
import { normalizeMaterialType, resolveMaterialTitle } from "../../../../../lib/materials";
import { eq } from "drizzle-orm";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/modules/:id/materials
export async function GET(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const rows = await getModuleMaterials(Number(id));

  return NextResponse.json({ materials: rows });
}

// POST /api/modules/:id/materials
export async function POST(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json();
  const { title, content, materialType, fileUrl, tags } = body;
  const normalizedMaterialType = normalizeMaterialType(materialType);
  const resolvedTitle = resolveMaterialTitle(title, content, normalizedMaterialType, fileUrl);

  if (!resolvedTitle) {
    return NextResponse.json(
      { code: "MISSING_TITLE", message: "Add a title, some content, or a file/link first" },
      { status: 400 }
    );
  }

  // Verify caller owns the parent course, is a course mentor, or is admin
  const [parent] = await db
    .select({ courseId: courses.id, courseCreatedBy: courses.createdBy })
    .from(modules)
    .innerJoin(courses, eq(modules.courseId, courses.id))
    .where(eq(modules.id, Number(id)))
    .limit(1);

  if (!parent) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Module not found" },
      { status: 404 }
    );
  }

  if (parent.courseCreatedBy !== auth.user.sub && auth.user.role !== "admin") {
    const mentorCheck = await requireCourseMentor(auth.user, parent.courseId);
    if (mentorCheck) return mentorCheck;
  }

  const [material] = await db
    .insert(materials)
    .values({
      moduleId: Number(id),
      title: resolvedTitle,
      content: content || null,
      materialType: normalizedMaterialType,
      fileUrl: fileUrl || null,
      tags: tags || null,
      createdBy: auth.user.sub,
    })
    .returning();

  await logActivity(auth.user.sub, "create_material", material.id, { title: material.title, type: material.materialType });

  return NextResponse.json({ material }, { status: 201 });
}
