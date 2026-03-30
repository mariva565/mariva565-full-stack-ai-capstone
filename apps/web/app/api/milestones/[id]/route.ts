import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "../../../../lib/db";
import { requireAuth } from "../../../../lib/api-utils";
import { milestones } from "../../../../../../drizzle/schema";

type Ctx = { params: Promise<{ id: string }> };

const MILESTONE_STATUS_VALUES = [
  "not_started",
  "in_progress",
  "done",
  "idea",
] as const;

type MilestoneStatus = (typeof MILESTONE_STATUS_VALUES)[number];

function isMilestoneStatus(value: unknown): value is MilestoneStatus {
  return (
    typeof value === "string" &&
    MILESTONE_STATUS_VALUES.includes(value as MilestoneStatus)
  );
}

function toMilestoneId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// PATCH /api/milestones/[id] - update a milestone
export async function PATCH(request: NextRequest, ctx: Ctx) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await ctx.params;
  const milestoneId = toMilestoneId(id);
  if (!milestoneId) {
    return NextResponse.json(
      { code: "INVALID_ID", message: "Milestone id is invalid" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { title, description, status, dueDate, orderIndex } = body;
  const trimmedTitle = typeof title === "string" ? title.trim() : null;

  if (status !== undefined && !isMilestoneStatus(status)) {
    return NextResponse.json(
      { code: "INVALID_STATUS", message: "Milestone status is invalid" },
      { status: 400 }
    );
  }

  if (title !== undefined && !trimmedTitle) {
    return NextResponse.json(
      { code: "MISSING_TITLE", message: "Title is required" },
      { status: 400 }
    );
  }

  if (
    orderIndex !== undefined &&
    (!Number.isInteger(orderIndex) || orderIndex < 0)
  ) {
    return NextResponse.json(
      { code: "INVALID_ORDER_INDEX", message: "Order index is invalid" },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = trimmedTitle;
  if (description !== undefined) {
    updates.description =
      typeof description === "string" ? description.trim() || null : null;
  }
  if (dueDate !== undefined) {
    updates.dueDate = typeof dueDate === "string" && dueDate ? dueDate : null;
  }
  if (orderIndex !== undefined) updates.orderIndex = orderIndex;

  if (status !== undefined) {
    updates.status = status;
    updates.completedAt = status === "done" ? new Date() : null;
  }

  const [updated] = await db
    .update(milestones)
    .set(updates)
    .where(and(eq(milestones.id, milestoneId), eq(milestones.userId, auth.user.sub)))
    .returning();

  if (!updated) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Milestone not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ milestone: updated });
}

// DELETE /api/milestones/[id] - delete a milestone
export async function DELETE(request: NextRequest, ctx: Ctx) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await ctx.params;
  const milestoneId = toMilestoneId(id);
  if (!milestoneId) {
    return NextResponse.json(
      { code: "INVALID_ID", message: "Milestone id is invalid" },
      { status: 400 }
    );
  }

  const [deleted] = await db
    .delete(milestones)
    .where(and(eq(milestones.id, milestoneId), eq(milestones.userId, auth.user.sub)))
    .returning();

  if (!deleted) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Milestone not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
