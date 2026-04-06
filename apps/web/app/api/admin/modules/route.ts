import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { modules, courses, users } from "../../../../../../drizzle/schema";
import { requireAuth, requireAdmin } from "../../../../lib/api-utils";
import { desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  const allModules = await db
    .select({
      id: modules.id,
      title: modules.title,
      description: modules.description,
      orderIndex: modules.orderIndex,
      courseId: modules.courseId,
      courseTitle: courses.title,
      authorName: users.name,
      authorEmail: users.email,
    })
    .from(modules)
    .innerJoin(courses, eq(modules.courseId, courses.id))
    .innerJoin(users, eq(modules.createdBy, users.id))
    .orderBy(desc(modules.id));

  return NextResponse.json({ modules: allModules });
}
