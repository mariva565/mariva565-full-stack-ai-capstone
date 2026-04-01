import { motion } from "framer-motion";
import Link from "next/link";
import {
  DashboardActionButton,
  DashboardPill,
} from "./dashboard-controls";

type Course = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
};

type CourseCardProps = {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (courseId: number) => void;
};

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function CourseCardGlyph() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-[1.15rem] bg-gradient-to-br from-brand-50 via-white to-cyan-50 text-brand-500 shadow-sm ring-1 ring-brand-100 transition duration-300 group-hover:-translate-y-0.5 group-hover:rotate-[-4deg] group-hover:scale-[1.03] dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:text-cyan-100 dark:ring-cyan-400/10">
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]">
        <path d="M6.5 5.5h7a3 3 0 0 1 3 3v10l-3-1.8-3 1.8-3-1.8-3 1.8v-10a3 3 0 0 1 3-3Z" />
        <path d="M9 8.5h5.5" />
      </svg>
    </div>
  );
}

export function CourseCard({ course, onEdit, onDelete }: CourseCardProps) {
  const statusTone =
    course.status === "published"
      ? "cyan"
      : course.status === "draft"
        ? "brand"
        : "neutral";

  return (
    <motion.article
      whileHover={{ y: -7 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="group relative overflow-hidden rounded-[1.8rem] border border-slate-200/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(248,250,252,0.94)_60%,rgba(238,242,255,0.92)_100%)] p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition hover:shadow-[0_26px_60px_rgba(99,102,241,0.14)] dark:border-cyan-400/10 dark:bg-[radial-gradient(circle_at_80%_14%,rgba(226,232,240,0.14)_0%,rgba(148,163,184,0.08)_18%,rgba(15,23,42,0)_42%),linear-gradient(160deg,rgba(15,24,48,0.96)_0%,rgba(8,16,38,0.95)_58%,rgba(5,12,28,0.98)_100%)] dark:hover:shadow-[0_28px_65px_rgba(6,182,212,0.1),0_0_28px_rgba(124,58,237,0.08)]"
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/70 to-transparent dark:via-cyan-300/70" />
      <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-brand-100/80 blur-2xl transition duration-500 group-hover:scale-110 dark:bg-cyan-500/10" />
      <div className="pointer-events-none absolute -right-8 top-[-1rem] hidden h-24 w-24 rounded-full bg-white/10 blur-3xl dark:block" />
      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <CourseCardGlyph />
            <div className="min-w-0">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                Created {new Date(course.createdAt).toLocaleDateString()}
              </p>
              <Link
                href={`/courses/${course.id}`}
                className="dashboard-script-title mt-1 block truncate text-2xl transition duration-300 group-hover:translate-x-0.5"
              >
                {course.title}
              </Link>
            </div>
          </div>

          <DashboardPill tone={statusTone}>
            {formatStatus(course.status)}
          </DashboardPill>
        </div>

        <p className="mt-4 min-h-12 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {course.description || "No description yet."}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200/70 pt-4 dark:border-slate-700/70">
          <DashboardPill tone="brand" className="uppercase tracking-[0.18em]">
            Course card
          </DashboardPill>

          <div className="flex items-center gap-2">
            <DashboardActionButton
              onClick={() => onEdit(course)}
              variant="secondary"
            >
              Edit
            </DashboardActionButton>
            <DashboardActionButton
              onClick={() => onDelete(course.id)}
              variant="danger"
            >
              Delete
            </DashboardActionButton>
            <DashboardActionButton
              href={`/courses/${course.id}`}
              variant="primary"
            >
              Open
            </DashboardActionButton>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
