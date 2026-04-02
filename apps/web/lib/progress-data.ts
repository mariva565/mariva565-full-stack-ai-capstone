import { asc, eq } from "drizzle-orm";
import { events, milestones } from "../../../drizzle/schema";
import type { Milestone, ProgressData, ProgressEvent } from "../components/progress/types";
import { db } from "./db";

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

function toTimestampString(value: Date | string | null): string | null {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.toISOString();
}

export async function getProgressData(userId: number): Promise<ProgressData> {
  const [milestoneRows, eventRows] = await Promise.all([
    db
      .select({
        id: milestones.id,
        title: milestones.title,
        description: milestones.description,
        status: milestones.status,
        dueDate: milestones.dueDate,
        completedAt: milestones.completedAt,
        orderIndex: milestones.orderIndex,
      })
      .from(milestones)
      .where(eq(milestones.userId, userId))
      .orderBy(asc(milestones.orderIndex)),
    db
      .select({
        id: events.id,
        title: events.title,
        date: events.date,
        type: events.type,
        color: events.color,
      })
      .from(events)
      .where(eq(events.userId, userId))
      .orderBy(asc(events.date)),
  ]);

  const normalizedMilestones: Milestone[] = milestoneRows.map((milestone) => ({
    ...milestone,
    status: milestone.status as Milestone["status"],
    dueDate: toDateOnlyString(milestone.dueDate),
    completedAt: toTimestampString(milestone.completedAt),
  }));

  const normalizedEvents: ProgressEvent[] = eventRows.map((event) => ({
    ...event,
    date: toDateOnlyString(event.date) ?? "",
  }));

  return {
    milestones: normalizedMilestones,
    events: normalizedEvents,
  };
}
