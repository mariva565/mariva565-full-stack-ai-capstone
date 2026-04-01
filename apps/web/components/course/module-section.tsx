import { useEffect, useState, type FormEvent } from "react";

import type { CourseMaterial } from "../../lib/course-materials";
import { MaterialRow } from "./material-row";

type ModuleInfo = {
  id: number;
  title: string;
  orderIndex: number;
};

type MaterialDraft = {
  title: string;
  content: string;
  materialType: "note" | "link" | "file";
  fileUrl: string;
  tags: string;
};

type ModuleSectionProps = {
  module: ModuleInfo;
  materials: CourseMaterial[];
  showCreateForm: boolean;
  draft: MaterialDraft;
  pinBusyMaterialId: number | null;
  favoriteMaterialIds: Set<number>;
  onToggleCreateForm: (moduleId: number) => void;
  onDraftChange: (field: keyof MaterialDraft, value: string) => void;
  onRenameModule: (moduleId: number, title: string) => Promise<boolean>;
  onSubmitMaterial: (moduleId: number, event: FormEvent) => void;
  onDeleteModule: (moduleId: number) => void;
  onTogglePin: (materialId: number, isPinned: boolean) => void;
};

export function ModuleSection({
  module,
  materials,
  showCreateForm,
  draft,
  pinBusyMaterialId,
  favoriteMaterialIds,
  onToggleCreateForm,
  onDraftChange,
  onRenameModule,
  onSubmitMaterial,
  onDeleteModule,
  onTogglePin,
}: ModuleSectionProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(module.title);
  const [renameBusy, setRenameBusy] = useState(false);
  const submitLabel = draft.materialType === "note" ? "Save note" : "Create material";

  useEffect(() => {
    setTitleDraft(module.title);
  }, [module.title]);

  async function handleRenameSubmit(event: FormEvent) {
    event.preventDefault();
    setRenameBusy(true);
    const success = await onRenameModule(module.id, titleDraft);
    setRenameBusy(false);

    if (success) {
      setIsEditingTitle(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-700">
        {isEditingTitle ? (
          <form onSubmit={handleRenameSubmit} className="min-w-0 flex-1 space-y-2">
            <input
              type="text"
              value={titleDraft}
              onChange={(event) => setTitleDraft(event.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="Module title"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={renameBusy}
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {renameBusy ? "Saving..." : "Save name"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingTitle(false);
                  setTitleDraft(module.title);
                }}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">{module.title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Module #{module.orderIndex + 1}</p>
          </div>
        )}

        <div className="flex gap-2">
          {!isEditingTitle && (
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Rename
            </button>
          )}
          <button
            type="button"
            onClick={() => onToggleCreateForm(module.id)}
            className="rounded-lg border border-brand-300 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 dark:border-brand-500/40 dark:text-brand-200 dark:hover:bg-brand-900/30"
          >
            {showCreateForm ? "Close form" : "+ Material"}
          </button>
          <button
            type="button"
            onClick={() => onDeleteModule(module.id)}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
          >
            Delete
          </button>
        </div>
      </header>

      {showCreateForm && (
        <form
          onSubmit={(event) => onSubmitMaterial(module.id, event)}
          className="space-y-3 border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-900/40"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Title
              </label>
              <input
                type="text"
                value={draft.title}
                onChange={(event) => onDraftChange("title", event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                placeholder="Optional for quick notes"
              />
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                If you leave this empty, we use the first line from Content as the saved title.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Type
              </label>
              <select
                value={draft.materialType}
                onChange={(event) => onDraftChange("materialType", event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
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
                value={draft.tags}
                onChange={(event) => onDraftChange("tags", event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                placeholder="react, hooks, async"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Link / File URL
              </label>
              <input
                type="text"
                inputMode="url"
                value={draft.fileUrl}
                onChange={(event) => onDraftChange("fileUrl", event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
              Content
            </label>
            <textarea
              rows={4}
              value={draft.content}
              onChange={(event) => onDraftChange("content", event.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
              placeholder="Quick summary or key points..."
            />
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              This text is what gets stored in Neon as the note content.
            </p>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {submitLabel}
          </button>
        </form>
      )}

      {materials.length === 0 ? (
        <p className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
          No materials for the current filter.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
          {materials.map((material) => (
            <MaterialRow
              key={material.id}
              material={material}
              isPinned={favoriteMaterialIds.has(material.id)}
              pinBusy={pinBusyMaterialId === material.id}
              onTogglePin={onTogglePin}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export type { MaterialDraft, ModuleInfo };
