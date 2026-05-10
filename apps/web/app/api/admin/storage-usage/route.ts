import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireAuth } from "../../../../lib/api-utils";
import { fetchStorageUsage } from "../../../../lib/admin-queries";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  const usage = await fetchStorageUsage();

  return NextResponse.json(usage);
}
