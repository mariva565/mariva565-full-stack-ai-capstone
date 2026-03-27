import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { courses } from "../../../../../drizzle/schema";
import { requireAuth } from "../../../lib/api-utils";
import { logActivity } from "../../../lib/activity";
import { desc, eq } from "drizzle-orm";

// GET /api/courses — list all courses for the user
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const rows = await db
    .select()
    .from(courses)
    .where(eq(courses.createdBy, auth.user.sub))
    .orderBy(desc(courses.createdAt));

  return NextResponse.json({ courses: rows });
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
