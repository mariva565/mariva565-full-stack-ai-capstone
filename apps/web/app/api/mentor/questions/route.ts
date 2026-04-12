import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { posts, users, courses, courseMembers } from "../../../../../../drizzle/schema";
import { requireAuth } from "../../../../lib/api-utils";
import { eq, and, inArray, desc, sql } from "drizzle-orm";

// GET /api/mentor/questions
// Returns all questions (postType='question') from courses where the caller is a mentor.
// Also works for admins (they see all questions).
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  if (auth.user.role !== "mentor" && auth.user.role !== "admin") {
    return NextResponse.json({ code: "FORBIDDEN", message: "Mentor or admin only" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const questionStatus = searchParams.get("status"); // filter: open | answered | closed

  let courseIds: number[] | null = null;

  if (auth.user.role === "mentor") {
    // Get courses this user mentors
    const memberships = await db
      .select({ courseId: courseMembers.courseId })
      .from(courseMembers)
      .where(and(eq(courseMembers.userId, auth.user.sub), eq(courseMembers.role, "mentor")));
    courseIds = memberships.map((m) => m.courseId);
    if (courseIds.length === 0) {
      return NextResponse.json({ questions: [] });
    }
  }

  const conditions = [eq(posts.postType, "question")];
  if (courseIds) conditions.push(inArray(posts.courseId, courseIds));
  if (questionStatus) conditions.push(eq(posts.questionStatus, questionStatus));

  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      status: posts.status,
      questionStatus: posts.questionStatus,
      courseId: posts.courseId,
      courseTitle: courses.title,
      authorId: posts.authorId,
      authorName: users.name,
      authorAvatarUrl: users.avatarUrl,
      createdAt: posts.createdAt,
      likeCount: sql<number>`(SELECT COUNT(*) FROM post_likes WHERE post_id = ${posts.id})`.mapWith(Number),
      commentCount: sql<number>`(SELECT COUNT(*) FROM comments WHERE post_id = ${posts.id})`.mapWith(Number),
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .leftJoin(courses, eq(posts.courseId, courses.id))
    .where(and(...conditions))
    .orderBy(desc(posts.createdAt));

  return NextResponse.json({ questions: rows });
}
