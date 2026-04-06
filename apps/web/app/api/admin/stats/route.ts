import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { users, courses, modules, materials } from "../../../../../../drizzle/schema";
import { requireAuth, requireAdmin } from "../../../../lib/api-utils";
import { count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  const [[userCount], [courseCount], [moduleCount], [materialCount]] =
    await Promise.all([
      db.select({ value: count() }).from(users),
      db.select({ value: count() }).from(courses),
      db.select({ value: count() }).from(modules),
      db.select({ value: count() }).from(materials),
    ]);

  return NextResponse.json({
    users: userCount.value,
    courses: courseCount.value,
    modules: moduleCount.value,
    materials: materialCount.value,
  });
}
