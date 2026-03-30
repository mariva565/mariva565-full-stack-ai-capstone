import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { milestones } from "../../../../../drizzle/schema";
import { requireAuth } from "../../../lib/api-utils";
import { eq, asc } from "drizzle-orm";

// GET /api/milestones — list all milestones for the user
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const rows = await db
    .select()
    .from(milestones)
    .where(eq(milestones.userId, auth.user.sub))
    .orderBy(asc(milestones.orderIndex));

  return NextResponse.json({ milestones: rows });
}

// POST /api/milestones — create a new milestone
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const { title, description, dueDate, orderIndex } = body;

  if (!title) {
    return NextResponse.json(
      { code: "MISSING_TITLE", message: "Title is required" },
      { status: 400 }
    );
  }

  const [milestone] = await db
    .insert(milestones)
    .values({
      title,
      description: description || null,
      dueDate: dueDate || null,
      orderIndex: orderIndex ?? 0,
      userId: auth.user.sub,
    })
    .returning();

  return NextResponse.json({ milestone }, { status: 201 });
}
