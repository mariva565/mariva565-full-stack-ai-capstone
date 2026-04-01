import Link from "next/link";

import { MaterialTypePill } from "../materials/material-type-pill";
import { TagList } from "../materials/tag-list";
import type { CourseMaterial } from "../../lib/course-materials";
import { parseTags } from "../../lib/materials";

type MaterialRowProps = {
  material: CourseMaterial;
  isPinned: boolean;
  pinBusy: boolean;
  onTogglePin: (materialId: number, isPinned: boolean) => void;
};

function getContentPreview(content: string | null): string | null {
  const normalized = content?.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return null;
  }

  if (normalized.length <= 160) {
    return normalized;
  }

  return `${normalized.slice(0, 157).trimEnd()}...`;
}

export function MaterialRow({
  material,
  isPinned,
  pinBusy,
  onTogglePin,
}: MaterialRowProps) {
  const tags = parseTags(material.tags);
  const preview = getContentPreview(material.content);

  return (
    <li className="px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            href={`/materials/${material.id}`}
            className="text-sm font-semibold text-slate-900 transition-colors hover:text-brand-600 dark:text-white dark:hover:text-brand-100"
          >
            {material.title}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <MaterialTypePill type={material.materialType} />
            {material.fileUrl && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                Has attachment
              </span>
            )}
          </div>
          {preview && (
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {preview}
            </p>
          )}
          <TagList tags={tags} />
        </div>

        <button
          type="button"
          disabled={pinBusy}
          onClick={() => onTogglePin(material.id, isPinned)}
          className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            isPinned
              ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
              : "border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          }`}
        >
          {isPinned ? "Pinned" : "Pin"}
        </button>
      </div>
    </li>
  );
}
