"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { STATUS_TOAST_LABEL } from "../../lib/progress";
import {
  fetchWithTimeout,
  patchMilestoneRequest,
  timeoutMessage,
} from "./use-progress-request";
import type { TimelineFilter } from "./timeline-filters";
import type { Milestone, MilestoneUpdate } from "./types";
import type {
  MilestonePatchPayload,
  MilestoneResponse,
  ToastState,
} from "./use-progress-page-state.types";

type UseProgressMutationsParams = {
  allMilestones: Milestone[];
  loadProgressData: () => Promise<void>;
  setAllMilestones: Dispatch<SetStateAction<Milestone[]>>;
  setRevealedMilestoneId: Dispatch<SetStateAction<number | null>>;
  setTimelineFilter: Dispatch<SetStateAction<TimelineFilter>>;
  setToast: Dispatch<SetStateAction<ToastState | null>>;
  timelineFilter: TimelineFilter;
};

export function useProgressMutations({
  allMilestones,
  loadProgressData,
  setAllMilestones,
  setRevealedMilestoneId,
  setTimelineFilter,
  setToast,
  timelineFilter,
}: UseProgressMutationsParams) {
  const [addBusy, setAddBusy] = useState(false);
  const [ideaBusy, setIdeaBusy] = useState(false);
  const [rowBusyId, setRowBusyId] = useState<number | null>(null);

  function nextOrderIndex() {
    if (allMilestones.length === 0) return 0;
    return Math.max(...allMilestones.map((milestone) => milestone.orderIndex)) + 1;
  }

  async function patchMilestone(id: number, payload: MilestonePatchPayload) {
    return patchMilestoneRequest(id, payload);
  }

  async function handleAdd(data: {
    title: string;
    description: string;
    dueDate: string;
  }) {
    setAddBusy(true);

    try {
      const response = await fetchWithTimeout("/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          dueDate: data.dueDate || null,
          orderIndex: nextOrderIndex(),
        }),
      });

      if (!response.ok) {
        setToast({ tone: "error", message: "Could not add milestone." });
        return;
      }

      const payload = (await response.json()) as MilestoneResponse;
      if (payload.milestone) {
        setAllMilestones((current) => [...current, payload.milestone as Milestone]);
        if (timelineFilter !== "all" && timelineFilter !== "active") {
          setTimelineFilter("active");
        }
        setRevealedMilestoneId(payload.milestone.id);
      }

      setToast({ tone: "success", message: "Milestone added." });
    } catch (error) {
      setToast({
        tone: "error",
        message: timeoutMessage(error) ?? "Could not add milestone.",
      });
    } finally {
      setAddBusy(false);
    }
  }

  async function handleAddIdea(title: string, description: string) {
    setIdeaBusy(true);

    try {
      const response = await fetchWithTimeout("/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          status: "idea",
          orderIndex: nextOrderIndex(),
        }),
      });

      if (!response.ok) {
        setToast({ tone: "error", message: "Could not save idea." });
        return;
      }

      const payload = (await response.json()) as MilestoneResponse;
      if (payload.milestone) {
        setAllMilestones((current) => [...current, payload.milestone as Milestone]);
      }

      setToast({ tone: "success", message: "Idea saved." });
    } catch (error) {
      setToast({
        tone: "error",
        message: timeoutMessage(error) ?? "Could not save idea.",
      });
    } finally {
      setIdeaBusy(false);
    }
  }

  async function handleEditIdea(
    id: number,
    title: string,
    description: string
  ): Promise<boolean> {
    setRowBusyId(id);
    const updated = await patchMilestone(id, {
      title,
      description: description || null,
    });
    setRowBusyId(null);

    if (!updated) {
      setToast({ tone: "error", message: "Could not update idea." });
      return false;
    }

    setAllMilestones((current) =>
      current.map((item) => (item.id === id ? updated : item))
    );
    setToast({ tone: "success", message: "Idea updated." });
    return true;
  }

  async function handlePromoteIdea(id: number) {
    setRowBusyId(id);
    const updated = await patchMilestone(id, { status: "not_started" });
    setRowBusyId(null);

    if (!updated) {
      setToast({ tone: "error", message: "Could not promote idea." });
      return;
    }

    setAllMilestones((current) =>
      current.map((item) => (item.id === id ? updated : item))
    );
    if (timelineFilter !== "all" && timelineFilter !== "active") {
      setTimelineFilter("active");
    }
    setRevealedMilestoneId(updated.id);
    setToast({ tone: "success", message: "Moved to milestones." });
  }

  async function handleStatusChange(id: number, status: Milestone["status"]) {
    setRowBusyId(id);
    const updated = await patchMilestone(id, { status });
    setRowBusyId(null);

    if (!updated) {
      setToast({ tone: "error", message: "Could not update milestone status." });
      return;
    }

    setAllMilestones((current) =>
      current.map((item) => (item.id === id ? updated : item))
    );
    setToast({
      tone: status === "done" ? "success" : "info",
      message: `Milestone set to ${STATUS_TOAST_LABEL[status]}.`,
    });
  }

  async function handleUpdateMilestone(
    id: number,
    update: MilestoneUpdate
  ): Promise<boolean> {
    setRowBusyId(id);
    const updated = await patchMilestone(id, {
      title: update.title,
      description: update.description || null,
      dueDate: update.dueDate || null,
    });
    setRowBusyId(null);

    if (!updated) {
      setToast({ tone: "error", message: "Could not save milestone." });
      return false;
    }

    setAllMilestones((current) =>
      current.map((item) => (item.id === id ? updated : item))
    );
    setToast({ tone: "success", message: "Milestone updated." });
    return true;
  }

  async function handleMoveMilestone(
    id: number,
    direction: "up" | "down",
    visibleIds: number[]
  ) {
    const index = visibleIds.indexOf(id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (index === -1 || targetIndex < 0 || targetIndex >= visibleIds.length) {
      return;
    }

    const targetId = visibleIds[targetIndex];
    const current = allMilestones.find((item) => item.id === id);
    const target = allMilestones.find((item) => item.id === targetId);

    if (!current || !target) {
      return;
    }

    let sourceNewOrder = target.orderIndex;
    let targetNewOrder = current.orderIndex;
    if (sourceNewOrder === targetNewOrder) {
      if (direction === "up") {
        targetNewOrder = sourceNewOrder + 1;
      } else {
        sourceNewOrder = targetNewOrder + 1;
      }
    }

    setAllMilestones((currentItems) =>
      currentItems.map((item) => {
        if (item.id === id) return { ...item, orderIndex: sourceNewOrder };
        if (item.id === targetId) return { ...item, orderIndex: targetNewOrder };
        return item;
      })
    );

    setRowBusyId(id);
    const [sourceUpdated, targetUpdated] = await Promise.all([
      patchMilestone(id, { orderIndex: sourceNewOrder }),
      patchMilestone(targetId, { orderIndex: targetNewOrder }),
    ]);
    setRowBusyId(null);

    if (!sourceUpdated || !targetUpdated) {
      await loadProgressData();
      setToast({ tone: "error", message: "Could not reorder milestone." });
      return;
    }

    setAllMilestones((currentItems) =>
      currentItems.map((item) => {
        if (item.id === id) return sourceUpdated;
        if (item.id === targetId) return targetUpdated;
        return item;
      })
    );
    setToast({ tone: "success", message: "Milestone order updated." });
  }

  return {
    addBusy,
    handleAdd,
    handleAddIdea,
    handleEditIdea,
    handleMoveMilestone,
    handlePromoteIdea,
    handleStatusChange,
    handleUpdateMilestone,
    ideaBusy,
    rowBusyId,
  };
}
