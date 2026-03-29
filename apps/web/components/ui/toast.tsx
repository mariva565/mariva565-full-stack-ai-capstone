"use client";

import { useEffect } from "react";

export type ToastTone = "success" | "error" | "info";

type ToastProps = {
  message: string;
  tone: ToastTone;
  onClose: () => void;
};

const TOAST_TONE_CLASS: Record<ToastTone, string> = {
  success:
    "border-green-200 bg-green-50 text-green-800 dark:border-green-900/60 dark:bg-green-900/20 dark:text-green-300",
  error:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300",
  info: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/60 dark:bg-sky-900/20 dark:text-sky-300",
};

export function Toast({ message, tone, onClose }: ToastProps) {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onClose();
    }, 3600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:inset-x-auto sm:right-4 sm:top-4">
      <div
        role="status"
        className={`w-full max-w-md rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur ${TOAST_TONE_CLASS[tone]}`}
      >
        <div className="flex items-center justify-between gap-3">
          <p>{message}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-current/20 px-2 py-1 text-xs font-semibold hover:bg-white/40 dark:hover:bg-slate-900/30"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
