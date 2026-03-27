import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { modules } from "../../../../../../../drizzle/schema";
import { requireAuth } from "../../../../../lib/api-utils";
import { logActivity } from "../../../../../lib/activity";
import { eq, asc } from "drizzle-orm";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/courses/:id/modules
export async function GET(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const rows = await db
    .select()
    .from(modules)
    .where(eq(modules.courseId, Number(id)))
    .orderBy(asc(modules.orderIndex));

  return NextResponse.json({ modules: rows });
}

// POST /api/courses/:id/modules
export async function POST(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json();
  const { title, orderIndex } = body;

  if (!title) {
    return NextResponse.json(
      { code: "MISSING_TITLE", message: "Title is required" },
      { status: 400 }
    );
  }

  const [mod] = await db
    .insert(modules)
    .values({
      courseId: Number(id),
      title,
      orderIndex: orderIndex ?? 0,
      createdBy: auth.user.sub,
    })
    .returning();

  await logActivity(auth.user.sub, "create_module", mod.id);

  return NextResponse.json({ module: mod }, { status: 201 });
}
