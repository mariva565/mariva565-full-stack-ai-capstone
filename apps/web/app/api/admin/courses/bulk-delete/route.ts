import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { courses } from "../../../../../../../drizzle/schema";
import { requireAuth, requireAdmin } from "../../../../../lib/api-utils";
import { logActivity } from "../../../../../lib/activity";
import { inArray } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  const { ids } = await request.json();

  if (!Array.isArray(ids) || ids.length === 0 || ids.length > 50) {
    return NextResponse.json(
      { code: "INVALID_IDS", message: "Provide between 1 and 50 IDs" },
      { status: 400 }
    );
  }

  if (!ids.every((id) => Number.isInteger(id) && id > 0)) {
    return NextResponse.json(
      { code: "INVALID_IDS", message: "All IDs must be positive integers" },
      { status: 400 }
    );
  }

  await db.delete(courses).where(inArray(courses.id, ids));

  await logActivity(auth.user.sub, "admin_bulk_delete_courses", undefined, {
    count: ids.length,
    ids,
  });

  return NextResponse.json({ message: `Deleted ${ids.length} course(s)` });
}
