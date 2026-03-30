"use client";

type MilestoneEditorProps = {
  title: string;
  description: string;
  dueDate: string;
  busy: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
};

export function MilestoneEditor({
  title,
  description,
  dueDate,
  busy,
  onTitleChange,
  onDescriptionChange,
  onDueDateChange,
  onCancel,
  onSave,
}: MilestoneEditorProps) {
  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <input
        type="text"
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        placeholder="Milestone title"
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-brand-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
      />
      <textarea
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        rows={3}
        placeholder="Notes / explanation"
        className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-brand-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
      />
      <input
        type="date"
        value={dueDate}
        onChange={(event) => onDueDateChange(event.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
      />
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy || !title.trim()}
          className="rounded-lg bg-brand-600 px-3 py-1.5 font-medium text-white transition-colors hover:bg-brand-500 disabled:opacity-50"
        >
          {busy ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
