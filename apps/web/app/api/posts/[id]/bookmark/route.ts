import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { postBookmarks } from "../../../../../../../drizzle/schema";
import { requireAuth } from "../../../../../lib/api-utils";
import { and, eq } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

// POST /api/posts/:id/bookmark — toggle bookmark
export async function POST(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const postId = parseInt(id, 10);

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
