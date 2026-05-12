import { MaterialTypePill } from "./material-type-pill";
import type { MaterialDetail, MaterialPageData } from "./types";
import { WayfindingBreadcrumbs } from "../ui/wayfinding-breadcrumbs";
import { slugify } from "../../lib/slugify";

type MaterialPageHeaderProps = {
  course: MaterialPageData["course"];
  moduleInfo: MaterialPageData["module"];
  material: MaterialDetail;
  pageTitle: string;
  isEditing: boolean;
  isPinned: boolean;
};

export function MaterialPageHeader({
  course,
  moduleInfo,
  material,
  pageTitle,
  isEditing,
  isPinned,
}: MaterialPageHeaderProps) {
  return (
    <div className="rounded-[2rem] border border-white/60 bg-[linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(248,250,252,0.94)_58%,rgba(238,242,255,0.92)_100%)] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] dark:border-cyan-400/10 dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12)_0%,rgba(34,211,238,0)_26%),linear-gradient(160deg,rgba(15,23,42,0.97)_0%,rgba(9,17,34,0.96)_55%,rgba(6,12,28,0.98)_100%)]">
      <a
        href={`/modules/${moduleInfo.id}/${slugify(moduleInfo.title)}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition hover:-translate-x-0.5 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to {moduleInfo.title}
      </a>

      <WayfindingBreadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: course.title, href: `/courses/${course.id}/${slugify(course.title)}` },
          {
            label: moduleInfo.title,
            href: `/modules/${moduleInfo.id}/${slugify(moduleInfo.title)}`,
          },
          { label: pageTitle },
        ]}
      />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-slate-400 dark:text-slate-500">
            Material
          </p>
          <h1 className="dashboard-script-title mt-3 text-[clamp(2.5rem,5vw,4rem)]">
            {pageTitle}
          </h1>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <MaterialTypePill type={material.materialType} />
        <span className="rounded-full border border-brand-200/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700 shadow-sm dark:border-brand-400/20 dark:bg-brand-500/10 dark:text-brand-100">
          Module {moduleInfo.orderIndex + 1}
        </span>
        {isEditing ? (
          <span className="rounded-full border border-violet-200/80 bg-violet-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-100">
            Editing material
          </span>
        ) : null}
        {isPinned ? (
          <span className="rounded-full border border-cyan-200/80 bg-cyan-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-500/10 dark:text-cyan-100">
            Pinned to quick access
          </span>
        ) : null}
      </div>
    </div>
  );
}
