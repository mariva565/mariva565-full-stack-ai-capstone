import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { materials } from "../../../../../../drizzle/schema";
import { requireAuth } from "../../../../lib/api-utils";
import { logActivity } from "../../../../lib/activity";
import { eq, and } from "drizzle-orm";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/materials/:id
export async function GET(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const [material] = await db
    .select()
    .from(materials)
    .where(eq(materials.id, Number(id)))
    .limit(1);

  if (!material) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Material not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ material });
}

// PUT /api/materials/:id
export async function PUT(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json();
  const { title, content, materialType, fileUrl, tags } = body;

  const [updated] = await db
    .update(materials)
    .set({
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(materialType !== undefined && { materialType }),
      ...(fileUrl !== undefined && { fileUrl }),
      ...(tags !== undefined && { tags }),
    })
    .where(
      and(eq(materials.id, Number(id)), eq(materials.createdBy, auth.user.sub))
    )
    .returning();

  if (!updated) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Material not found or not yours" },
      { status: 404 }
    );
  }

  await logActivity(auth.user.sub, "update_material", updated.id);

  return NextResponse.json({ material: updated });
}

// DELETE /api/materials/:id
export async function DELETE(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const [deleted] = await db
    .delete(materials)
    .where(
      and(eq(materials.id, Number(id)), eq(materials.createdBy, auth.user.sub))
    )
    .returning({ id: materials.id });

  if (!deleted) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Material not found or not yours" },
      { status: 404 }
    );
  }

  await logActivity(auth.user.sub, "delete_material", deleted.id);

  return NextResponse.json({ message: "Material deleted" });
}
