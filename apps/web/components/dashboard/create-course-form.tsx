import type { FormEvent } from "react";

type CreateCourseFormProps = {
  title: string;
  description: string;
  creating: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
};

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
      className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"
    >
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
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
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
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        />
      </div>

      <button
        type="submit"
        disabled={creating}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {creating ? "Creating..." : "Create Course"}
      </button>
    </form>
  );
}
