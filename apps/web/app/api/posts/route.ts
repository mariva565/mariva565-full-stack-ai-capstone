import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { posts, users, courses, postLikes, postBookmarks, comments } from "../../../../../drizzle/schema";
import { requireAuth } from "../../../lib/api-utils";
import { logActivity } from "../../../lib/activity";
import { desc, eq, and, ilike, or, sql, inArray } from "drizzle-orm";

// GET /api/posts — list posts (filters: type, courseId, status, search, pinned)
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const postType = searchParams.get("type");
  const courseId = searchParams.get("courseId");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  // Build conditions — only show approved posts (or own posts)
  const conditions = [
    or(
      eq(posts.status, "approved"),
      eq(posts.authorId, auth.user.sub)
    )!,
  ];
  if (postType) conditions.push(eq(posts.postType, postType));
  if (courseId) conditions.push(eq(posts.courseId, parseInt(courseId, 10)));
  if (search) {
    conditions.push(
      or(
        ilike(posts.title, `%${search}%`),
        ilike(posts.content, `%${search}%`)
      )!
    );
  }

  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      postType: posts.postType,
      status: posts.status,
      isPinned: posts.isPinned,
      questionStatus: posts.questionStatus,
      courseId: posts.courseId,
      courseTitle: courses.title,
      authorId: posts.authorId,
      authorName: users.name,
      authorAvatarUrl: users.avatarUrl,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      likeCount: sql<number>`(SELECT COUNT(*) FROM post_likes WHERE post_id = ${posts.id})`.mapWith(Number),
      commentCount: sql<number>`(SELECT COUNT(*) FROM comments WHERE post_id = ${posts.id})`.mapWith(Number),
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .leftJoin(courses, eq(posts.courseId, courses.id))
    .where(and(...conditions))
    .orderBy(desc(posts.isPinned), desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  // Attach like/bookmark state for current user
  const postIds = rows.map((r) => r.id);
  const [likedRows, bookmarkedRows] = postIds.length > 0
    ? await Promise.all([
        db.select({ postId: postLikes.postId }).from(postLikes)
          .where(and(eq(postLikes.userId, auth.user.sub), inArray(postLikes.postId, postIds))),
        db.select({ postId: postBookmarks.postId }).from(postBookmarks)
          .where(and(eq(postBookmarks.userId, auth.user.sub), inArray(postBookmarks.postId, postIds))),
      ])
    : [[], []];

  const likedSet = new Set(likedRows.map((r) => r.postId));
  const bookmarkedSet = new Set(bookmarkedRows.map((r) => r.postId));

  const result = rows.map((r) => ({
    ...r,
    isLiked: likedSet.has(r.id),
    isBookmarked: bookmarkedSet.has(r.id),
  }));

  return NextResponse.json({ posts: result, page, hasMore: rows.length === limit });
}

// POST /api/posts — create post
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const { title, content, postType, courseId } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { code: "MISSING_FIELDS", message: "Title and content are required" },
        { status: 400 }
      );
    }

    const validTypes = ["discussion", "question", "resource", "article"] as const;
    const normalizedPostType = typeof postType === "string" ? postType : "discussion";
    if (!validTypes.includes(normalizedPostType as (typeof validTypes)[number])) {
      return NextResponse.json(
        { code: "INVALID_TYPE", message: "Invalid post type" },
        { status: 400 }
      );
    }

    let normalizedCourseId: number | null = null;
    if (courseId !== undefined && courseId !== null && String(courseId).trim() !== "") {
      const parsedCourseId = Number(courseId);
      if (!Number.isInteger(parsedCourseId) || parsedCourseId <= 0) {
        return NextResponse.json(
          { code: "INVALID_COURSE", message: "Invalid course selection" },
          { status: 400 }
        );
      }

      const [course] = await db
        .select({ id: courses.id })
        .from(courses)
        .where(eq(courses.id, parsedCourseId))
        .limit(1);

      if (!course) {
        return NextResponse.json(
          { code: "INVALID_COURSE", message: "Course not found" },
          { status: 400 }
        );
      }

      normalizedCourseId = parsedCourseId;
    }

    const [post] = await db
      .insert(posts)
      .values({
        authorId: auth.user.sub,
        title: title.trim(),
        content: content.trim(),
        postType: normalizedPostType,
        status: "approved",
        courseId: normalizedCourseId,
        questionStatus: normalizedPostType === "question" ? "open" : null,
      })
      .returning();

    await logActivity(auth.user.sub, "create_post", post.id, {
      title: post.title,
      postType: post.postType,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json(
      { code: "POST_CREATE_FAILED", message: "Failed to create post" },
      { status: 500 }
    );
  }
}
