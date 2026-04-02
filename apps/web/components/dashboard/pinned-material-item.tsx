import { motion } from "framer-motion";
import Link from "next/link";

import { MaterialTypePill } from "../materials/material-type-pill";
import { TagList } from "../materials/tag-list";
import { parseTags } from "../../lib/materials";
import type { PinnedMaterial } from "./types";

type PinnedMaterialItemProps = {
  item: PinnedMaterial;
};

export function PinnedMaterialItem({ item }: PinnedMaterialItemProps) {
  const tags = parseTags(item.tags);

  return (
    <motion.li
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="rounded-[1.35rem] border border-slate-200/80 bg-white/92 p-4 shadow-sm transition hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:border-cyan-400/10 dark:bg-slate-950/55 dark:hover:shadow-[0_20px_45px_rgba(6,182,212,0.06)]"
    >
      <Link
        href={`/materials/${item.materialId}`}
        className="text-base font-semibold text-brand-700 transition-colors hover:text-brand-600 dark:text-brand-100 dark:hover:text-cyan-200"
      >
        {item.materialTitle}
      </Link>

      <div className="mt-2 flex items-center gap-2">
        <MaterialTypePill type={item.materialType} />
        <Link
          href={`/modules/${item.moduleId}`}
          className="truncate text-xs font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-100"
        >
          {item.moduleTitle}
        </Link>
      </div>

      <TagList tags={tags} />
    </motion.li>
  );
}
