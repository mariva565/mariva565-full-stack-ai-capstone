import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { posts, users, courses } from "../../../../../../drizzle/schema";
import { requireAuth, requireAdmin } from "../../../../lib/api-utils";
import { desc, eq, sql } from "drizzle-orm";

// GET /api/admin/posts — all posts for moderation
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;
  const adminErr = requireAdmin(auth.user);
  if (adminErr) return adminErr;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status"); // 'pending' | 'approved' | 'hidden' | null
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = 30;
  const offset = (page - 1) * limit;

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
    .where(status ? eq(posts.status, status) : undefined)
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({ posts: rows, page, hasMore: rows.length === limit });
}
