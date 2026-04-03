import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CollectionIcon,
  PencilIcon,
  TrashIcon,
} from "../ui/action-icons";

type ModuleInfo = {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  orderIndex: number;
};

type ModuleSectionProps = {
  module: ModuleInfo;
  isFirst: boolean;
  isLast: boolean;
  moveBusy: boolean;
  onUpdateModule: (moduleId: number, title: string, description: string) => Promise<boolean>;
  onDeleteModule: (moduleId: number) => void;
  onMoveModule: (moduleId: number, direction: "up" | "down") => void;
};

export function ModuleSection({
  module,
  isFirst,
  isLast,
  moveBusy,
  onUpdateModule,
  onDeleteModule,
  onMoveModule,
}: ModuleSectionProps) {
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [titleDraft, setTitleDraft] = useState(module.title);
  const [descriptionDraft, setDescriptionDraft] = useState(module.description ?? "");
  const [renameBusy, setRenameBusy] = useState(false);

  useEffect(() => {
    setTitleDraft(module.title);
    setDescriptionDraft(module.description ?? "");
  }, [module.description, module.title]);

  async function handleRenameSubmit(event: FormEvent) {
    event.preventDefault();
    setRenameBusy(true);
    const success = await onUpdateModule(module.id, titleDraft, descriptionDraft);
    setRenameBusy(false);

    if (success) {
      setIsEditingDetails(false);
    }
  }

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group relative overflow-hidden rounded-[1.8rem] border border-slate-200/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(248,250,252,0.95)_58%,rgba(238,242,255,0.92)_100%)] p-5 shadow-[0_24px_55px_rgba(15,23,42,0.08)] dark:border-cyan-400/10 dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12)_0%,rgba(34,211,238,0)_28%),linear-gradient(160deg,rgba(15,23,42,0.97)_0%,rgba(9,17,34,0.96)_55%,rgba(6,10,24,0.98)_100%)]"
    >
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/70 to-transparent dark:via-cyan-300/70" />
      <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-brand-100/90 blur-3xl transition duration-300 group-hover:scale-110 dark:bg-cyan-500/10" />

      <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-4">
            <div className="relative flex-none">
              <div className="absolute inset-1 rounded-[1rem] bg-brand-300/40 opacity-0 blur-xl transition duration-300 group-hover:opacity-100 dark:bg-cyan-400/20" />
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-white via-brand-50 to-cyan-50 text-sm font-black text-brand-600 shadow-sm ring-1 ring-brand-100 transition duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:-rotate-[10deg] group-hover:bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] group-hover:text-white group-hover:shadow-[0_12px_28px_rgba(99,102,241,0.28)] group-hover:ring-0 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:text-cyan-100 dark:ring-cyan-400/10 dark:group-hover:shadow-[0_12px_28px_rgba(34,211,238,0.18)]">
                {String(module.orderIndex + 1).padStart(2, "0")}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
                Module
              </p>
              {isEditingDetails ? (
                <form onSubmit={handleRenameSubmit} className="mt-2 space-y-3">
                  <input
                    type="text"
                    value={titleDraft}
                    onChange={(event) => setTitleDraft(event.target.value)}
                    className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-200/50 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
                    placeholder="Module title"
                  />
                  <textarea
                    value={descriptionDraft}
                    onChange={(event) => setDescriptionDraft(event.target.value)}
                    rows={3}
                    className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-200/50 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200 dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
                    placeholder="Optional module description"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={renameBusy}
                      className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                    >
                      {renameBusy ? "Saving..." : "Save changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingDetails(false);
                        setTitleDraft(module.title);
                        setDescriptionDraft(module.description ?? "");
                      }}
                      className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
                ) : (
                  <>
                    <h2 className="dashboard-script-title mt-2 block max-w-3xl text-[clamp(1.55rem,2.35vw,2rem)] leading-[1.12]">
                      {module.title}
                    </h2>
                  {module.description?.trim() ? (
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {module.description.trim()}
                    </p>
                    ) : null}
                    <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                      Open this module to add, search, and pin its materials.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

        <div className="flex flex-wrap gap-2 xl:justify-end">
          <Link
            href={`/modules/${module.id}`}
            title="Open module"
            aria-label="Open module"
            className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(99,102,241,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(99,102,241,0.28)]"
          >
            <CollectionIcon />
            <span>Open module</span>
          </Link>
          {!isEditingDetails ? (
            <button
              type="button"
              onClick={() => setIsEditingDetails(true)}
              title="Edit module details"
              aria-label="Edit module details"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <PencilIcon />
            </button>
          ) : null}
          <button
            type="button"
            disabled={moveBusy || isFirst}
            onClick={() => onMoveModule(module.id, "up")}
            title="Move module up"
            aria-label="Move module up"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:-translate-y-0.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowUpIcon />
          </button>
          <button
            type="button"
            disabled={moveBusy || isLast}
            onClick={() => onMoveModule(module.id, "down")}
            title="Move module down"
            aria-label="Move module down"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:-translate-y-0.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowDownIcon />
          </button>
          <button
            type="button"
            onClick={() => onDeleteModule(module.id)}
            title="Delete module"
            aria-label="Delete module"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-red-200 text-red-600 transition hover:-translate-y-0.5 hover:bg-red-50 dark:border-red-900/70 dark:text-red-300 dark:hover:bg-red-950/40"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export type { ModuleInfo };
