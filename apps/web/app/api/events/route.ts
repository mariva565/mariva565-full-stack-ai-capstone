import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "../../../lib/api-utils";
import { getCalendarEvents } from "../../../lib/calendar-data";
import { db } from "../../../lib/db";
import { events } from "../../../../../drizzle/schema";

// GET /api/events?month=2026-04 вЂ” list events for a month
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const month = request.nextUrl.searchParams.get("month");

  try {
    const calendarEvents = await getCalendarEvents(auth.user.sub, month ?? undefined);
    return NextResponse.json({ events: calendarEvents });
  } catch {
    return NextResponse.json(
      { code: "INVALID_MONTH", message: "Month must use YYYY-MM format." },
      { status: 400 }
    );
  }
}

// POST /api/events вЂ” create a new event
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
