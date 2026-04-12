import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { posts } from "../../../../../../../drizzle/schema";
import { requireAuth, requireAdmin } from "../../../../../lib/api-utils";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

// PUT /api/admin/posts/:id — change status (approve/hide) or toggle pin
export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;
  const adminErr = requireAdmin(auth.user);
  if (adminErr) return adminErr;

  const { id } = await params;
  const postId = parseInt(id, 10);

  const [post] = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, postId)).limit(1);
  if (!post) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Post not found" }, { status: 404 });
  }

  const body = await request.json();
  const { status, isPinned } = body;

  const validStatuses = ["pending", "approved", "hidden"];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ code: "INVALID_STATUS", message: "Invalid status" }, { status: 400 });
  }

  const [updated] = await db
    .update(posts)
    .set({
      ...(status ? { status } : {}),
      ...(isPinned !== undefined ? { isPinned } : {}),
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId))
    .returning();

  return NextResponse.json({ post: updated });
}

// DELETE /api/admin/posts/:id — hard delete by admin
export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;
  const adminErr = requireAdmin(auth.user);
  if (adminErr) return adminErr;

  const { id } = await params;
  const postId = parseInt(id, 10);

  await db.delete(posts).where(eq(posts.id, postId));
  return NextResponse.json({ ok: true });
}
