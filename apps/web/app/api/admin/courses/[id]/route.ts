import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { courses } from "../../../../../../../drizzle/schema";
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
  const courseId = parseInt(id, 10);
  if (isNaN(courseId)) {
    return NextResponse.json(
      { code: "INVALID_ID", message: "Invalid course ID" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { title, description } = body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json(
      { code: "INVALID_TITLE", message: "Title is required" },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(courses)
    .set({ title: title.trim(), description: description?.trim() ?? null })
    .where(eq(courses.id, courseId))
    .returning({ id: courses.id, title: courses.title });

  if (!updated) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Course not found" },
      { status: 404 }
    );
  }

  await logActivity(auth.user.sub, "admin_edit_course", courseId, { title: updated.title });

  return NextResponse.json({ course: updated });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  const { id } = await params;
  const courseId = parseInt(id, 10);
  if (isNaN(courseId)) {
    return NextResponse.json(
      { code: "INVALID_ID", message: "Invalid course ID" },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select({ id: courses.id, title: courses.title })
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);

  if (!existing) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Course not found" },
      { status: 404 }
    );
  }

  await db.delete(courses).where(eq(courses.id, courseId));

  await logActivity(auth.user.sub, "admin_delete_course", courseId, {
    title: existing.title,
  });

  return NextResponse.json({ message: "Course deleted" });
}
