import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { courseMembers, users, courses } from "../../../../../../../drizzle/schema";
import { requireAuth, requireAdmin } from "../../../../../lib/api-utils";
import { logActivity } from "../../../../../lib/activity";
import { userCanAccessCourse } from "../../../../../lib/course-details-data";
import { and, eq } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/courses/:id/members — list members (admin, creator, or enrolled member only)
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const courseId = parseInt(id, 10);
  if (!Number.isInteger(courseId) || courseId <= 0) {
    return NextResponse.json({ code: "INVALID_ID", message: "Invalid course ID" }, { status: 400 });
  }

  const hasAccess = await userCanAccessCourse(auth.user, courseId);
  if (!hasAccess) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Course not found" }, { status: 404 });
  }

  const members = await db
    .select({
      id: courseMembers.id,
      userId: courseMembers.userId,
      role: courseMembers.role,
      joinedAt: courseMembers.joinedAt,
      userName: users.name,
      userEmail: users.email,
      userAvatarUrl: users.avatarUrl,
    })
    .from(courseMembers)
    .innerJoin(users, eq(courseMembers.userId, users.id))
    .where(eq(courseMembers.courseId, courseId));

  return NextResponse.json({ members });
}

// POST /api/courses/:id/members — add member (admin only)
export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  const { id } = await params;
  const courseId = parseInt(id, 10);
  if (!Number.isInteger(courseId) || courseId <= 0) {
    return NextResponse.json({ code: "INVALID_ID", message: "Invalid course ID" }, { status: 400 });
  }

  const body = await request.json();
  const { userId, role = "student" } = body;

  if (!userId) {
    return NextResponse.json({ code: "MISSING_FIELDS", message: "userId is required" }, { status: 400 });
  }

  if (!["student", "mentor"].includes(role)) {
    return NextResponse.json({ code: "INVALID_ROLE", message: "Role must be 'student' or 'mentor'" }, { status: 400 });
  }

  const [course] = await db
    .select({ id: courses.id })
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);

  if (!course) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Course not found" }, { status: 404 });
  }

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return NextResponse.json({ code: "NOT_FOUND", message: "User not found" }, { status: 404 });
  }

  // Upsert: if already a member, update role
  const existing = await db
    .select({ id: courseMembers.id })
    .from(courseMembers)
    .where(and(eq(courseMembers.courseId, courseId), eq(courseMembers.userId, userId)))
    .limit(1);

  if (existing.length > 0) {
    const [updated] = await db
      .update(courseMembers)
      .set({ role })
      .where(and(eq(courseMembers.courseId, courseId), eq(courseMembers.userId, userId)))
      .returning();
    await logActivity(auth.user.sub, "update_course_member", courseId, { userId, role });
    return NextResponse.json({ member: updated });
  }

  const [created] = await db
    .insert(courseMembers)
    .values({ courseId, userId, role })
    .returning();

  await logActivity(auth.user.sub, "add_course_member", courseId, { userId, role });

  return NextResponse.json({ member: created }, { status: 201 });
}
