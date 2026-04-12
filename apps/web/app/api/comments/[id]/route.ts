import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { comments } from "../../../../../../drizzle/schema";
import { requireAuth } from "../../../../lib/api-utils";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

// DELETE /api/comments/:id — delete comment (author or admin)
export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const commentId = parseInt(id, 10);

  const [comment] = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1);
  if (!comment) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Comment not found" }, { status: 404 });
  }
  if (comment.authorId !== auth.user.sub && auth.user.role !== "admin") {
    return NextResponse.json({ code: "FORBIDDEN", message: "Not your comment" }, { status: 403 });
  }

  await db.delete(comments).where(eq(comments.id, commentId));
  return NextResponse.json({ ok: true });
}
