import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { courseMembers } from "../../../../../../../drizzle/schema";
import { requireAuth, requireAdmin } from "../../../../../lib/api-utils";
import { logActivity } from "../../../../../lib/activity";
import { eq } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

// DELETE /api/admin/members/:id — remove membership by membership id
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  const { id } = await params;
  const membershipId = parseInt(id, 10);
  if (!Number.isInteger(membershipId) || membershipId <= 0) {
    return NextResponse.json({ code: "INVALID_ID", message: "Invalid membership ID" }, { status: 400 });
  }

  const [existing] = await db
    .select({ id: courseMembers.id, courseId: courseMembers.courseId, userId: courseMembers.userId })
    .from(courseMembers)
    .where(eq(courseMembers.id, membershipId))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Membership not found" }, { status: 404 });
  }

  await db.delete(courseMembers).where(eq(courseMembers.id, membershipId));
  await logActivity(auth.user.sub, "remove_course_member", existing.courseId, { userId: existing.userId });

  return NextResponse.json({ message: "Membership removed" });
}

// PUT /api/admin/members/:id — change role by membership id
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  const { id } = await params;
  const membershipId = parseInt(id, 10);
  if (!Number.isInteger(membershipId) || membershipId <= 0) {
    return NextResponse.json({ code: "INVALID_ID", message: "Invalid membership ID" }, { status: 400 });
  }

  const body = await request.json();
  const { role } = body;

  if (!["student", "mentor"].includes(role)) {
    return NextResponse.json({ code: "INVALID_ROLE", message: "Role must be 'student' or 'mentor'" }, { status: 400 });
  }

  const [updated] = await db
    .update(courseMembers)
    .set({ role })
    .where(eq(courseMembers.id, membershipId))
    .returning();

  if (!updated) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Membership not found" }, { status: 404 });
  }

  await logActivity(auth.user.sub, "update_course_member", updated.courseId, { userId: updated.userId, role });

  return NextResponse.json({ member: updated });
}
