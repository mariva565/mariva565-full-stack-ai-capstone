"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { fetchWithTimeout, timeoutMessage } from "./use-progress-request";
import type { Milestone } from "./types";
import type { ToastState } from "./use-progress-page-state.types";

type UseProgressDeleteMutationParams = {
  setAllMilestones: Dispatch<SetStateAction<Milestone[]>>;
  setToast: Dispatch<SetStateAction<ToastState | null>>;
};

export function useProgressDeleteMutation({
  setAllMilestones,
  setToast,
}: UseProgressDeleteMutationParams) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

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
    confirmDelete,
    deleteBusy,
    deleteId,
    setDeleteId,
  };
}
