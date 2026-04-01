import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { materials } from "../../../../../../../drizzle/schema";
import { requireAuth } from "../../../../../lib/api-utils";
import { logActivity } from "../../../../../lib/activity";
import { normalizeMaterialType, resolveMaterialTitle } from "../../../../../lib/materials";
import { eq, desc } from "drizzle-orm";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/modules/:id/materials
export async function GET(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const rows = await db
    .select()
    .from(materials)
    .where(eq(materials.moduleId, Number(id)))
    .orderBy(desc(materials.createdAt));

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
