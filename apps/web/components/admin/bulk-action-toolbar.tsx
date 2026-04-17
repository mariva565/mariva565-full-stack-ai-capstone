"use client";

import { PREMIUM_DARK_BUTTON } from "../layout/premium-dark-styles";

type BulkActionToolbarProps = {
  selectedCount: number;
  onDelete: () => void;
  onCancel: () => void;
  busy?: boolean;
};

export function BulkActionToolbar({ selectedCount, onDelete, onCancel, busy }: BulkActionToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 px-6 py-3 shadow-lg backdrop-blur-lg dark:border-cyan-400/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.9)_0%,rgba(7,12,25,0.96)_100%)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {selectedCount} selected
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className={`rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700/60 ${PREMIUM_DARK_BUTTON}`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {busy ? "Deleting..." : "Delete Selected"}
          </button>
        </div>
      </div>
    </div>
  );
}
