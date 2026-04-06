import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { modules } from "../../../../../../../drizzle/schema";
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
  const moduleId = parseInt(id, 10);
  if (isNaN(moduleId)) {
    return NextResponse.json(
      { code: "INVALID_ID", message: "Invalid module ID" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { title, orderIndex } = body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json(
      { code: "INVALID_TITLE", message: "Title is required" },
      { status: 400 }
    );
  }

  const setValues: { title: string; orderIndex?: number } = { title: title.trim() };
  if (typeof orderIndex === "number" && orderIndex >= 0) {
    setValues.orderIndex = orderIndex;
  }

  const [updated] = await db
    .update(modules)
    .set(setValues)
    .where(eq(modules.id, moduleId))
    .returning({ id: modules.id, title: modules.title });

  if (!updated) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Module not found" },
      { status: 404 }
    );
  }

  await logActivity(auth.user.sub, "admin_edit_module", moduleId, { title: updated.title });

  return NextResponse.json({ module: updated });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  const { id } = await params;
  const moduleId = parseInt(id, 10);
  if (isNaN(moduleId)) {
    return NextResponse.json(
      { code: "INVALID_ID", message: "Invalid module ID" },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select({ id: modules.id, title: modules.title })
    .from(modules)
    .where(eq(modules.id, moduleId))
    .limit(1);

  if (!existing) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Module not found" },
      { status: 404 }
    );
  }

  await db.delete(modules).where(eq(modules.id, moduleId));

  await logActivity(auth.user.sub, "admin_delete_module", moduleId, {
    title: existing.title,
  });

  return NextResponse.json({ message: "Module deleted" });
}
