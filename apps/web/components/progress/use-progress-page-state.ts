"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ToastTone } from "../ui/toast";
import type { Milestone, MilestoneUpdate } from "./milestone-timeline";
import type { TimelineFilter } from "./timeline-filters";
import {
  classifyMilestoneDueDate,
  getDueSoonMilestones,
  isMilestoneOverdue,
  matchesTimelineFilter,
  sortMilestonesByOrder,
  STATUS_TOAST_LABEL,
} from "../../lib/progress";

type ToastState = { tone: ToastTone; message: string };
type MilestonesResponse = { milestones: Milestone[] };
type MilestoneResponse = { milestone?: Milestone };
type ProgressEvent = {
  id: number;
  title: string;
  date: string;
  type: string;
  color: string | null;
};
type EventsResponse = { events: ProgressEvent[] };
type MilestonePatchPayload = Partial<{
  title: string;
  description: string | null;
  status: Milestone["status"];
  dueDate: string | null;
  orderIndex: number;
}>;
type FilterOption = { id: TimelineFilter; label: string; count: number };
const REQUEST_TIMEOUT_MS = 12000;

function timeoutMessage(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "Request timed out. Check dev server and try again.";
  }
  return null;
}

export function useProgressPageState() {
  const router = useRouter();
  const [allMilestones, setAllMilestones] = useState<Milestone[]>([]);
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [addBusy, setAddBusy] = useState(false);
  const [ideaBusy, setIdeaBusy] = useState(false);
  const [rowBusyId, setRowBusyId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>("active");
  const [toast, setToast] = useState<ToastState | null>(null);

  const orderedMilestones = useMemo(() => sortMilestonesByOrder(allMilestones), [allMilestones]);
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
  const dueSoonMilestones = useMemo(() => getDueSoonMilestones(milestones, 5), [milestones]);

  const doneCount = milestones.filter((item) => item.status === "done").length;
  const inProgressCount = milestones.filter((item) => item.status === "in_progress").length;
  const activeCount = milestones.filter((item) => item.status !== "done").length;
  const overdueCount = milestones.filter((item) => isMilestoneOverdue(item)).length;
  const todayCount = milestones.filter((item) => classifyMilestoneDueDate(item) === "today").length;
  const next7Count = milestones.filter((item) => classifyMilestoneDueDate(item) === "next7").length;
  const filterOptions: FilterOption[] = [
    { id: "all", label: "All", count: milestones.length },
    { id: "active", label: "Active", count: activeCount },
    { id: "in_progress", label: "In Progress", count: inProgressCount },
    { id: "today", label: "Today", count: todayCount },
    { id: "next7", label: "Next 7 Days", count: next7Count },
    { id: "overdue", label: "Overdue", count: overdueCount },
    { id: "done", label: "Done", count: doneCount },
  ];

  function nextOrderIndex() {
    if (allMilestones.length === 0) return 0;
    return Math.max(...allMilestones.map((m) => m.orderIndex)) + 1;
  }

  useEffect(() => {
    void loadProgressData();
  }, []);

  async function fetchWithTimeout(input: string, init?: RequestInit) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      return await fetch(input, {
        ...init,
        cache: "no-store",
        signal: controller.signal,
      });
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  async function loadProgressData(showSpinner = true) {
    if (showSpinner) setLoading(true);
    try {
      const [milestonesResult, eventsResult] = await Promise.allSettled([
        fetchWithTimeout("/api/milestones"),
        fetchWithTimeout("/api/events"),
      ]);

      if (milestonesResult.status === "rejected") {
        setToast({
          tone: "error",
          message: timeoutMessage(milestonesResult.reason) ?? "Could not load progress items.",
        });
        return;
      }

      const milestonesResponse = milestonesResult.value;
      if (milestonesResponse.status === 401) {
        router.push("/login");
        return;
      }
      if (!milestonesResponse.ok) {
        setToast({ tone: "error", message: "Could not load progress items." });
        return;
      }

      const data = (await milestonesResponse.json()) as MilestonesResponse;
      setAllMilestones(data.milestones ?? []);

      if (eventsResult.status === "fulfilled") {
        const eventsResponse = eventsResult.value;
        if (eventsResponse.status === 401) {
          router.push("/login");
          return;
        }

        if (eventsResponse.ok) {
          const eventsPayload = (await eventsResponse.json()) as EventsResponse;
          setEvents(eventsPayload.events ?? []);
        } else {
          setEvents([]);
        }
      } else {
        setEvents([]);
      }
    } catch (error) {
      setToast({
        tone: "error",
        message: timeoutMessage(error) ?? "Could not load progress items.",
      });
    } finally {
      if (showSpinner) setLoading(false);
    }
  }

  async function patchMilestone(id: number, payload: MilestonePatchPayload) {
    try {
      const response = await fetchWithTimeout(`/api/milestones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) return null;
      const data = (await response.json()) as MilestoneResponse;
      return data.milestone ?? null;
    } catch {
      return null;
    }
  }

  async function handleAdd(data: { title: string; description: string; dueDate: string }) {
    setAddBusy(true);
    try {
      const response = await fetchWithTimeout("/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, dueDate: data.dueDate || null, orderIndex: nextOrderIndex() }),
      });
      if (!response.ok) {
        setToast({ tone: "error", message: "Could not add milestone." });
        return;
      }
      const payload = (await response.json()) as MilestoneResponse;
      if (payload.milestone) {
        setAllMilestones((current) => [...current, payload.milestone as Milestone]);
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
        body: JSON.stringify({ title, description: description || null, status: "idea", orderIndex: nextOrderIndex() }),
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

  async function handleEditIdea(id: number, title: string, description: string): Promise<boolean> {
    setRowBusyId(id);
    const updated = await patchMilestone(id, { title, description: description || null });
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
    setToast({ tone: "success", message: "Moved to timeline." });
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
    setToast({ tone: status === "done" ? "success" : "info", message: `Milestone set to ${STATUS_TOAST_LABEL[status]}.` });
  }

  async function handleUpdateMilestone(id: number, update: MilestoneUpdate): Promise<boolean> {
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

  async function handleMoveMilestone(id: number, direction: "up" | "down", visibleIds: number[]) {
    const index = visibleIds.indexOf(id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (index === -1 || targetIndex < 0 || targetIndex >= visibleIds.length) return;

    const targetId = visibleIds[targetIndex];
    const current = allMilestones.find((item) => item.id === id);
    const target = allMilestones.find((item) => item.id === targetId);
    if (!current || !target) return;

    // Compute new orderIndex values — handle duplicate orderIndex gracefully
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
      await loadProgressData(false);
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

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleteBusy(true);
    try {
      const response = await fetchWithTimeout(`/api/milestones/${deleteId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        setToast({ tone: "error", message: "Could not delete." });
        return;
      }
      setDeleteId(null);
      setAllMilestones((current) =>
        current.filter((item) => item.id !== deleteId)
      );
      setToast({ tone: "success", message: "Deleted." });
    } catch (error) {
      setToast({
        tone: "error",
        message: timeoutMessage(error) ?? "Could not delete.",
      });
    } finally {
      setDeleteBusy(false);
    }
  }

  return {
    loading,
    addBusy,
    ideaBusy,
    events,
    rowBusyId,
    deleteId,
    deleteBusy,
    timelineFilter,
    toast,
    milestones,
    ideas,
    filteredMilestones,
    dueSoonMilestones,
    filterOptions,
    doneCount,
    activeCount,
    overdueCount,
    setTimelineFilter,
    setDeleteId,
    setToast,
    handleAdd,
    handleAddIdea,
    handleEditIdea,
    handlePromoteIdea,
    handleStatusChange,
    handleUpdateMilestone,
    handleMoveMilestone,
    confirmDelete,
  };
}
