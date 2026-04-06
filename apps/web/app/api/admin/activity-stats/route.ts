import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { activityLogs } from "../../../../../../drizzle/schema";
import { requireAuth, requireAdmin } from "../../../../lib/api-utils";
import { count, sql, gte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  // Project start date
  const startDate = new Date("2026-03-27T00:00:00Z");

  try {
    // Aggregate logs by day using SQL date formatting
    // We use DATE(created_at) to group by day in PostgreSQL
    const stats = await db
      .select({
        day: sql<string>`DATE(${activityLogs.createdAt})`,
        value: count(),
      })
      .from(activityLogs)
      .where(gte(activityLogs.createdAt, startDate))
      .groupBy(sql`DATE(${activityLogs.createdAt})`)
      .orderBy(sql`DATE(${activityLogs.createdAt})`);

    // Format output to be more frontend-friendly
    // Ensure all days from startDate to today are present (even with 0 activity)
    const today = new Date();
    const result = [];
    let current = new Date(startDate);

    while (current <= today) {
      const dayStr = current.toISOString().split("T")[0]; // YYYY-MM-DD
      const match = stats.find((s) => s.day === dayStr);
      
      result.push({
        day: new Date(dayStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }), // e.g. "27 Mar"
        value: match ? Number(match.value) : 0,
      });
      
      current.setDate(current.getDate() + 1);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch activity stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
