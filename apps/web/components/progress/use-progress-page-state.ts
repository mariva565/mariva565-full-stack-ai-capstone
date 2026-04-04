"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useProgressDeleteMutation } from "./use-progress-delete-mutation";
import { useProgressDerivedState } from "./use-progress-derived-state";
import { useProgressMutations } from "./use-progress-mutations";
import { loadProgressSnapshot } from "./use-progress-request";
import type { TimelineFilter } from "./timeline-filters";
import type { Milestone, ProgressEvent } from "./types";
import type {
  ToastState,
  UseProgressPageStateParams,
} from "./use-progress-page-state.types";

export function useProgressPageState({
  initialData,
}: UseProgressPageStateParams) {
  const router = useRouter();
  const [allMilestones, setAllMilestones] = useState<Milestone[]>(
    initialData.milestones
  );
  const [events, setEvents] = useState<ProgressEvent[]>(initialData.events);
  const [timelineFilter, setTimelineFilter] =
    useState<TimelineFilter>("active");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [revealedMilestoneId, setRevealedMilestoneId] = useState<
    number | null
  >(null);

  const derivedState = useProgressDerivedState({
    allMilestones,
    timelineFilter,
  });

  async function loadProgressData() {
    const snapshot = await loadProgressSnapshot();

    if (snapshot.redirectToLogin) {
      router.push("/login");
      return;
    }

    if (snapshot.errorMessage) {
      setToast({ tone: "error", message: snapshot.errorMessage });
      return;
    }

    setAllMilestones(snapshot.milestones);
    setEvents(snapshot.events);
  }

  const mutationState = useProgressMutations({
    allMilestones,
    loadProgressData,
    setAllMilestones,
    setRevealedMilestoneId,
    setTimelineFilter,
    setToast,
    timelineFilter,
  });

  const deleteMutationState = useProgressDeleteMutation({
    setAllMilestones,
    setToast,
  });

  return {
    ...derivedState,
    ...deleteMutationState,
    ...mutationState,
    events,
    revealedMilestoneId,
    setTimelineFilter,
    setToast,
    timelineFilter,
    toast,
  };
}
