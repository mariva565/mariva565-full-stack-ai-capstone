import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { modules } from "../../../../../../drizzle/schema";
import { requireAuth } from "../../../../lib/api-utils";
import { logActivity } from "../../../../lib/activity";
import { eq, and } from "drizzle-orm";

type Ctx = { params: Promise<{ id: string }> };

// PUT /api/modules/:id
export async function PUT(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json();
  const { title, orderIndex } = body;

  const [updated] = await db
    .update(modules)
    .set({
      ...(title !== undefined && { title }),
      ...(orderIndex !== undefined && { orderIndex }),
    })
    .where(and(eq(modules.id, Number(id)), eq(modules.createdBy, auth.user.sub)))
    .returning();

  if (!updated) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Module not found or not yours" },
      { status: 404 }
    );
  }

  await logActivity(auth.user.sub, "update_module", updated.id);

  return NextResponse.json({ module: updated });
}

// DELETE /api/modules/:id
export async function DELETE(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const [deleted] = await db
    .delete(modules)
    .where(and(eq(modules.id, Number(id)), eq(modules.createdBy, auth.user.sub)))
    .returning({ id: modules.id });

  if (!deleted) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Module not found or not yours" },
      { status: 404 }
    );
  }

  await logActivity(auth.user.sub, "delete_module", deleted.id);

  return NextResponse.json({ message: "Module deleted" });
}
