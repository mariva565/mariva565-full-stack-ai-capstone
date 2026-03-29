import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { courses, favorites, materials, modules } from "../../../../../drizzle/schema";
import { requireAuth } from "../../../lib/api-utils";
import { logActivity } from "../../../lib/activity";
import { and, desc, eq } from "drizzle-orm";

// GET /api/favorites — list user's favorites
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const rows = await db
    .select({
      id: favorites.id,
      materialId: favorites.materialId,
      createdAt: favorites.createdAt,
      materialTitle: materials.title,
      materialType: materials.materialType,
      tags: materials.tags,
      moduleId: modules.id,
      moduleTitle: modules.title,
      courseId: courses.id,
      courseTitle: courses.title,
    })
    .from(favorites)
    .innerJoin(materials, eq(favorites.materialId, materials.id))
    .innerJoin(modules, eq(materials.moduleId, modules.id))
    .innerJoin(courses, eq(modules.courseId, courses.id))
    .where(eq(favorites.userId, auth.user.sub))
    .orderBy(desc(favorites.createdAt));

  return NextResponse.json({ favorites: rows });
}

// POST /api/favorites — add a favorite
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const { materialId } = body;

  if (!materialId) {
    return NextResponse.json(
      { code: "MISSING_FIELD", message: "materialId is required" },
      { status: 400 }
    );
  }

  try {
    const [fav] = await db
      .insert(favorites)
      .values({ userId: auth.user.sub, materialId })
      .returning();

    await logActivity(auth.user.sub, "add_favorite", materialId, { materialId });

    return NextResponse.json({ favorite: fav }, { status: 201 });
  } catch {
    return NextResponse.json(
      { code: "ALREADY_EXISTS", message: "Already in favorites" },
      { status: 409 }
    );
  }
}

// DELETE /api/favorites?materialId=123 — remove a favorite
export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const materialId = request.nextUrl.searchParams.get("materialId");
  if (!materialId) {
    return NextResponse.json(
      { code: "MISSING_FIELD", message: "materialId query param is required" },
      { status: 400 }
    );
  }

  const [deleted] = await db
    .delete(favorites)
    .where(
      and(
        eq(favorites.userId, auth.user.sub),
        eq(favorites.materialId, Number(materialId))
      )
    )
    .returning({ id: favorites.id });

  if (!deleted) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Favorite not found" },
      { status: 404 }
    );
  }

  await logActivity(auth.user.sub, "remove_favorite", Number(materialId), { materialId: Number(materialId) });

  return NextResponse.json({ message: "Removed from favorites" });
}
