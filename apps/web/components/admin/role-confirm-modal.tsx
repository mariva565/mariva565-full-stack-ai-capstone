"use client";

import { useState } from "react";
import { PREMIUM_DARK_MODAL_BG } from "../layout/premium-dark-styles";

type RoleConfirmModalProps = {
  isOpen: boolean;
  userName: string;
  currentRole: string;
  busy?: boolean;
  onConfirm: (newRole: string) => void;
  onCancel: () => void;
};

const ROLES = ["user", "mentor", "admin"] as const;

const descriptions: Record<string, string> = {
  user: "Standard student access — courses, materials, community.",
  mentor: "Student access + Mentor Inbox for answering questions in assigned courses.",
  admin: "Full access including Admin Panel, moderation, and user management.",
};

export function RoleConfirmModal({ isOpen, userName, currentRole, busy, onConfirm, onCancel }: RoleConfirmModalProps) {
  const [selected, setSelected] = useState(currentRole);

  // Reset selection when modal opens for a different user
  const handleConfirm = () => {
    if (selected !== currentRole) onConfirm(selected);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-cyan-400/10 ${PREMIUM_DARK_MODAL_BG}`}
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20">
            <svg className="h-6 w-6 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
            Change Role
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {userName} — currently <span className="font-medium">{currentRole}</span>
          </p>
        </div>

        <div className="mt-5 space-y-2">
          {ROLES.map((role) => (
            <label
              key={role}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                selected === role
                  ? "border-brand-400 bg-brand-50 dark:border-brand-500/40 dark:bg-brand-500/10"
                  : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              } ${role === currentRole ? "opacity-60" : ""}`}
            >
              <input
                type="radio"
                name="role"
                value={role}
                checked={selected === role}
                onChange={() => setSelected(role)}
                className="mt-0.5 accent-brand-500"
              />
              <div className="text-left">
                <span className="text-sm font-semibold capitalize text-slate-900 dark:text-white">{role}</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">{descriptions[role]}</p>
              </div>
            </label>
          ))}
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
            onClick={handleConfirm}
            disabled={busy || selected === currentRole}
            className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {busy ? "Working..." : "Change Role"}
          </button>
        </div>
      </div>
    </div>
  );
}
