import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { courses } from "../../../../../../drizzle/schema";
import { requireAuth } from "../../../../lib/api-utils";
import { logActivity } from "../../../../lib/activity";
import { eq, and } from "drizzle-orm";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/courses/:id
export async function GET(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, Number(id)))
    .limit(1);

  if (!course) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Course not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ course });
}

// PUT /api/courses/:id
export async function PUT(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json();
  const { title, description, isPublic, status } = body;

  const [updated] = await db
    .update(courses)
    .set({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(isPublic !== undefined && { isPublic }),
      ...(status !== undefined && { status }),
    })
    .where(and(eq(courses.id, Number(id)), eq(courses.createdBy, auth.user.sub)))
    .returning();

  if (!updated) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Course not found or not yours" },
      { status: 404 }
    );
  }

  await logActivity(auth.user.sub, "update_course", updated.id);

  return NextResponse.json({ course: updated });
}

// DELETE /api/courses/:id
export async function DELETE(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const [deleted] = await db
    .delete(courses)
    .where(and(eq(courses.id, Number(id)), eq(courses.createdBy, auth.user.sub)))
    .returning({ id: courses.id });

  if (!deleted) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Course not found or not yours" },
      { status: 404 }
    );
  }

  await logActivity(auth.user.sub, "delete_course", deleted.id);

  return NextResponse.json({ message: "Course deleted" });
}
