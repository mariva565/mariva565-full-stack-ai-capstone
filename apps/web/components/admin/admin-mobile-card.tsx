import type { ReactNode } from "react";
import { PREMIUM_DARK_CARD_BG } from "../layout/premium-dark-styles";

type MetaField = {
  label: string;
  value: ReactNode;
};

type AdminMobileCardProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  meta?: MetaField[];
  checked?: boolean;
  onCheck?: () => void;
  dimmed?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  /** Extra action buttons besides Edit/Delete */
  extraActions?: ReactNode;
};

/**
 * Mobile card layout for admin data tables.
 * Shown on screens smaller than md (hidden on md+).
 * Mirrors the data and actions of a table row in a readable vertical layout.
 */
export function AdminMobileCard({
  title,
  subtitle,
  badge,
  meta = [],
  checked,
  onCheck,
  dimmed,
  onEdit,
  onDelete,
  extraActions,
}: AdminMobileCardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition dark:border-slate-700/60 ${PREMIUM_DARK_CARD_BG} ${
        dimmed ? "opacity-60" : ""
      } ${checked ? "border-brand-300 bg-brand-50/40 dark:border-brand-500/30 dark:bg-brand-500/5" : ""}`}
    >
      <div className="flex items-start gap-3">
        {onCheck !== undefined && (
          <input
            type="checkbox"
            checked={checked}
            onChange={onCheck}
            className="mt-0.5 rounded border-slate-300 dark:border-slate-600"
          />
        )}

        <div className="min-w-0 flex-1">
          {/* Title + badge row */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0 font-semibold text-slate-900 dark:text-white">{title}</div>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}

          {/* Meta fields */}
          {meta.length > 0 && (
            <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {meta.map((field) => (
                <div key={field.label} className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <dt className="font-medium text-slate-400 dark:text-slate-500">{field.label}:</dt>
                  <dd>{field.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {/* Actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            {extraActions}
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="rounded-full border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-600 transition hover:bg-brand-50 dark:border-brand-500/30 dark:text-brand-400 dark:hover:bg-brand-500/10"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
