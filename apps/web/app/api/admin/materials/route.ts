import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { materials, modules, courses, users } from "../../../../../../drizzle/schema";
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
          ilike(materials.title, `%${search}%`),
          ilike(materials.materialType, `%${search}%`),
          ilike(courses.title, `%${search}%`),
          ilike(users.name, `%${search}%`)
        )
      : undefined,
  ]);

  const [allMaterials, [totalRow]] = await Promise.all([
    db
      .select({
        id: materials.id,
        title: materials.title,
        materialType: materials.materialType,
        createdAt: materials.createdAt,
        moduleId: materials.moduleId,
        moduleTitle: modules.title,
        courseId: courses.id,
        courseTitle: courses.title,
        authorName: users.name,
        authorEmail: users.email,
      })
      .from(materials)
      .innerJoin(modules, eq(materials.moduleId, modules.id))
      .innerJoin(courses, eq(modules.courseId, courses.id))
      .innerJoin(users, eq(materials.createdBy, users.id))
      .where(where)
      .orderBy(desc(materials.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ value: count() })
      .from(materials)
      .innerJoin(modules, eq(materials.moduleId, modules.id))
      .innerJoin(courses, eq(modules.courseId, courses.id))
      .innerJoin(users, eq(materials.createdBy, users.id))
      .where(where),
  ]);

  return NextResponse.json({
    materials: allMaterials,
    ...buildPageMeta(page, limit, totalRow.value),
  });
}
