"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { MaterialEditorForm } from "../../../components/materials/material-editor-form";
import { MaterialViewPanel } from "../../../components/materials/material-view-panel";
import { ConfirmModal } from "../../../components/ui/confirm-modal";
import { Spinner } from "../../../components/ui/spinner";
import { Toast, type ToastTone } from "../../../components/ui/toast";
import { readErrorMessage } from "../../../lib/http";
import {
  normalizeMaterialType,
  parseTags,
  prepareTagsFromInput,
  type MaterialType,
} from "../../../lib/materials";

type Material = {
  id: number;
  title: string;
  content: string | null;
  materialType: string;
  fileUrl: string | null;
  tags: string | null;
  createdAt: string;
  moduleId: number;
};

type ModuleSummary = {
  id: number;
  title: string;
  courseId: number;
  orderIndex: number;
};

type CourseSummary = {
  id: number;
  title: string;
  description: string | null;
};

type ToastState = {
  tone: ToastTone;
  message: string;
};

export default function MaterialPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [material, setMaterial] = useState<Material | null>(null);
  const [moduleInfo, setModuleInfo] = useState<ModuleSummary | null>(null);
  const [course, setCourse] = useState<CourseSummary | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [materialType, setMaterialType] = useState<MaterialType>("note");
  const [fileUrl, setFileUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pinBusy, setPinBusy] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    void loadPageData();
  }, [id]);

  async function loadMaterial() {
    const response = await fetch(`/api/materials/${id}`);
    if (response.status === 401) {
      router.push("/login");
      return false;
    }

    if (!response.ok) {
      router.push("/dashboard");
      return false;
    }

    const data = (await response.json()) as {
      material: Material;
      module: ModuleSummary;
      course: CourseSummary;
    };
    setMaterial(data.material);
    setModuleInfo(data.module);
    setCourse(data.course);
    setTitle(data.material.title);
    setContent(data.material.content ?? "");
    setMaterialType(normalizeMaterialType(data.material.materialType));
    setFileUrl(data.material.fileUrl ?? "");
    setTagsInput(parseTags(data.material.tags).join(", "));
    return true;
  }

  async function loadPinState() {
    const response = await fetch("/api/favorites");
    if (!response.ok) {
      setIsPinned(false);
      return;
    }

    const data = (await response.json()) as { favorites?: { materialId: number }[] };
    const favoriteSet = new Set((data.favorites ?? []).map((favorite) => favorite.materialId));
    setIsPinned(favoriteSet.has(Number(id)));
  }

  async function loadPageData() {
    setLoading(true);
    const success = await loadMaterial();
    if (success) {
      await loadPinState();
    }
    setLoading(false);
  }

  function pushToast(message: string, tone: ToastTone) {
    setToast({ message, tone });
  }

  function resetFormFromMaterial(currentMaterial: Material) {
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
    const response = await fetch(`/api/materials/${id}`, {
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

    const data = (await response.json()) as { material: Material };
    setMaterial(data.material);
    setIsEditing(false);
    pushToast("Material updated.", "success");
  }

  async function handleTogglePin() {
    if (!material) {
      return;
    }

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
    if (!material || !moduleInfo) {
      return;
    }

    setDeleteBusy(true);
    const response = await fetch(`/api/materials/${material.id}`, { method: "DELETE" });
    setDeleteBusy(false);

    if (!response.ok) {
      pushToast(await readErrorMessage(response, "Could not delete material."), "error");
      return;
    }

    router.push(`/modules/${moduleInfo.id}`);
  }

  const normalizedTags = useMemo(() => parseTags(material?.tags), [material?.tags]);

  if (loading) {
    return <Spinner centered label="Loading material..." />;
  }

  if (!material || !moduleInfo || !course) {
    return null;
  }

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
                  Material Detail
                </p>
                <h1 className="dashboard-panel-title mt-3 text-3xl md:text-4xl">
                  Material workspace
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Review, pin, or edit this item inside <span className="font-semibold text-slate-900 dark:text-white">{moduleInfo.title}</span> from the <span className="font-semibold text-slate-900 dark:text-white">{course.title}</span> course.
                </p>
              </div>

              <Link
                href={`/courses/${course.id}`}
                className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                View course modules
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-brand-200/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700 shadow-sm dark:border-brand-400/20 dark:bg-brand-500/10 dark:text-brand-100">
                Module {moduleInfo.orderIndex + 1}
              </span>
              <span className="rounded-full border border-cyan-200/80 bg-cyan-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-500/10 dark:text-cyan-100">
                {isPinned ? "Pinned in quick access" : "Not pinned"}
              </span>
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
