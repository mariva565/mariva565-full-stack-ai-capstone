import Link from "next/link";
import { MaterialTypePill } from "../materials/material-type-pill";
import type { SharedMaterial } from "./types";

export function SharedMaterialItem({ item }: { item: SharedMaterial }) {
  const formattedDate = new Date(item.sharedAt).toLocaleDateString();

  return (
    <li className="group relative overflow-hidden rounded-[1.25rem] border border-slate-200bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/materials/${item.id}`}
          className="font-semibold text-slate-800 transition group-hover:text-cyan-600 dark:text-slate-100 dark:group-hover:text-cyan-400"
        >
          {item.title}
        </Link>
        <span className="shrink-0 rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300">
          Shared
        </span>
      </div>

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Shared by {item.sharedBy.name || item.sharedBy.email} on {formattedDate}
      </p>

      {item.snippet ? (
        <p className="mt-2 text-xs italic text-slate-600 line-clamp-2 dark:text-slate-400">
          "{item.snippet}"
        </p>
      ) : null}

      <div className="mt-3 flex items-center gap-2">
        <MaterialTypePill type={item.materialType} />
        <span className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 flex-1 text-right">
          {item.context}
        </span>
      </div>
    </li>
  );
}
