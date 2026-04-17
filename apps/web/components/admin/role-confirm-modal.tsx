"use client";

import { PREMIUM_DARK_MODAL_BG } from "../layout/premium-dark-styles";

type RoleConfirmModalProps = {
  isOpen: boolean;
  userName: string;
  currentRole: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function RoleConfirmModal({ isOpen, userName, currentRole, busy, onConfirm, onCancel }: RoleConfirmModalProps) {
  if (!isOpen) return null;

  const isGranting = currentRole === "user";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-cyan-400/10 ${PREMIUM_DARK_MODAL_BG}`}
      >
        <div className="flex flex-col items-center text-center">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${isGranting ? "bg-brand-100 dark:bg-brand-500/20" : "bg-red-100 dark:bg-red-500/20"}`}>
            <svg className={`h-6 w-6 ${isGranting ? "text-brand-600 dark:text-brand-400" : "text-red-600 dark:text-red-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {isGranting ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
              )}
            </svg>
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
            {isGranting ? "Grant Admin Access" : "Revoke Admin Access"}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {isGranting
              ? `Grant admin privileges to ${userName}? They will have full access to the admin dashboard.`
              : `Revoke admin privileges from ${userName}? They will lose access to the admin dashboard.`}
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
              isGranting
                ? "bg-brand-500 hover:bg-brand-600"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {busy ? "Working..." : isGranting ? "Grant Access" : "Revoke Access"}
          </button>
        </div>
      </div>
    </div>
  );
}
