import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "../../../../lib/api-utils";
import { fetchActivityStats } from "../../../../lib/admin-queries";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  try {
    const result = await fetchActivityStats();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch activity stats:", error);
    return NextResponse.json(
      { code: "ACTIVITY_STATS_LOAD_FAILED", message: "Failed to load activity stats" },
      { status: 500 }
    );
  }
}
