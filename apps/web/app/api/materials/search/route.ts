import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "../../../../lib/api-utils";
import { sanitizeSearchQuery, searchUserMaterials } from "../../../../lib/material-search";

const MIN_QUERY_LENGTH = 2;

function readQueryParam(request: NextRequest) {
  const rawQuery = request.nextUrl.searchParams.get("q");
  if (typeof rawQuery !== "string") {
    return null;
  }

  return sanitizeSearchQuery(rawQuery);
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) {
    return auth.error;
  }

  const query = readQueryParam(request);
  if (!query || query.length < MIN_QUERY_LENGTH) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "q must be at least 2 characters long" },
      { status: 400 },
    );
  }

  try {
    const results = await searchUserMaterials(auth.user.sub, query);
    return NextResponse.json({ query, results });
  } catch (error) {
    console.error("Material search failed:", error);
    return NextResponse.json(
      { code: "SEARCH_FAILED", message: "Could not search materials right now" },
      { status: 500 },
    );
  }
}
