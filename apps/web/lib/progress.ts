import type { Milestone } from "../components/progress/types";
import type { TimelineFilter } from "../components/progress/timeline-filters";

export const FILTER_EMPTY_MESSAGE: Record<TimelineFilter, string> = {
  all: "No milestones yet. Add your first one above.",
  active: "No active milestones right now.",
  in_progress: "Nothing is marked as in progress yet.",
  today: "No milestones are due today.",
  next7: "No milestones are due in the next 7 days.",
  overdue: "Great job. You have no overdue milestones.",
  done: "No completed milestones yet.",
};

export const STATUS_TOAST_LABEL: Record<Milestone["status"], string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  done: "Done",
  idea: "Idea",
};

export type DueDateCategory = "none" | "overdue" | "today" | "next7" | "upcoming";

export function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDaysToDateKey(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toLocalDateKey(date);
}

export function toDateKey(value: string | null) {
  if (!value) return null;
  const directMatch = value.match(/^\d{4}-\d{2}-\d{2}/);
  if (directMatch) return directMatch[0];

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return toLocalDateKey(parsed);
}

export function classifyMilestoneDueDate(
  milestone: Pick<Milestone, "dueDate" | "status">,
  referenceDateKey = toLocalDateKey(new Date())
): DueDateCategory {
  const dueDateKey = toDateKey(milestone.dueDate);
  if (!dueDateKey) return "none";

  if (milestone.status === "done") return "none";

  if (dueDateKey < referenceDateKey) {
    return "overdue";
  }

  if (dueDateKey === referenceDateKey) {
    return "today";
  }

  if (dueDateKey <= addDaysToDateKey(referenceDateKey, 7)) {
    return "next7";
  }

  return "upcoming";
}

export function isMilestoneOverdue(milestone: Milestone) {
  return classifyMilestoneDueDate(milestone) === "overdue";
}

export function matchesTimelineFilter(milestone: Milestone, filter: TimelineFilter) {
  if (filter === "all") return true;
  if (filter === "active") return milestone.status !== "done";
  if (filter === "in_progress") return milestone.status === "in_progress";
  if (filter === "today") return classifyMilestoneDueDate(milestone) === "today";
  if (filter === "next7") return classifyMilestoneDueDate(milestone) === "next7";
  if (filter === "done") return milestone.status === "done";
  return classifyMilestoneDueDate(milestone) === "overdue";
}

function dueSortValue(milestone: Milestone) {
  const dateKey = toDateKey(milestone.dueDate);
  if (!dateKey) return Number.POSITIVE_INFINITY;

  const dueDate = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(dueDate.getTime())) return Number.POSITIVE_INFINITY;
  return dueDate.getTime();
}

export function getDueSoonMilestones(milestones: Milestone[], limit = 5) {
  return [...milestones]
    .filter((milestone) => milestone.status !== "done" && milestone.dueDate)
    .sort((a, b) => {
      const dueDelta = dueSortValue(a) - dueSortValue(b);
      if (dueDelta !== 0) return dueDelta;
      return a.orderIndex - b.orderIndex;
    })
    .slice(0, limit);
}

export function sortMilestonesByOrder(milestones: Milestone[]) {
  return [...milestones].sort((a, b) => {
    const orderDelta = a.orderIndex - b.orderIndex;
    if (orderDelta !== 0) return orderDelta;
    return a.id - b.id;
  });
}

export function formatMilestoneDueDate(value: string | null) {
  const dateKey = toDateKey(value);
  if (!dateKey) return "";

  const date = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateKey;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}
