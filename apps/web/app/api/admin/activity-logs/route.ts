import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { activityLogs, users } from "../../../../../../drizzle/schema";
import { requireAuth, requireAdmin } from "../../../../lib/api-utils";
import { desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 200);
  const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
  const offset = (page - 1) * limit;

  const rows = await db
    .select({
      id: activityLogs.id,
      actionType: activityLogs.actionType,
      targetId: activityLogs.targetId,
      details: activityLogs.details,
      createdAt: activityLogs.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(activityLogs)
    .innerJoin(users, eq(activityLogs.userId, users.id))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit + 1)
    .offset(offset);

  return NextResponse.json({ logs: rows.slice(0, limit), page, hasMore: rows.length > limit });
}
