import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { postLikes } from "../../../../../../../drizzle/schema";
import { requireAuth } from "../../../../../lib/api-utils";
import { and, eq } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

// POST /api/posts/:id/like — toggle like
export async function POST(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const postId = parseInt(id, 10);

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
