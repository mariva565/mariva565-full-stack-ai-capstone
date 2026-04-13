import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { postLikes, posts } from "../../../../../../../drizzle/schema";
import { requireAuth } from "../../../../../lib/api-utils";
import { canUserAccessPost } from "../../../../../lib/post-access";
import { and, eq } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

// POST /api/posts/:id/like — toggle like
export async function POST(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const postId = parseInt(id, 10);

  const [post] = await db
    .select({
      id: posts.id,
      authorId: posts.authorId,
      status: posts.status,
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

  const [existing] = await db
    .select({ id: postLikes.id })
    .from(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, auth.user.sub)))
    .limit(1);

  if (existing) {
    await db.delete(postLikes).where(eq(postLikes.id, existing.id));
    return NextResponse.json({ liked: false });
  }

  await db.insert(postLikes).values({ postId, userId: auth.user.sub });
  return NextResponse.json({ liked: true });
}
