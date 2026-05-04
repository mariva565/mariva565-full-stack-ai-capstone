import type { FormEvent } from "react";

import type { MaterialType } from "../../lib/materials";
import { FileUploadButton } from "./file-upload-button";

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
  const sourceLabel =
    materialType === "link"
      ? "Link URL"
      : materialType === "file"
        ? "File source URL"
        : "Optional source URL";

  const sourcePlaceholder =
    materialType === "link"
      ? "https://example.com/article"
      : materialType === "file"
        ? "https://drive.google.com/... or file link"
        : "Optional reference link";

  const sourceHelper =
    materialType === "file"
      ? "Direct file upload is still planned. For now, use a cloud/file link for the source."
      : materialType === "link"
        ? "Paste the page or resource link you want this material to open."
        : "Notes can stay text-only. Add a source only if you want a reference link attached.";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
          Edit Material
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Update the title, tags, and the source details that match this material type.
        </p>
      </div>

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
            className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-200/50 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
            Type
          </label>
          <select
            value={materialType}
            onChange={(event) => onMaterialTypeChange(event.target.value as MaterialType)}
            className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-200/50 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
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
            className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-200/50 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
            {materialType === "file" ? "File" : sourceLabel}
          </label>
          {materialType === "file" ? (
            <div className="mt-2">
              <FileUploadButton
                currentUrl={fileUrl || null}
                onUploadSuccess={onFileUrlChange}
                onRemove={() => onFileUrlChange("")}
              />
            </div>
          ) : (
            <>
              <input
                type="text"
                inputMode="url"
                value={fileUrl}
                onChange={(event) => onFileUrlChange(event.target.value)}
                placeholder={sourcePlaceholder}
                className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-200/50 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
              />
              <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {sourceHelper}
              </p>
            </>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
          Content
        </label>
        <textarea
          rows={16}
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
          className="mt-2 block min-h-[18rem] w-full rounded-[1.4rem] border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-200/50 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(99,102,241,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(99,102,241,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
