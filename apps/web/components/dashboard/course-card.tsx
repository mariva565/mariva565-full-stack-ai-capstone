import { motion } from "framer-motion";
import Link from "next/link";
import {
  DashboardActionButton,
  DashboardPill,
} from "./dashboard-controls";
import type { DashboardCourse } from "./types";

type CourseCardProps = {
  course: DashboardCourse;
  onEdit: (course: DashboardCourse) => void;
  onDelete: (courseId: number) => void;
};

function formatCourseState(status: string): string {
  if (status === "published") {
    return "Published course";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function describeCourseState(status: string): string {
  if (status === "published") {
    return "Ready for the published flow.";
  }

  return "Current course state.";
}

function CourseCardGlyph() {
  return (
    <motion.div
      whileHover={{
        scale: 1.14,
        y: -3,
        rotate: [0, -5, 7, 0],
      }}
      transition={{
        duration: 0.45,
        ease: "easeOut",
      }}
      className="relative flex-none"
    >
      <div className="absolute inset-1 rounded-[1rem] bg-brand-200/70 opacity-0 blur-xl transition duration-300 group-hover:opacity-100 dark:bg-cyan-300/20" />
      <div className="relative flex h-12 w-12 items-center justify-center rounded-[1.15rem] bg-gradient-to-br from-brand-50 via-white to-cyan-50 text-brand-500 shadow-sm ring-1 ring-brand-100 transition duration-300 group-hover:shadow-[0_18px_40px_rgba(15,23,42,0.14)] dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:text-cyan-100 dark:ring-cyan-400/10">
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]">
          <path d="M6.5 5.5h7a3 3 0 0 1 3 3v10l-3-1.8-3 1.8-3-1.8-3 1.8v-10a3 3 0 0 1 3-3Z" />
          <path d="M9 8.5h5.5" />
        </svg>
      </div>
    </motion.div>
  );
}

export function CourseCard({ course, onEdit, onDelete }: CourseCardProps) {
  const courseHref = `/courses/${course.id}`;
  const shouldShowState = course.status !== "draft";
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
        <Link
          href={courseHref}
          className="block rounded-[1.4rem] transition outline-none focus-visible:ring-2 focus-visible:ring-brand-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-cyan-300/70 dark:focus-visible:ring-offset-slate-950"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <CourseCardGlyph />
              <div className="min-w-0">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Created {new Date(course.createdAt).toLocaleDateString()}
                </p>
                <span className="dashboard-script-title mt-1 block truncate text-2xl transition duration-300 group-hover:translate-x-0.5">
                  {course.title}
                </span>
                {shouldShowState ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <DashboardPill tone={statusTone}>
                      {formatCourseState(course.status)}
                    </DashboardPill>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                      {describeCourseState(course.status)}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <p className="mt-4 min-h-12 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {course.description || "No description yet."}
          </p>
        </Link>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 pt-4 dark:border-slate-700/70">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Open this course to manage its modules and materials.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <DashboardActionButton
              href={courseHref}
              variant="primary"
            >
              Open course
            </DashboardActionButton>
            <DashboardActionButton
              onClick={() => onEdit(course)}
              variant="secondary"
            >
              Edit course
            </DashboardActionButton>
            <DashboardActionButton
              onClick={() => onDelete(course.id)}
              variant="danger"
            >
              Delete course
            </DashboardActionButton>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
