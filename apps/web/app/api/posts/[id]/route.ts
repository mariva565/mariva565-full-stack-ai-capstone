import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { posts, users, courses, comments, postLikes, postBookmarks } from "../../../../../../drizzle/schema";
import { requireAuth } from "../../../../lib/api-utils";
import { logActivity } from "../../../../lib/activity";
import { canUserAccessPost } from "../../../../lib/post-access";
import {
  hasMeaningfulPostHtmlContent,
  sanitizePostHtml,
} from "../../../../lib/post-html";
import { eq, and, desc, sql } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

// GET /api/posts/:id — post details + comments + like/bookmark state
export async function GET(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const postId = parseInt(id, 10);

  const [row] = await db
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
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .leftJoin(courses, eq(posts.courseId, courses.id))
    .where(eq(posts.id, postId))
    .limit(1);

  if (!row) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Post not found" }, { status: 404 });
  }

  const canAccessPost = await canUserAccessPost(auth.user, {
    authorId: row.authorId,
    status: row.status,
    courseId: row.courseId,
  });
  if (!canAccessPost) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Post not found" }, { status: 404 });
  }

  // Fetch comments with author info
  const commentRows = await db
    .select({
      id: comments.id,
      content: comments.content,
      authorId: comments.authorId,
      authorName: users.name,
      authorAvatarUrl: users.avatarUrl,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.postId, postId))
    .orderBy(desc(comments.createdAt));

  // Like / bookmark state
  const [[likeRow], [bookmarkRow]] = await Promise.all([
    db.select({ id: postLikes.id }).from(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, auth.user.sub))).limit(1),
    db.select({ id: postBookmarks.id }).from(postBookmarks)
      .where(and(eq(postBookmarks.postId, postId), eq(postBookmarks.userId, auth.user.sub))).limit(1),
  ]);

  return NextResponse.json({
    post: { ...row, isLiked: !!likeRow, isBookmarked: !!bookmarkRow },
    comments: commentRows,
  });
}

// PUT /api/posts/:id — edit post (author only)
export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const postId = parseInt(id, 10);

  const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  if (!post) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Post not found" }, { status: 404 });
  }
  if (post.authorId !== auth.user.sub && auth.user.role !== "admin") {
    return NextResponse.json({ code: "FORBIDDEN", message: "Not your post" }, { status: 403 });
  }

  const body = await request.json();
  const { title, content, postType, courseId } = body;
  const hasTitle = typeof title === "string";
  const hasContent = typeof content === "string";
  const normalizedTitle = hasTitle ? title.trim() : "";
  const normalizedContent = hasContent ? sanitizePostHtml(content) : "";

  if (hasTitle && !normalizedTitle) {
    return NextResponse.json(
      { code: "MISSING_TITLE", message: "Title is required" },
      { status: 400 }
    );
  }

  if (hasContent && !hasMeaningfulPostHtmlContent(normalizedContent)) {
    return NextResponse.json(
      { code: "MISSING_CONTENT", message: "Content is required" },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(posts)
    .set({
      ...(hasTitle ? { title: normalizedTitle } : {}),
      ...(hasContent ? { content: normalizedContent } : {}),
      ...(postType ? { postType } : {}),
      ...(courseId !== undefined ? { courseId: courseId ? parseInt(courseId, 10) : null } : {}),
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId))
    .returning();

  return NextResponse.json({ post: updated });
}

// DELETE /api/posts/:id — delete post (author or admin)
export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const postId = parseInt(id, 10);

  const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  if (!post) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Post not found" }, { status: 404 });
  }
  if (post.authorId !== auth.user.sub && auth.user.role !== "admin") {
    return NextResponse.json({ code: "FORBIDDEN", message: "Not your post" }, { status: 403 });
  }

  await db.delete(posts).where(eq(posts.id, postId));
  await logActivity(auth.user.sub, "delete_post", postId, { title: post.title });

  return NextResponse.json({ ok: true });
}
