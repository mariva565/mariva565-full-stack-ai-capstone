"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { MaterialEditorForm } from "./material-editor-form";
import type { MaterialDetail, MaterialPageData } from "./types";
import { MaterialViewPanel } from "./material-view-panel";
import { ConfirmModal } from "../ui/confirm-modal";
import { Toast, type ToastTone } from "../ui/toast";
import { readErrorMessage } from "../../lib/http";
import {
  normalizeMaterialType,
  parseTags,
  prepareTagsFromInput,
  type MaterialType,
} from "../../lib/materials";

type ToastState = {
  tone: ToastTone;
  message: string;
};

type MaterialPageClientProps = {
  initialData: MaterialPageData;
};

export function MaterialPageClient({ initialData }: MaterialPageClientProps) {
  const router = useRouter();
  const moduleInfo = initialData.module;
  const course = initialData.course;
  const [material, setMaterial] = useState(initialData.material);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialData.material.title);
  const [content, setContent] = useState(initialData.material.content ?? "");
  const [materialType, setMaterialType] = useState<MaterialType>(
    normalizeMaterialType(initialData.material.materialType)
  );
  const [fileUrl, setFileUrl] = useState(initialData.material.fileUrl ?? "");
  const [tagsInput, setTagsInput] = useState(parseTags(initialData.material.tags).join(", "));
  const [isPinned, setIsPinned] = useState(initialData.isPinned);
  const [saving, setSaving] = useState(false);
  const [pinBusy, setPinBusy] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  function pushToast(message: string, tone: ToastTone) {
    setToast({ message, tone });
  }

  function resetFormFromMaterial(currentMaterial: MaterialDetail) {
    setTitle(currentMaterial.title);
    setContent(currentMaterial.content ?? "");
    setMaterialType(normalizeMaterialType(currentMaterial.materialType));
    setFileUrl(currentMaterial.fileUrl ?? "");
    setTagsInput(parseTags(currentMaterial.tags).join(", "));
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const trimmedFileUrl = fileUrl.trim();

    if (!trimmedTitle) {
      pushToast("Title is required.", "error");
      return;
    }

    setSaving(true);
    const response = await fetch(`/api/materials/${material.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: trimmedTitle,
        content: trimmedContent || null,
        materialType,
        fileUrl: trimmedFileUrl || null,
        tags: prepareTagsFromInput(tagsInput),
      }),
    });
    setSaving(false);

    if (!response.ok) {
      pushToast(await readErrorMessage(response, "Could not save material."), "error");
      return;
    }

    const data = (await response.json()) as { material: MaterialDetail };
    setMaterial(data.material);
    resetFormFromMaterial(data.material);
    setIsEditing(false);
    pushToast("Material updated.", "success");
  }

  async function handleTogglePin() {
    setPinBusy(true);
    const response = await fetch(
      isPinned ? `/api/favorites?materialId=${material.id}` : "/api/favorites",
      {
        method: isPinned ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: isPinned ? undefined : JSON.stringify({ materialId: material.id }),
      }
    );
    setPinBusy(false);

    if (!response.ok) {
      pushToast(await readErrorMessage(response, "Could not update pin state."), "error");
      return;
    }

    setIsPinned((current) => !current);
    pushToast(isPinned ? "Material unpinned." : "Material pinned.", "success");
  }

  async function handleDeleteMaterial() {
    setDeleteBusy(true);
    const response = await fetch(`/api/materials/${material.id}`, { method: "DELETE" });
    setDeleteBusy(false);

    if (!response.ok) {
      pushToast(await readErrorMessage(response, "Could not delete material."), "error");
      return;
    }

    router.push(`/modules/${moduleInfo.id}`);
  }

  const normalizedTags = useMemo(() => parseTags(material.tags), [material.tags]);

  return (
    <>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-10 top-10 h-72 w-72 rounded-full bg-brand-200/35 blur-3xl dark:bg-brand-500/10" />
        <div className="pointer-events-none absolute right-0 top-24 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl dark:bg-cyan-500/10" />

        <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/60 bg-[linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(248,250,252,0.94)_58%,rgba(238,242,255,0.92)_100%)] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] dark:border-cyan-400/10 dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12)_0%,rgba(34,211,238,0)_26%),linear-gradient(160deg,rgba(15,23,42,0.97)_0%,rgba(9,17,34,0.96)_55%,rgba(6,12,28,0.98)_100%)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <Link
                  href={`/modules/${moduleInfo.id}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 transition hover:text-brand-700 dark:text-brand-100"
                >
                  <span aria-hidden="true">&larr;</span>
                  Back to {moduleInfo.title}
                </Link>
                <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-slate-400 dark:text-slate-500">
                  Material
                </p>
                <h1 className="dashboard-panel-title mt-3 text-3xl md:text-4xl">
                  Review and edit
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Keep this item inside <span className="font-semibold text-slate-900 dark:text-white">{moduleInfo.title}</span> from the <span className="font-semibold text-slate-900 dark:text-white">{course.title}</span> course. Pin it for quick access or update the details whenever the source changes.
                </p>
              </div>

              <Link
                href={`/courses/${course.id}`}
                className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Course modules
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-brand-200/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700 shadow-sm dark:border-brand-400/20 dark:bg-brand-500/10 dark:text-brand-100">
                Module {moduleInfo.orderIndex + 1}
              </span>
              {isPinned ? (
                <span className="rounded-full border border-cyan-200/80 bg-cyan-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-500/10 dark:text-cyan-100">
                  Quick access
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-6 rounded-[2rem] border border-slate-200/80 bg-white/88 p-6 shadow-[0_24px_55px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/55">
            {isEditing ? (
              <MaterialEditorForm
                title={title}
                content={content}
                materialType={materialType}
                fileUrl={fileUrl}
                tagsInput={tagsInput}
                saving={saving}
                onTitleChange={setTitle}
                onContentChange={setContent}
                onMaterialTypeChange={setMaterialType}
                onFileUrlChange={setFileUrl}
                onTagsInputChange={setTagsInput}
                onSubmit={handleSave}
                onCancel={() => {
                  setIsEditing(false);
                  resetFormFromMaterial(material);
                }}
              />
            ) : (
              <MaterialViewPanel
                title={material.title}
                materialType={material.materialType}
                tags={normalizedTags}
                content={material.content}
                fileUrl={material.fileUrl}
                createdAt={material.createdAt}
                isPinned={isPinned}
                pinBusy={pinBusy}
                onTogglePin={handleTogglePin}
                onEdit={() => setIsEditing(true)}
                onDelete={() => setShowDeleteModal(true)}
              />
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete material?"
        description="This action cannot be undone."
        confirmLabel="Delete material"
        busy={deleteBusy}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteMaterial}
      />

      {toast ? <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}
    </>
  );
}
