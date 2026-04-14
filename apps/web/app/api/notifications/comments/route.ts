import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { comments, posts, users } from "../../../../../../drizzle/schema";
import { requireAuth } from "../../../../lib/api-utils";
import { eq, gt, and, ne } from "drizzle-orm";

// GET /api/notifications/comments?since=<ISO timestamp>
// Returns comments on the current user's approved posts made after `since`,
// excluding comments the user wrote themselves.
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const sinceParam = new URL(request.url).searchParams.get("since");
  const since = sinceParam ? new Date(sinceParam) : new Date(Date.now() - 60_000);

  if (isNaN(since.getTime())) {
    return NextResponse.json({ code: "INVALID_SINCE", message: "Invalid since parameter." }, { status: 400 });
  }

  const rows = await db
    .select({
      commentId: comments.id,
      postId: posts.id,
      postTitle: posts.title,
      authorName: users.name,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .innerJoin(posts, eq(comments.postId, posts.id))
    .innerJoin(users, eq(comments.authorId, users.id))
    .where(
      and(
        eq(posts.authorId, auth.user.sub),      // only user's own posts
        eq(posts.status, "approved"),            // only visible posts
        ne(comments.authorId, auth.user.sub),   // not own comments
        gt(comments.createdAt, since),           // newer than since
      )
    )
    .limit(10);

  return NextResponse.json(rows);
}
