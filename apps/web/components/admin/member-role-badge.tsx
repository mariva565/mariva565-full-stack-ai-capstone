"use client";

import { PREMIUM_DARK_BUTTON } from "../layout/premium-dark-styles";

type MemberRoleBadgeProps = {
  role: string;
  busy: boolean;
  onClick: () => void;
};

export function MemberRoleBadge({ role, busy, onClick }: MemberRoleBadgeProps) {
  const isMentor = role === "mentor";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      title="Click to toggle role"
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
        isMentor
          ? "bg-brand-100 text-brand-700 hover:bg-brand-200 dark:bg-brand-500/20 dark:text-brand-100 dark:hover:bg-brand-500/30"
          : `bg-slate-100 text-slate-600 hover:bg-slate-200 dark:border dark:border-slate-700/60 ${PREMIUM_DARK_BUTTON}`
      }`}
    >
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {isMentor ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        )}
      </svg>
      {role}
    </button>
  );
}
