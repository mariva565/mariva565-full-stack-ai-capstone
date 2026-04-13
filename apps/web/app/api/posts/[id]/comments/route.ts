import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { posts, comments, users } from "../../../../../../../drizzle/schema";
import { requireAuth } from "../../../../../lib/api-utils";
import { logActivity } from "../../../../../lib/activity";
import { canUserAccessPost } from "../../../../../lib/post-access";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

// POST /api/posts/:id/comments — add comment
export async function POST(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const postId = parseInt(id, 10);

  const [post] = await db
    .select({
      id: posts.id,
      status: posts.status,
      authorId: posts.authorId,
      courseId: posts.courseId,
    })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Post not found" }, { status: 404 });
  }

  const canAccessPost = await canUserAccessPost(auth.user, {
    authorId: post.authorId,
    status: post.status,
    courseId: post.courseId,
  });
  if (!canAccessPost) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Post not found" }, { status: 404 });
  }

  const body = await request.json();
  const { content } = body;
  if (!content?.trim()) {
    return NextResponse.json({ code: "MISSING_CONTENT", message: "Content is required" }, { status: 400 });
  }

  const [comment] = await db
    .insert(comments)
    .values({ postId, authorId: auth.user.sub, content: content.trim() })
    .returning();

  // Fetch author info for response
  const [author] = await db
    .select({ name: users.name, avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, auth.user.sub))
    .limit(1);

  await logActivity(auth.user.sub, "add_comment", comment.id, { postId });

  return NextResponse.json(
    { comment: { ...comment, authorName: author?.name, authorAvatarUrl: author?.avatarUrl } },
    { status: 201 }
  );
}
