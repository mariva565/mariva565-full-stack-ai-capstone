import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { milestones } from "../../../../../../drizzle/schema";
import { requireAuth } from "../../../../lib/api-utils";
import { eq, and } from "drizzle-orm";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/milestones/[id] — update a milestone
export async function PATCH(request: NextRequest, ctx: Ctx) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await ctx.params;
  const body = await request.json();
  const { title, description, status, dueDate, orderIndex } = body;

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (dueDate !== undefined) updates.dueDate = dueDate;
  if (orderIndex !== undefined) updates.orderIndex = orderIndex;
  if (status !== undefined) {
    updates.status = status;
    updates.completedAt = status === "done" ? new Date() : null;
  }

  const [updated] = await db
    .update(milestones)
    .set(updates)
    .where(
      and(eq(milestones.id, Number(id)), eq(milestones.userId, auth.user.sub))
    )
    .returning();

  if (!updated) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Milestone not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ milestone: updated });
}

// DELETE /api/milestones/[id] — delete a milestone
export async function DELETE(request: NextRequest, ctx: Ctx) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await ctx.params;

  const [deleted] = await db
    .delete(milestones)
    .where(
      and(eq(milestones.id, Number(id)), eq(milestones.userId, auth.user.sub))
    )
    .returning();

  if (!deleted) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Milestone not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
