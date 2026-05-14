import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { courses, users } from "../../../../../../drizzle/schema";
import { requireAuth, requireAdmin } from "../../../../lib/api-utils";
import { buildPageMeta, normalizeSearch, readPaginationParams } from "../../../../lib/pagination";
import { combineConditions } from "../../../../lib/query-conditions";
import { count, desc, eq, ilike, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  const { searchParams } = new URL(request.url);
  const { page, limit, offset } = readPaginationParams(searchParams, {
    defaultLimit: 50,
    maxLimit: 200,
  });
  const search = normalizeSearch(searchParams.get("search"));
  const viewAs = normalizeSearch(searchParams.get("viewAs"));
  const where = combineConditions([
    viewAs ? eq(users.email, viewAs) : undefined,
    search
      ? or(
          ilike(courses.title, `%${search}%`),
          ilike(courses.description, `%${search}%`),
          ilike(users.name, `%${search}%`)
        )
      : undefined,
  ]);

  const [allCourses, [totalRow]] = await Promise.all([
    db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        isPublic: courses.isPublic,
        status: courses.status,
        createdAt: courses.createdAt,
        authorName: users.name,
        authorEmail: users.email,
      })
      .from(courses)
      .innerJoin(users, eq(courses.createdBy, users.id))
      .where(where)
      .orderBy(desc(courses.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ value: count() })
      .from(courses)
      .innerJoin(users, eq(courses.createdBy, users.id))
      .where(where),
  ]);

  return NextResponse.json({
    courses: allCourses,
    ...buildPageMeta(page, limit, totalRow.value),
  });
}
