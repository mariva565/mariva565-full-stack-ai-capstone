"use client";

import { useMemo } from "react";
import {
  classifyMilestoneDueDate,
  getDueSoonMilestones,
  isMilestoneOverdue,
  matchesTimelineFilter,
  sortMilestonesByOrder,
} from "../../lib/progress";
import type { FilterOption } from "./use-progress-page-state.types";
import type { TimelineFilter } from "./timeline-filters";
import type { Milestone } from "./types";

type UseProgressDerivedStateParams = {
  allMilestones: Milestone[];
  timelineFilter: TimelineFilter;
};

export function useProgressDerivedState({
  allMilestones,
  timelineFilter,
}: UseProgressDerivedStateParams) {
  const orderedMilestones = useMemo(
    () => sortMilestonesByOrder(allMilestones),
    [allMilestones]
  );

  const milestones = useMemo(
    () => orderedMilestones.filter((item) => item.status !== "idea"),
    [orderedMilestones]
  );

  const ideas = useMemo(
    () => orderedMilestones.filter((item) => item.status === "idea"),
    [orderedMilestones]
  );

  const filteredMilestones = useMemo(
    () => milestones.filter((item) => matchesTimelineFilter(item, timelineFilter)),
    [milestones, timelineFilter]
  );

  const dueSoonMilestones = useMemo(
    () => getDueSoonMilestones(milestones, 5),
    [milestones]
  );

  const summary = useMemo(() => {
    return milestones.reduce(
      (counts, item) => {
        const dueDateBucket = classifyMilestoneDueDate(item);

        if (item.status === "done") {
          counts.doneCount += 1;
        } else {
          counts.activeCount += 1;
        }

        if (item.status === "in_progress") {
          counts.inProgressCount += 1;
        }

        if (isMilestoneOverdue(item)) {
          counts.overdueCount += 1;
        }

        if (dueDateBucket === "today") {
          counts.todayCount += 1;
        }

        if (dueDateBucket === "next7") {
          counts.next7Count += 1;
        }

        return counts;
      },
      {
        activeCount: 0,
        doneCount: 0,
        inProgressCount: 0,
        next7Count: 0,
        overdueCount: 0,
        todayCount: 0,
      }
    );
  }, [milestones]);

  const filterOptions = useMemo<FilterOption[]>(
    () => [
      { id: "all", label: "All", count: milestones.length },
      { id: "active", label: "Active", count: summary.activeCount },
      {
        id: "in_progress",
        label: "In Progress",
        count: summary.inProgressCount,
      },
      { id: "today", label: "Today", count: summary.todayCount },
      { id: "next7", label: "Next 7 Days", count: summary.next7Count },
      { id: "overdue", label: "Overdue", count: summary.overdueCount },
      { id: "done", label: "Done", count: summary.doneCount },
    ],
    [milestones.length, summary]
  );

  return {
    activeCount: summary.activeCount,
    doneCount: summary.doneCount,
    dueSoonMilestones,
    filterOptions,
    filteredMilestones,
    ideas,
    milestones,
    overdueCount: summary.overdueCount,
  };
}
