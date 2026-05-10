import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "../../../../lib/api-utils";
import { fetchAdminStats } from "../../../../lib/admin-queries";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  const stats = await fetchAdminStats();

  return NextResponse.json(stats);
}
