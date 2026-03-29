import { materialTypeLabel, normalizeMaterialType } from "../../lib/materials";

type MaterialTypePillProps = {
  type: string | null | undefined;
};

const TYPE_STYLES = {
  note: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  link: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  file: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
} as const;

const TYPE_DOT_STYLES = {
  note: "bg-amber-500",
  link: "bg-sky-500",
  file: "bg-emerald-500",
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
