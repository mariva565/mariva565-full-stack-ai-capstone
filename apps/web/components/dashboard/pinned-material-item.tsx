import Link from "next/link";

import { MaterialTypePill } from "../materials/material-type-pill";
import { TagList } from "../materials/tag-list";
import { parseTags } from "../../lib/materials";

export type PinnedMaterial = {
  id: number;
  materialId: number;
  materialTitle: string;
  materialType: string;
  tags: string | null;
  courseId: number;
  courseTitle: string;
};

type PinnedMaterialItemProps = {
  item: PinnedMaterial;
};

export function PinnedMaterialItem({ item }: PinnedMaterialItemProps) {
  const tags = parseTags(item.tags);

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <Link
        href={`/materials/${item.materialId}`}
        className="text-sm font-semibold text-slate-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-100"
      >
        {item.materialTitle}
      </Link>

      <div className="mt-2 flex items-center gap-2">
        <MaterialTypePill type={item.materialType} />
        <Link
          href={`/courses/${item.courseId}`}
          className="truncate text-xs font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-100"
        >
          {item.courseTitle}
        </Link>
      </div>

      <TagList tags={tags} />
    </li>
  );
}
