import Link from "next/link";

import type { ModuleInfo } from "../course/module-section";

type ModuleSidebarProps = {
  courseId: number;
  courseTitle: string;
  activeModuleId: number;
  modules: ModuleInfo[];
};

export function ModuleSidebar({
  courseId,
  courseTitle,
  activeModuleId,
  modules,
}: ModuleSidebarProps) {
  return (
    <aside className="rounded-[1.8rem] border border-slate-200/80 bg-white/85 p-4 shadow-[0_24px_55px_rgba(15,23,42,0.06)] backdrop-blur dark:border-cyan-400/10 dark:bg-slate-950/55 xl:sticky xl:top-24 xl:h-fit">
      <Link
        href={`/courses/${courseId}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 transition hover:text-brand-700 dark:text-brand-100"
      >
        <span aria-hidden="true">&larr;</span>
        Back to modules
      </Link>

      <div className="mt-4 rounded-[1.4rem] border border-slate-200/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.95)_0%,rgba(248,250,252,0.92)_100%)] px-4 py-4 dark:border-slate-800 dark:bg-slate-900/80">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
          Course
        </p>
        <h2 className="dashboard-script-title block mt-2 text-[1.95rem] leading-[1.04]">
          {courseTitle}
        </h2>
        <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
          Jump between modules from here.
        </p>
      </div>

      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
            Modules
          </p>
          <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400">
            {modules.length}
          </span>
        </div>

        <div className="space-y-2">
          {modules.map((moduleRow) => {
            const active = moduleRow.id === activeModuleId;

            return (
              <Link
                key={moduleRow.id}
                href={`/modules/${moduleRow.id}`}
                className={`group flex items-center gap-3 rounded-[1.2rem] border px-3 py-3 transition ${
                  active
                    ? "border-brand-200 bg-brand-50/80 text-brand-700 shadow-sm dark:border-brand-400/20 dark:bg-brand-500/10 dark:text-brand-100"
                    : "border-transparent bg-slate-50/80 text-slate-600 hover:border-slate-200 hover:bg-white dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-2xl text-xs font-black transition ${
                    active
                      ? "bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] text-white shadow-[0_12px_30px_rgba(99,102,241,0.25)]"
                      : "bg-white text-slate-400 shadow-sm group-hover:text-brand-600 dark:bg-slate-950 dark:text-slate-500 dark:group-hover:text-brand-100"
                  }`}
                >
                  {String(moduleRow.orderIndex + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p
                    className={`truncate leading-tight ${
                      active
                        ? "dashboard-script-title block text-[1.18rem]"
                        : "block font-handwritten text-[1.02rem] font-bold tracking-tight text-slate-700 dark:text-slate-100"
                    }`}
                  >
                    {moduleRow.title}
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                    Module {moduleRow.orderIndex + 1}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
