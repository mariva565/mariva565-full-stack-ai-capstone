import type { FormEvent } from "react";

import { FileUploadButton } from "../materials/file-upload-button";

type MaterialDraft = {
  title: string;
  content: string;
  materialType: "note" | "link" | "file";
  fileUrl: string;
  tags: string;
};

type ModuleMaterialComposerProps = {
  draft: MaterialDraft;
  saving: boolean;
  onDraftChange: (field: keyof MaterialDraft, value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
};

export function ModuleMaterialComposer({
  draft,
  saving,
  onDraftChange,
  onSubmit,
  onCancel,
}: ModuleMaterialComposerProps) {
  const submitLabel = draft.materialType === "note" ? "Save note" : "Create material";

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[1.8rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_24px_55px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/55"
    >
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
            Add Material
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Capture a quick note, save a link, or point to a file URL. Each
            saved item becomes one material inside this module.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Title
            </label>
            <input
              type="text"
              value={draft.title}
              onChange={(event) => onDraftChange("title", event.target.value)}
              className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-200/50 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
              placeholder="Optional for quick notes"
            />
            <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Leave this empty to use the opening line as the title.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Type
            </label>
            <select
              value={draft.materialType}
              onChange={(event) => onDraftChange("materialType", event.target.value)}
              className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-200/50 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
            >
              <option value="note">Note</option>
              <option value="link">Link</option>
              <option value="file">File</option>
            </select>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Tags
            </label>
            <input
              type="text"
              value={draft.tags}
              onChange={(event) => onDraftChange("tags", event.target.value)}
              className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-200/50 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
              placeholder="react, hooks, exam prep"
            />
          </div>

          {draft.materialType !== "note" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                {draft.materialType === "file" ? "File" : "Link URL"}
              </label>
              {draft.materialType === "file" ? (
                <div className="mt-2">
                  <FileUploadButton
                    currentUrl={draft.fileUrl || null}
                    onUploadSuccess={(url) => onDraftChange("fileUrl", url)}
                  />
                </div>
              ) : (
                <input
                  type="text"
                  inputMode="url"
                  value={draft.fileUrl}
                  onChange={(event) => onDraftChange("fileUrl", event.target.value)}
                  className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-200/50 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
                  placeholder="https://..."
                />
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Content
          </label>
          <textarea
            rows={6}
            value={draft.content}
            onChange={(event) => onDraftChange("content", event.target.value)}
            className="mt-2 block w-full rounded-[1.4rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-200/50 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
            placeholder="Write your study note, summary, or context for the saved link..."
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(99,102,241,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(99,102,241,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : submitLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

export type { MaterialDraft };
