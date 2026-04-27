import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { materials } from "../../../../../../../drizzle/schema";
import { requireAuth, requireAdmin } from "../../../../../lib/api-utils";
import { logActivity } from "../../../../../lib/activity";
import { eq } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  const { id } = await params;
  const materialId = parseInt(id, 10);
  if (!Number.isInteger(materialId) || materialId <= 0) {
    return NextResponse.json(
      { code: "INVALID_ID", message: "Invalid material ID" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { title } = body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json(
      { code: "INVALID_TITLE", message: "Title is required" },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(materials)
    .set({ title: title.trim() })
    .where(eq(materials.id, materialId))
    .returning({ id: materials.id, title: materials.title });

  if (!updated) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Material not found" },
      { status: 404 }
    );
  }

  await logActivity(auth.user.sub, "admin_edit_material", materialId, { title: updated.title });

  return NextResponse.json({ material: updated });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  const { id } = await params;
  const materialId = parseInt(id, 10);
  if (!Number.isInteger(materialId) || materialId <= 0) {
    return NextResponse.json(
      { code: "INVALID_ID", message: "Invalid material ID" },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select({ id: materials.id, title: materials.title })
    .from(materials)
    .where(eq(materials.id, materialId))
    .limit(1);

  if (!existing) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Material not found" },
      { status: 404 }
    );
  }

  await db.delete(materials).where(eq(materials.id, materialId));

  await logActivity(auth.user.sub, "admin_delete_material", materialId, {
    title: existing.title,
  });

  return NextResponse.json({ message: "Material deleted" });
}
