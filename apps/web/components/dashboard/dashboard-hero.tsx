import { motion } from "framer-motion";
import { ArrowLeftIcon } from "../auth/auth-icons";
import { DashboardActionButton, DashboardPill } from "./dashboard-controls";

type DashboardHeroProps = {
  courseCount: number;
  draftCount: number;
  pinnedCount: number;
  showCreateForm: boolean;
  onToggleCreateForm: () => void;
};

type StatCardProps = {
  label: string;
  value: number;
};

type HeroActionsProps = {
  showCreateForm: boolean;
  onToggleCreateForm: () => void;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="rounded-[1.4rem] border border-white/90 bg-white/92 px-4 py-3 shadow-[0_18px_45px_rgba(99,102,241,0.09)] backdrop-blur dark:border-white/10 dark:bg-[radial-gradient(circle_at_82%_16%,rgba(226,232,240,0.12)_0%,rgba(148,163,184,0.07)_18%,rgba(15,23,42,0)_42%),linear-gradient(160deg,rgba(15,24,48,0.9)_0%,rgba(8,16,38,0.9)_58%,rgba(5,12,28,0.94)_100%)] dark:shadow-[0_18px_45px_rgba(6,182,212,0.12)]"
    >
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-cyan-100/70">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{value}</p>
    </motion.div>
  );
}

function HeroHeading() {
  return (
    <div className="max-w-2xl">
      <DashboardPill tone="brand" className="uppercase tracking-[0.24em] shadow-sm">
        Workspace Board
      </DashboardPill>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] shadow-[0_18px_35px_rgba(99,102,241,0.25)] transition duration-300 hover:-translate-y-0.5 hover:rotate-[-5deg] hover:scale-[1.03] dark:shadow-[0_20px_40px_rgba(6,182,212,0.2)]">
          <div className="flex items-end gap-1">
            <span className="h-5 w-1.5 rounded-full bg-white/95" />
            <span className="h-7 w-1.5 rounded-full bg-white/80" />
            <span className="h-4 w-1.5 rounded-full bg-white/70" />
          </div>
        </div>

        <div>
          <h1 className="dashboard-script-title text-4xl sm:text-5xl">
            Dashboard
          </h1>
          <p className="mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-300">
            Welcome back. Your courses, quick ideas, and pinned study pieces now
            live in one softer, faster workspace.
          </p>
        </div>
      </div>
    </div>
  );
}

function HeroActions({ showCreateForm, onToggleCreateForm }: HeroActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <DashboardActionButton
        href="/"
        size="md"
        variant="secondary"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        <span>Back to Home</span>
      </DashboardActionButton>

      <DashboardActionButton
        onClick={onToggleCreateForm}
        size="md"
        variant="primary"
      >
        {showCreateForm ? "Close form" : "+ New Course"}
      </DashboardActionButton>
    </div>
  );
}

export function DashboardHero({
  courseCount,
  draftCount,
  pinnedCount,
  showCreateForm,
  onToggleCreateForm,
}: DashboardHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(238,242,255,0.9)_52%,rgba(236,254,255,0.9)_100%)] p-6 shadow-[0_28px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-cyan-400/12 dark:bg-[radial-gradient(circle_at_28%_30%,rgba(168,85,247,0.2)_0%,rgba(124,58,237,0.12)_20%,rgba(15,23,42,0)_46%),radial-gradient(circle_at_82%_16%,rgba(226,232,240,0.18)_0%,rgba(148,163,184,0.11)_18%,rgba(15,23,42,0)_42%),linear-gradient(160deg,rgba(15,24,48,0.98)_0%,rgba(8,16,38,0.96)_58%,rgba(5,12,28,0.98)_100%)] dark:shadow-[0_30px_90px_rgba(2,12,27,0.72),0_0_42px_rgba(6,182,212,0.06)]">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/80 to-transparent dark:via-cyan-300/80" />
      <div className="pointer-events-none absolute -left-12 top-8 h-56 w-56 rounded-full bg-brand-200/55 blur-3xl dark:bg-brand-500/16" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-cyan-200/60 blur-3xl dark:bg-cyan-500/10" />
      <div className="pointer-events-none absolute -right-6 top-[-1.25rem] hidden h-44 w-44 rounded-full bg-white/14 blur-3xl dark:block" />
      <div className="pointer-events-none absolute left-[11rem] top-[4.5rem] hidden h-36 w-36 rounded-full bg-brand-500/10 blur-3xl dark:block" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <HeroHeading />
        <HeroActions
          showCreateForm={showCreateForm}
          onToggleCreateForm={onToggleCreateForm}
        />
      </div>

      <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Courses" value={courseCount} />
        <StatCard label="Drafts" value={draftCount} />
        <StatCard label="Pinned Materials" value={pinnedCount} />
      </div>
    </section>
  );
}
