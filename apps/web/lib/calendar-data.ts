import { and, asc, eq, gte, lte } from "drizzle-orm";

import { events } from "../../../drizzle/schema";
import type { CalendarEvent, CalendarInitialView } from "../components/calendar/types";
import { db } from "./db";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateOnlyString(value: Date | string | null): string | null {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    const directMatch = value.match(/^\d{4}-\d{2}-\d{2}/);
    return directMatch ? directMatch[0] : value;
  }

  return value.toISOString().slice(0, 10);
}

function getMonthBounds(month: string) {
  const match = month.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    throw new Error("INVALID_MONTH");
  }

  const year = Number(match[1]);
  const monthNumber = Number(match[2]);
  if (!Number.isInteger(year) || !Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    throw new Error("INVALID_MONTH");
  }

  const lastDay = new Date(year, monthNumber, 0).getDate();

  return {
    startDate: `${month}-01`,
    endDate: `${month}-${pad(lastDay)}`,
  };
}

export function getCalendarInitialView(now = new Date()): CalendarInitialView & { monthKey: string } {
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();

  return {
    year,
    month,
    selectedDate: `${year}-${pad(month + 1)}-${pad(date)}`,
    monthKey: `${year}-${pad(month + 1)}`,
  };
}

export async function getCalendarEvents(
  userId: number,
  month?: string
): Promise<CalendarEvent[]> {
  const monthBounds = month ? getMonthBounds(month) : null;

  const rows = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      date: events.date,
      type: events.type,
      color: events.color,
      courseId: events.courseId,
      milestoneId: events.milestoneId,
    })
    .from(events)
    .where(
      monthBounds
        ? and(
            eq(events.userId, userId),
            gte(events.date, monthBounds.startDate),
            lte(events.date, monthBounds.endDate)
          )
        : eq(events.userId, userId)
    )
    .orderBy(asc(events.date));

  return rows.map((event) => ({
    ...event,
    date: toDateOnlyString(event.date) ?? "",
  }));
}
