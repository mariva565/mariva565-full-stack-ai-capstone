import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../lib/api-utils";
import { getDashboardData } from "../../../lib/dashboard-data";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) {
    return auth.error;
  }

  const dashboardData = await getDashboardData(auth.user.sub);

  return NextResponse.json(dashboardData);
}
