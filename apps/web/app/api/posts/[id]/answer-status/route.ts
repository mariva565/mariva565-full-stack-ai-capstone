import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { posts, courseMembers } from "../../../../../../../drizzle/schema";
import { requireAuth } from "../../../../../lib/api-utils";
import { eq, and } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

// PUT /api/posts/:id/answer-status
// Allows a mentor (of the post's course) or admin to change question_status.
export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const postId = parseInt(id, 10);

  const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  if (!post) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Post not found" }, { status: 404 });
  }
  if (post.postType !== "question") {
    return NextResponse.json({ code: "INVALID", message: "Not a question post" }, { status: 400 });
  }

  // Check authorization: admin always allowed; mentor only if they mentor the course
  if (auth.user.role !== "admin") {
    if (auth.user.role !== "mentor") {
      return NextResponse.json({ code: "FORBIDDEN", message: "Mentor or admin only" }, { status: 403 });
    }
    if (post.courseId) {
      const [membership] = await db
        .select()
        .from(courseMembers)
        .where(
          and(
            eq(courseMembers.userId, auth.user.sub),
            eq(courseMembers.courseId, post.courseId),
            eq(courseMembers.role, "mentor")
          )
        )
        .limit(1);
      if (!membership) {
        return NextResponse.json({ code: "FORBIDDEN", message: "You are not a mentor of this course" }, { status: 403 });
      }
    }
  }

  const { questionStatus } = await request.json();
  const valid = ["open", "answered", "closed"];
  if (!valid.includes(questionStatus)) {
    return NextResponse.json({ code: "INVALID", message: "Invalid status" }, { status: 400 });
  }

  const [updated] = await db
    .update(posts)
    .set({ questionStatus, updatedAt: new Date() })
    .where(eq(posts.id, postId))
    .returning();

  return NextResponse.json({ post: updated });
}
