"use client";

import { useEffect } from "react";

const ADMIN_MANUAL_REFRESH_EVENT = "studyhub:admin-manual-refresh";
const ADMIN_DATA_CHANGED_EVENT = "studyhub:admin-data-changed";

type AdminRefreshOptions = {
  onManualRefresh?: () => void;
  onDataChanged?: () => void;
  pollMs?: number;
};

function dispatchAdminEvent(eventName: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(eventName));
}

export function dispatchAdminManualRefresh() {
  dispatchAdminEvent(ADMIN_MANUAL_REFRESH_EVENT);
}

export function dispatchAdminDataChanged() {
  dispatchAdminEvent(ADMIN_DATA_CHANGED_EVENT);
}

export function useAdminRefresh({
  onManualRefresh,
  onDataChanged,
  pollMs,
}: AdminRefreshOptions) {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleManualRefresh = () => {
      onManualRefresh?.();
    };
    const handleDataChanged = () => {
      onDataChanged?.();
    };

    if (onManualRefresh) {
      window.addEventListener(ADMIN_MANUAL_REFRESH_EVENT, handleManualRefresh);
    }
    if (onDataChanged) {
      window.addEventListener(ADMIN_DATA_CHANGED_EVENT, handleDataChanged);
    }

    const intervalId =
      pollMs && pollMs > 0
        ? window.setInterval(() => {
            onDataChanged?.();
          }, pollMs)
        : null;

    return () => {
      if (onManualRefresh) {
        window.removeEventListener(
          ADMIN_MANUAL_REFRESH_EVENT,
          handleManualRefresh
        );
      }
      if (onDataChanged) {
        window.removeEventListener(ADMIN_DATA_CHANGED_EVENT, handleDataChanged);
      }
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [onDataChanged, onManualRefresh, pollMs]);
}
