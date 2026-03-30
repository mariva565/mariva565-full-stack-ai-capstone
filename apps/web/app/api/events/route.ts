import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { events } from "../../../../../drizzle/schema";
import { requireAuth } from "../../../lib/api-utils";
import { eq, and, gte, lte, asc } from "drizzle-orm";

// GET /api/events?month=2026-04 — list events for a month
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const month = request.nextUrl.searchParams.get("month");

  let rows;
  if (month) {
    // month format: "2026-04"
    const startDate = `${month}-01`;
    const [y, m] = month.split("-").map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    const endDate = `${month}-${String(lastDay).padStart(2, "0")}`;

    rows = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.userId, auth.user.sub),
          gte(events.date, startDate),
          lte(events.date, endDate)
        )
      )
      .orderBy(asc(events.date));
  } else {
    rows = await db
      .select()
      .from(events)
      .where(eq(events.userId, auth.user.sub))
      .orderBy(asc(events.date));
  }

  return NextResponse.json({ events: rows });
}

// POST /api/events — create a new event
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const { title, description, date, type, color, courseId, milestoneId } = body;

  if (!title || !date) {
    return NextResponse.json(
      { code: "MISSING_FIELDS", message: "Title and date are required" },
      { status: 400 }
    );
  }

  const [event] = await db
    .insert(events)
    .values({
      title,
      description: description || null,
      date,
      type: type || "reminder",
      color: color || null,
      courseId: courseId || null,
      milestoneId: milestoneId || null,
      userId: auth.user.sub,
    })
    .returning();

  return NextResponse.json({ event }, { status: 201 });
}
