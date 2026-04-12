import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { courseMembers, users, courses } from "../../../../../../drizzle/schema";
import { requireAuth, requireAdmin } from "../../../../lib/api-utils";
import { logActivity } from "../../../../lib/activity";
import { and, eq } from "drizzle-orm";

// GET /api/admin/members — list all memberships (optionally filter by courseId)
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  const { searchParams } = new URL(request.url);
  const courseIdParam = searchParams.get("courseId");

  let query = db
    .select({
      id: courseMembers.id,
      courseId: courseMembers.courseId,
      courseTitle: courses.title,
      userId: courseMembers.userId,
      userName: users.name,
      userEmail: users.email,
      role: courseMembers.role,
      joinedAt: courseMembers.joinedAt,
    })
    .from(courseMembers)
    .innerJoin(courses, eq(courseMembers.courseId, courses.id))
    .innerJoin(users, eq(courseMembers.userId, users.id))
    .$dynamic();

  if (courseIdParam) {
    const courseId = parseInt(courseIdParam, 10);
    if (!isNaN(courseId)) {
      query = query.where(eq(courseMembers.courseId, courseId));
    }
  }

  const members = await query;
  return NextResponse.json({ members });
}

// POST /api/admin/members — add membership
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  const body = await request.json();
  const { courseId, userId, role = "student" } = body;

  if (!courseId || !userId) {
    return NextResponse.json({ code: "MISSING_FIELDS", message: "courseId and userId are required" }, { status: 400 });
  }

  if (!["student", "mentor"].includes(role)) {
    return NextResponse.json({ code: "INVALID_ROLE", message: "Role must be 'student' or 'mentor'" }, { status: 400 });
  }

  // Upsert
  const [existing] = await db
    .select({ id: courseMembers.id })
    .from(courseMembers)
    .where(and(eq(courseMembers.courseId, courseId), eq(courseMembers.userId, userId)))
    .limit(1);

  if (existing) {
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
