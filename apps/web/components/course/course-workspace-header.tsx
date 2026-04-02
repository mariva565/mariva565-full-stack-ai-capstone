import type { FormEvent } from "react";
import Link from "next/link";

type CourseWorkspaceHeaderProps = {
  title: string;
  description: string | null;
  moduleCount: number;
  showModuleForm: boolean;
  newModuleTitle: string;
  newModuleDescription: string;
  onToggleModuleForm: () => void;
  onModuleTitleChange: (value: string) => void;
  onModuleDescriptionChange: (value: string) => void;
  onCreateModule: (event: FormEvent) => void;
};

export function CourseWorkspaceHeader({
  title,
  description,
  moduleCount,
  showModuleForm,
  newModuleTitle,
  newModuleDescription,
  onToggleModuleForm,
  onModuleTitleChange,
  onModuleDescriptionChange,
  onCreateModule,
}: CourseWorkspaceHeaderProps) {
  return (
    <>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 transition hover:text-brand-700 dark:text-brand-100"
      >
        <span aria-hidden="true">&larr;</span>
        Back to dashboard
      </Link>

      <section className="relative mt-4 overflow-hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(248,250,252,0.94)_58%,rgba(238,242,255,0.92)_100%)] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] dark:border-cyan-400/10 dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12)_0%,rgba(34,211,238,0)_28%),linear-gradient(160deg,rgba(15,23,42,0.97)_0%,rgba(10,18,38,0.96)_54%,rgba(6,12,28,0.98)_100%)]">
        <div className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-fuchsia-200/70 blur-3xl dark:bg-fuchsia-500/10" />
        <div className="pointer-events-none absolute left-0 top-10 h-28 w-28 rounded-full bg-cyan-200/60 blur-3xl dark:bg-cyan-500/10" />
        <div className="relative">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-slate-400 dark:text-slate-500">
                Course
              </p>
              <h1 className="dashboard-script-title mt-3 text-4xl md:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                {description || "Start with modules, then open one to collect notes, links, and file references."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-brand-200/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700 shadow-sm dark:border-brand-400/20 dark:bg-brand-500/10 dark:text-brand-100">
                  {moduleCount} {moduleCount === 1 ? "module" : "modules"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleModuleForm}
              className={`group inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                showModuleForm
                  ? "border border-slate-200 bg-white/85 text-slate-700 hover:-translate-y-0.5 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800"
                  : "bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] text-white shadow-[0_20px_45px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(99,102,241,0.32)]"
              }`}
            >
              {showModuleForm ? (
                "Close"
              ) : (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block text-base leading-none transition duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-1 group-hover:scale-110 group-hover:rotate-90">
                    +
                  </span>
                  <span>New module</span>
                </span>
              )}
            </button>
          </div>

          <div className="mt-5 rounded-[1.4rem] border border-brand-200/80 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm backdrop-blur dark:border-brand-400/15 dark:bg-slate-900/60 dark:text-slate-300">
            Build the outline first. Materials stay tucked inside each module.
          </div>

          {showModuleForm ? (
            <form
              onSubmit={onCreateModule}
              className="mt-5 rounded-[1.6rem] border border-slate-200/80 bg-white/85 p-4 shadow-sm backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/65"
            >
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                      Module title
                    </label>
                    <input
                      type="text"
                      value={newModuleTitle}
                      onChange={(event) => onModuleTitleChange(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-200/50 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
                      placeholder="e.g. React Fundamentals"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                      Module description
                    </label>
                    <textarea
                      value={newModuleDescription}
                      onChange={(event) => onModuleDescriptionChange(event.target.value)}
                      rows={3}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-200/50 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
                      placeholder="Optional note about what this module covers"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  Create module
                </button>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Optional description shown on the module card.
              </p>
            </form>
          ) : null}
        </div>
      </section>
    </>
  );
}
