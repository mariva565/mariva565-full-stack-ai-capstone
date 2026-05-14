import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { courseMembers, courses } from "../../../../../drizzle/schema";
import { requireAuth } from "../../../lib/api-utils";
import { logActivity } from "../../../lib/activity";
import { buildPageMeta, normalizeSearch, readPaginationParams } from "../../../lib/pagination";
import { desc, eq, inArray, or, ilike, count } from "drizzle-orm";
import { combineConditions } from "../../../lib/query-conditions";

// GET /api/courses — list all courses for the user
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const { page, limit, offset } = readPaginationParams(searchParams, {
    defaultLimit: 50,
    maxLimit: 100,
  });
  const search = normalizeSearch(searchParams.get("search"));

  const memberships = await db
    .select({ courseId: courseMembers.courseId })
    .from(courseMembers)
    .where(eq(courseMembers.userId, auth.user.sub));

  const memberCourseIds = memberships.map((membership) => membership.courseId);
  const condition =
    memberCourseIds.length > 0
      ? or(
          eq(courses.createdBy, auth.user.sub),
          inArray(courses.id, memberCourseIds)
        )
      : eq(courses.createdBy, auth.user.sub);

  const where = combineConditions([
    condition,
    search
      ? or(
          ilike(courses.title, `%${search}%`),
          ilike(courses.description, `%${search}%`)
        )
      : undefined,
  ]);

  const [rows, [totalRow]] = await Promise.all([
    db
      .select()
      .from(courses)
      .where(where)
      .orderBy(desc(courses.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(courses).where(where),
  ]);

  return NextResponse.json({
    courses: rows,
    ...buildPageMeta(page, limit, totalRow.value),
  });
}

// POST /api/courses — create a new course
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const { title, description } = body;

  if (!title) {
    return NextResponse.json(
      { code: "MISSING_TITLE", message: "Title is required" },
      { status: 400 }
    );
  }

  const [course] = await db
    .insert(courses)
    .values({
      title,
      description: description || null,
      createdBy: auth.user.sub,
    })
    .returning();

  await logActivity(auth.user.sub, "create_course", course.id, { title: course.title });

  return NextResponse.json({ course }, { status: 201 });
}
