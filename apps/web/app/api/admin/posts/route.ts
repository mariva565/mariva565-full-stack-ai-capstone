import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireMentor } from "../../../../lib/api-utils";
import { fetchModerationQueuePage } from "../../../../lib/admin-queries";

// GET /api/admin/posts - moderation queue (mentor/admin scoped)
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;
  const mentorErr = requireMentor(auth.user);
  if (mentorErr) return mentorErr;

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const searchParam = searchParams.get("search");
  const pageParam = searchParams.get("page");

  const result = await fetchModerationQueuePage(
    auth.user.sub,
    auth.user.role,
    statusParam,
    searchParam,
    pageParam
  );

  return NextResponse.json(result);
}

