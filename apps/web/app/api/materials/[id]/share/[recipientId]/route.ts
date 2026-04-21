import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../../lib/db";
import { materials, sharedMaterials } from "../../../../../../../../drizzle/schema";
import { requireAuth } from "../../../../../../lib/api-utils";
import { eq, and } from "drizzle-orm";
import { logActivity } from "../../../../../../lib/activity";

type Ctx = { params: Promise<{ id: string; recipientId: string }> };

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id, recipientId } = await params;
  const materialId = Number(id);
  const targetUserId = Number(recipientId);

  if (
    !Number.isFinite(materialId) ||
    materialId <= 0 ||
    !Number.isFinite(targetUserId) ||
    targetUserId <= 0
  ) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "Invalid parameters" },
      { status: 400 }
    );
  }

  const [material] = await db
    .select()
    .from(materials)
    .where(eq(materials.id, materialId));

  if (!material) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Material not found" },
      { status: 404 }
    );
  }

  if (material.createdBy !== auth.user.sub) {
    return NextResponse.json(
      { code: "FORBIDDEN", message: "Only owner can unshare" },
      { status: 403 }
    );
  }

  const [deletedShare] = await db
    .delete(sharedMaterials)
    .where(
      and(
        eq(sharedMaterials.materialId, materialId),
        eq(sharedMaterials.sharedWithUserId, targetUserId)
      )
    )
    .returning();

  if (deletedShare) {
    await logActivity(auth.user.sub, "unshare_material", materialId, {
      recipientId: targetUserId,
      materialTitle: material.title,
    });
  }

  return NextResponse.json({ success: true });
}
