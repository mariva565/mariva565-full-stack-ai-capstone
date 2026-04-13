import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { postBookmarks, posts } from "../../../../../../../drizzle/schema";
import { requireAuth } from "../../../../../lib/api-utils";
import { canUserAccessPost } from "../../../../../lib/post-access";
import { and, eq } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

// POST /api/posts/:id/bookmark — toggle bookmark
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
    .select({ id: postBookmarks.id })
    .from(postBookmarks)
    .where(and(eq(postBookmarks.postId, postId), eq(postBookmarks.userId, auth.user.sub)))
    .limit(1);

  if (existing) {
    await db.delete(postBookmarks).where(eq(postBookmarks.id, existing.id));
    return NextResponse.json({ bookmarked: false });
  }

  await db.insert(postBookmarks).values({ postId, userId: auth.user.sub });
  return NextResponse.json({ bookmarked: true });
}
