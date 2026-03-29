"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
};

type ToastState = {
  tone: ToastTone;
  message: string;
};

export default function MaterialPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [material, setMaterial] = useState<Material | null>(null);
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

    const data = (await response.json()) as { material: Material };
    const loadedMaterial = data.material;
    setMaterial(loadedMaterial);
    setTitle(loadedMaterial.title);
    setContent(loadedMaterial.content ?? "");
    setMaterialType(normalizeMaterialType(loadedMaterial.materialType));
    setFileUrl(loadedMaterial.fileUrl ?? "");
    setTagsInput(parseTags(loadedMaterial.tags).join(", "));
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
    if (!title.trim()) {
      pushToast("Title is required.", "error");
      return;
    }

    setSaving(true);
    const response = await fetch(`/api/materials/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        materialType,
        fileUrl: fileUrl || null,
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
    if (!material) {
      return;
    }

    setDeleteBusy(true);
    const response = await fetch(`/api/materials/${material.id}`, { method: "DELETE" });
    setDeleteBusy(false);

    if (!response.ok) {
      pushToast(await readErrorMessage(response, "Could not delete material."), "error");
      return;
    }

    router.push("/dashboard");
  }

  const normalizedTags = useMemo(() => parseTags(material?.tags), [material?.tags]);

  if (loading) {
    return <Spinner centered label="Loading material..." />;
  }

  if (!material) {
    return null;
  }

  return (
    <>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-100"
        >
          &larr; Back
        </button>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
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

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete material?"
        description="This action cannot be undone."
        confirmLabel="Delete material"
        busy={deleteBusy}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteMaterial}
      />

      {toast && <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}
    </>
  );
}
