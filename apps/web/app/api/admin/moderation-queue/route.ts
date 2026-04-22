import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { users, posts } from "../../../../../../drizzle/schema";
import { requireAuth, requireAdmin } from "../../../../lib/api-utils";
import { count, eq, gte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [[pendingPosts], [newUsers]] = await Promise.all([
    db.select({ value: count() }).from(posts).where(eq(posts.status, "pending")),
    db.select({ value: count() }).from(users).where(gte(users.createdAt, sevenDaysAgo)),
  ]);

  return NextResponse.json({
    pendingPosts: pendingPosts.value,
    newUsers: newUsers.value,
  });
}
