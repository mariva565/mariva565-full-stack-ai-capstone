import type { FormEvent } from "react";

import type { MaterialType } from "../../lib/materials";

type MaterialEditorFormProps = {
  title: string;
  content: string;
  materialType: MaterialType;
  fileUrl: string;
  tagsInput: string;
  saving: boolean;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onMaterialTypeChange: (value: MaterialType) => void;
  onFileUrlChange: (value: string) => void;
  onTagsInputChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
};

export function MaterialEditorForm({
  title,
  content,
  materialType,
  fileUrl,
  tagsInput,
  saving,
  onTitleChange,
  onContentChange,
  onMaterialTypeChange,
  onFileUrlChange,
  onTagsInputChange,
  onSubmit,
  onCancel,
}: MaterialEditorFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
            Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
            Type
          </label>
          <select
            value={materialType}
            onChange={(event) => onMaterialTypeChange(event.target.value as MaterialType)}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            <option value="note">Note</option>
            <option value="link">Link</option>
            <option value="file">File</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
            Tags
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(event) => onTagsInputChange(event.target.value)}
            placeholder="react, hooks"
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
            Link / File URL
          </label>
          <input
            type="url"
            value={fileUrl}
            onChange={(event) => onFileUrlChange(event.target.value)}
            placeholder="https://..."
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
          Content
        </label>
        <textarea
          rows={12}
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
