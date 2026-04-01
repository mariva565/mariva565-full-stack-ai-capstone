import { materialTypeLabel, normalizeMaterialType } from "../../lib/materials";

type MaterialTypePillProps = {
  type: string | null | undefined;
};

const TYPE_STYLES = {
  note:
    "border border-slate-200/80 bg-white/90 text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300",
  link:
    "border border-slate-200/80 bg-white/90 text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300",
  file:
    "border border-slate-200/80 bg-white/90 text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300",
} as const;

const TYPE_DOT_STYLES = {
  note: "bg-brand-500",
  link: "bg-cyan-500",
  file: "bg-slate-400 dark:bg-slate-500",
} as const;

export function MaterialTypePill({ type }: MaterialTypePillProps) {
  const normalizedType = normalizeMaterialType(type);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${TYPE_STYLES[normalizedType]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${TYPE_DOT_STYLES[normalizedType]}`} />
      {materialTypeLabel(normalizedType)}
    </span>
  );
}
