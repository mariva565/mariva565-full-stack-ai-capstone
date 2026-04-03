import type { FormEvent } from "react";
import { DashboardActionButton, DashboardPill } from "./dashboard-controls";

type CreateCourseFormProps = {
  title: string;
  description: string;
  creating: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
};

type CourseFormFieldsProps = {
  title: string;
  description: string;
  creating: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
};

function CreateCourseIntro() {
  return (
    <div>
      <DashboardPill tone="brand" className="uppercase tracking-[0.24em] shadow-sm">
        New Course
      </DashboardPill>
      <h2 className="dashboard-panel-title mt-3 text-3xl">
        Start something worth keeping
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
        Create the course first. After that, you can open it to add modules and
        collect materials inside each module.
      </p>
    </div>
  );
}

function CourseFormFields({
  title,
  description,
  creating,
  onTitleChange,
  onDescriptionChange,
}: CourseFormFieldsProps) {
  return (
    <div className="grid gap-4">
      <div>
        <label
          htmlFor="course-title"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Title
        </label>
        <input
          id="course-title"
          type="text"
          required
          autoFocus
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          className="mt-1 block w-full rounded-[1rem] border border-slate-200/80 bg-white/95 px-4 py-3 text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700/80 dark:bg-slate-950/60 dark:text-white"
        />
      </div>

      <div>
        <label
          htmlFor="course-description"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Description
        </label>
        <textarea
          id="course-description"
          rows={3}
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          className="mt-1 block w-full rounded-[1rem] border border-slate-200/80 bg-white/95 px-4 py-3 text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700/80 dark:bg-slate-950/60 dark:text-white"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
            Quick launch from the dashboard
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            New courses start as draft courses.
          </p>
        </div>
        <DashboardActionButton
          type="submit"
          disabled={creating}
          size="md"
          variant="primary"
        >
          {creating ? "Creating..." : "Create Course"}
        </DashboardActionButton>
      </div>
    </div>
  );
}

export function CreateCourseForm({
  title,
  description,
  creating,
  onTitleChange,
  onDescriptionChange,
  onSubmit,
}: CreateCourseFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="relative mt-5 overflow-hidden rounded-[1.8rem] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(248,250,252,0.94)_55%,rgba(238,242,255,0.92)_100%)] p-5 shadow-[0_24px_60px_rgba(99,102,241,0.1)] backdrop-blur-xl dark:border-cyan-400/10 dark:bg-[radial-gradient(circle_at_80%_16%,rgba(226,232,240,0.15)_0%,rgba(148,163,184,0.09)_18%,rgba(15,23,42,0)_42%),linear-gradient(160deg,rgba(17,26,50,0.96)_0%,rgba(8,16,38,0.95)_58%,rgba(5,12,28,0.98)_100%)] dark:shadow-[0_28px_90px_rgba(2,12,27,0.66),0_0_36px_rgba(6,182,212,0.05)]"
    >
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/70 to-transparent dark:via-cyan-300/70" />
      <div className="pointer-events-none absolute -left-10 top-0 h-32 w-32 rounded-full bg-brand-200/45 blur-3xl dark:bg-brand-500/14" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-36 w-36 rounded-full bg-cyan-200/45 blur-3xl dark:bg-cyan-500/12" />
      <div className="pointer-events-none absolute -right-12 top-[-2rem] hidden h-36 w-36 rounded-full bg-white/10 blur-3xl dark:block" />

      <div className="relative grid gap-5 lg:grid-cols-[minmax(0,260px)_1fr]">
        <CreateCourseIntro />
        <CourseFormFields
          title={title}
          description={description}
          creating={creating}
          onTitleChange={onTitleChange}
          onDescriptionChange={onDescriptionChange}
        />
      </div>
    </form>
  );
}
