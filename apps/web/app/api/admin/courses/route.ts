import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { courses, users } from "../../../../../../drizzle/schema";
import { requireAuth, requireAdmin } from "../../../../lib/api-utils";
import { desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  const allCourses = await db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      isPublic: courses.isPublic,
      status: courses.status,
      createdAt: courses.createdAt,
      authorName: users.name,
      authorEmail: users.email,
    })
    .from(courses)
    .innerJoin(users, eq(courses.createdBy, users.id))
    .orderBy(desc(courses.createdAt));

  return NextResponse.json({ courses: allCourses });
}
