import Link from "next/link";

import { MaterialTypePill } from "../materials/material-type-pill";
import { TagList } from "../materials/tag-list";
import { parseTags } from "../../lib/materials";

type PinnedModuleMaterial = {
  materialId: number;
  materialTitle: string;
  materialType: string;
  tags: string | null;
};

type ModulePinnedSidebarProps = {
  items: PinnedModuleMaterial[];
};

export function ModulePinnedSidebar({ items }: ModulePinnedSidebarProps) {
  return (
    <aside className="rounded-[1.8rem] border border-slate-200/80 bg-white/85 p-4 shadow-[0_24px_55px_rgba(15,23,42,0.06)] backdrop-blur dark:border-cyan-400/10 dark:bg-slate-950/55 xl:sticky xl:top-24 xl:h-fit">
      <div className="rounded-[1.4rem] border border-slate-200/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.95)_0%,rgba(248,250,252,0.92)_100%)] px-4 py-4 dark:border-slate-800 dark:bg-slate-900/80">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
          Quick Access
        </p>
        <h2 className="dashboard-panel-title block mt-2 text-[1.85rem] leading-[1.12]">
          Pinned
        </h2>
      </div>

      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-[1.3rem] border border-dashed border-slate-300/80 bg-slate-50/80 px-4 py-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
            Pin something to keep it close.
          </div>
        ) : (
          items.map((item) => (
            <Link
              key={item.materialId}
              href={`/materials/${item.materialId}`}
              className="group block rounded-[1.35rem] border border-slate-200/80 bg-white/90 p-4 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/80 dark:hover:shadow-[0_18px_40px_rgba(6,182,212,0.06)]"
            >
              <p className="dashboard-script-title block text-[1.25rem] leading-[1.12] transition duration-300 group-hover:translate-x-0.5">
                {item.materialTitle}
              </p>
              <div className="mt-2">
                <MaterialTypePill type={item.materialType} />
              </div>
              <TagList tags={parseTags(item.tags)} />
            </Link>
          ))
        )}
      </div>
    </aside>
  );
}
