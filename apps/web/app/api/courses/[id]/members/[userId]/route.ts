import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../../lib/db";
import { courseMembers } from "../../../../../../../../drizzle/schema";
import { requireAuth, requireAdmin } from "../../../../../../lib/api-utils";
import { logActivity } from "../../../../../../lib/activity";
import { and, eq } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string; userId: string }> };

// DELETE /api/courses/:id/members/:userId — remove member (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  const { id, userId } = await params;
  const courseId = parseInt(id, 10);
  const memberId = parseInt(userId, 10);

  if (isNaN(courseId) || isNaN(memberId)) {
    return NextResponse.json({ code: "INVALID_ID", message: "Invalid ID" }, { status: 400 });
  }

  const [existing] = await db
    .select({ id: courseMembers.id })
    .from(courseMembers)
    .where(and(eq(courseMembers.courseId, courseId), eq(courseMembers.userId, memberId)))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Membership not found" }, { status: 404 });
  }

  await db
    .delete(courseMembers)
    .where(and(eq(courseMembers.courseId, courseId), eq(courseMembers.userId, memberId)));

  await logActivity(auth.user.sub, "remove_course_member", courseId, { userId: memberId });

  return NextResponse.json({ message: "Member removed" });
}

// PUT /api/courses/:id/members/:userId — change role (admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  const { id, userId } = await params;
  const courseId = parseInt(id, 10);
  const memberId = parseInt(userId, 10);

  if (isNaN(courseId) || isNaN(memberId)) {
    return NextResponse.json({ code: "INVALID_ID", message: "Invalid ID" }, { status: 400 });
  }

  const body = await request.json();
  const { role } = body;

  if (!["student", "mentor"].includes(role)) {
    return NextResponse.json({ code: "INVALID_ROLE", message: "Role must be 'student' or 'mentor'" }, { status: 400 });
  }

  const [updated] = await db
    .update(courseMembers)
    .set({ role })
    .where(and(eq(courseMembers.courseId, courseId), eq(courseMembers.userId, memberId)))
    .returning();

  if (!updated) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Membership not found" }, { status: 404 });
  }

  await logActivity(auth.user.sub, "update_course_member", courseId, { userId: memberId, role });

  return NextResponse.json({ member: updated });
}
