import { NextRequest, NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import { db } from "../../../lib/db";
import { requireAuth } from "../../../lib/api-utils";
import { milestones } from "../../../../../drizzle/schema";

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

// GET /api/milestones - list all milestones for the user
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

// POST /api/milestones - create a new milestone
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const { title, description, dueDate, orderIndex, status } = body;
  const trimmedTitle = typeof title === "string" ? title.trim() : "";

  if (!trimmedTitle) {
    return NextResponse.json(
      { code: "MISSING_TITLE", message: "Title is required" },
      { status: 400 }
    );
  }

  if (status !== undefined && !isMilestoneStatus(status)) {
    return NextResponse.json(
      { code: "INVALID_STATUS", message: "Milestone status is invalid" },
      { status: 400 }
    );
  }

  const milestoneStatus = isMilestoneStatus(status) ? status : "not_started";

  const [milestone] = await db
    .insert(milestones)
    .values({
      title: trimmedTitle,
      description: typeof description === "string" ? description.trim() || null : null,
      status: milestoneStatus,
      dueDate: dueDate || null,
      completedAt: milestoneStatus === "done" ? new Date() : null,
      orderIndex:
        Number.isInteger(orderIndex) && orderIndex >= 0 ? orderIndex : 0,
      userId: auth.user.sub,
    })
    .returning();

  return NextResponse.json({ milestone }, { status: 201 });
}
