import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { materials } from "../../../../../../../drizzle/schema";
import { requireAuth, requireAdmin } from "../../../../../lib/api-utils";
import { logActivity } from "../../../../../lib/activity";
import { eq } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  const { id } = await params;
  const materialId = parseInt(id, 10);
  if (isNaN(materialId)) {
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
