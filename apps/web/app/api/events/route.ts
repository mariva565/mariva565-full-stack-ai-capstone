import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { requireAuth } from "../../../lib/api-utils";
import { getCalendarEvents } from "../../../lib/calendar-data";
import { userCanAccessCourse } from "../../../lib/course-details-data";
import { db } from "../../../lib/db";
import { events, milestones } from "../../../../../drizzle/schema";

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

  let normalizedCourseId: number | null = null;
  if (courseId) {
    const parsed = Number(courseId);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return NextResponse.json(
        { code: "INVALID_COURSE", message: "Invalid course" },
        { status: 400 }
      );
    }
    const hasAccess = await userCanAccessCourse(auth.user, parsed);
    if (!hasAccess) {
      return NextResponse.json(
        { code: "FORBIDDEN_COURSE", message: "You do not have access to this course" },
        { status: 403 }
      );
    }
    normalizedCourseId = parsed;
  }

  let normalizedMilestoneId: number | null = null;
  if (milestoneId) {
    const parsed = Number(milestoneId);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return NextResponse.json(
        { code: "INVALID_MILESTONE", message: "Invalid milestone" },
        { status: 400 }
      );
    }
    const [milestone] = await db
      .select({ id: milestones.id })
      .from(milestones)
      .where(and(eq(milestones.id, parsed), eq(milestones.userId, auth.user.sub)))
      .limit(1);
    if (!milestone) {
      return NextResponse.json(
        { code: "FORBIDDEN_MILESTONE", message: "Milestone not found" },
        { status: 404 }
      );
    }
    normalizedMilestoneId = parsed;
  }

  const [event] = await db
    .insert(events)
    .values({
      title,
      description: description || null,
      date,
      type: type || "reminder",
      color: color || null,
      courseId: normalizedCourseId,
      milestoneId: normalizedMilestoneId,
      userId: auth.user.sub,
    })
    .returning();

  return NextResponse.json({ event }, { status: 201 });
}
