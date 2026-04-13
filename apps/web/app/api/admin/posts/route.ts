import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { posts, users, courses } from "../../../../../../drizzle/schema";
import { requireAuth, requireMentor } from "../../../../lib/api-utils";
import { getMentoredCourseIds } from "../../../../lib/post-access";
import { and, desc, eq, inArray, sql } from "drizzle-orm";

// GET /api/admin/posts — all posts for moderation
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;
  const mentorErr = requireMentor(auth.user);
  if (mentorErr) return mentorErr;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const validStatuses = ["pending", "approved", "hidden"];
  const normalizedStatus =
    status && validStatuses.includes(status) ? status : null;
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = 30;
  const offset = (page - 1) * limit;

  if (auth.user.role === "mentor") {
    const mentorCourseIds = await getMentoredCourseIds(auth.user.sub);
    if (mentorCourseIds.length === 0) {
      return NextResponse.json({ posts: [], page, hasMore: false });
    }

    const mentorScope = inArray(posts.courseId, mentorCourseIds);
    const whereClause = normalizedStatus
      ? and(eq(posts.status, normalizedStatus), mentorScope)
      : mentorScope;

    const rows = await db
      .select({
        id: posts.id,
        title: posts.title,
        postType: posts.postType,
        status: posts.status,
        isPinned: posts.isPinned,
        questionStatus: posts.questionStatus,
        courseId: posts.courseId,
        courseTitle: courses.title,
        authorId: posts.authorId,
        authorName: users.name,
        createdAt: posts.createdAt,
        likeCount: sql<number>`(SELECT COUNT(*) FROM post_likes WHERE post_id = ${posts.id})`.mapWith(Number),
        commentCount: sql<number>`(SELECT COUNT(*) FROM comments WHERE post_id = ${posts.id})`.mapWith(Number),
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(courses, eq(posts.courseId, courses.id))
      .where(whereClause)
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ posts: rows, page, hasMore: rows.length === limit });
  }

  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      postType: posts.postType,
      status: posts.status,
      isPinned: posts.isPinned,
      questionStatus: posts.questionStatus,
      courseId: posts.courseId,
      courseTitle: courses.title,
      authorId: posts.authorId,
      authorName: users.name,
      createdAt: posts.createdAt,
      likeCount: sql<number>`(SELECT COUNT(*) FROM post_likes WHERE post_id = ${posts.id})`.mapWith(Number),
      commentCount: sql<number>`(SELECT COUNT(*) FROM comments WHERE post_id = ${posts.id})`.mapWith(Number),
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .leftJoin(courses, eq(posts.courseId, courses.id))
    .where(normalizedStatus ? eq(posts.status, normalizedStatus) : undefined)
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({ posts: rows, page, hasMore: rows.length === limit });
}
