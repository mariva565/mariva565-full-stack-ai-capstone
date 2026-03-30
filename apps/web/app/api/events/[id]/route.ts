import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { events } from "../../../../../../drizzle/schema";
import { requireAuth } from "../../../../lib/api-utils";
import { eq, and } from "drizzle-orm";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/events/[id] — update an event
export async function PATCH(request: NextRequest, ctx: Ctx) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await ctx.params;
  const body = await request.json();
  const { title, description, date, type, color, courseId } = body;

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (date !== undefined) updates.date = date;
  if (type !== undefined) updates.type = type;
  if (color !== undefined) updates.color = color;
  if (courseId !== undefined) updates.courseId = courseId;

  const [updated] = await db
    .update(events)
    .set(updates)
    .where(
      and(eq(events.id, Number(id)), eq(events.userId, auth.user.sub))
    )
    .returning();

  if (!updated) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Event not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ event: updated });
}

// DELETE /api/events/[id] — delete an event
export async function DELETE(request: NextRequest, ctx: Ctx) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await ctx.params;

  const [deleted] = await db
    .delete(events)
    .where(
      and(eq(events.id, Number(id)), eq(events.userId, auth.user.sub))
    )
    .returning();

  if (!deleted) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Event not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
