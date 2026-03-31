import Link from "next/link";

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

const STATUS_STYLE: Record<string, string> = {
  draft:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  published:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
};

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function CourseCard({ course, onEdit, onDelete }: CourseCardProps) {
  const statusStyle =
    STATUS_STYLE[course.status] ??
    "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/courses/${course.id}`}
            className="text-lg font-semibold text-slate-900 transition-colors hover:text-brand-600 dark:text-white dark:hover:text-brand-100"
          >
            {course.title}
          </Link>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Created {new Date(course.createdAt).toLocaleDateString()}
          </p>
        </div>

        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle}`}>
          {formatStatus(course.status)}
        </span>
      </div>

      <p className="mt-3 min-h-10 text-sm text-slate-600 dark:text-slate-300">
        {course.description || "No description yet."}
      </p>

      <div className="mt-4 flex items-center gap-3">
        <Link
          href={`/courses/${course.id}`}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Open
        </Link>
        <button
          type="button"
          onClick={() => onEdit(course)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(course.id)}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
