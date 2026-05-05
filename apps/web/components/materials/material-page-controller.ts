import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { MaterialDetail, MaterialPageData } from "./types";
import { readErrorMessage } from "../../lib/http";
import {
  normalizeMaterialType,
  parseTags,
  prepareTagsFromInput,
  type MaterialType,
} from "../../lib/materials";
import { slugify } from "../../lib/slugify";
import {
  formatAiToolOutputForNote,
  type SavedAiToolOutput,
  type ToolResult,
} from "../../lib/ai-tool-outputs";
import type { ToastTone } from "../ui/toast";

type ToastState = {
  tone: ToastTone;
  message: string;
};

type ControllerArgs = {
  initialData: MaterialPageData;
  initialEditing: boolean;
};

function getDraftFromMaterial(material: MaterialDetail) {
  return {
    title: material.title,
    content: material.content ?? "",
    materialType: normalizeMaterialType(material.materialType),
    fileUrl: material.fileUrl ?? "",
    tagsInput: parseTags(material.tags).join(", "),
  };
}

function useMaterialDraft(initialMaterial: MaterialDetail) {
  const [draft, setDraft] = useState(() => getDraftFromMaterial(initialMaterial));

  function resetFromMaterial(material: MaterialDetail) {
    setDraft(getDraftFromMaterial(material));
  }

  return { draft, setDraft, resetFromMaterial };
}

function useToastState() {
  const [toast, setToast] = useState<ToastState | null>(null);

  function pushToast(message: string, tone: ToastTone) {
    setToast({ message, tone });
  }

  return { toast, setToast, pushToast };
}

function useAiOutputActions(
  initialOutputs: SavedAiToolOutput[],
  setDraft: ReturnType<typeof useMaterialDraft>["setDraft"],
  setIsEditing: (value: boolean) => void,
  pushToast: (message: string, tone: ToastTone) => void
) {
  const [savedAiOutputs, setSavedAiOutputs] = useState(initialOutputs);

  function handleAiOutputSaved(output: SavedAiToolOutput) {
    setSavedAiOutputs((current) => [output, ...current]);
    pushToast("AI result saved under this material.", "success");
  }

  function handleInsertAiOutput(result: ToolResult | SavedAiToolOutput) {
    const formatted = formatAiToolOutputForNote(result);
    setDraft((current) => {
      const trimmedCurrent = current.content.trim();
      const content = trimmedCurrent ? `${trimmedCurrent}\n\n${formatted}` : formatted;
      return { ...current, content };
    });
    setIsEditing(true);
    pushToast("AI result inserted into the editor. Save material to keep it.", "success");
  }

  return { savedAiOutputs, handleAiOutputSaved, handleInsertAiOutput };
}

function useSaveMaterialAction(
  material: MaterialDetail,
  draftState: ReturnType<typeof useMaterialDraft>,
  setMaterial: (material: MaterialDetail) => void,
  setIsEditing: (value: boolean) => void,
  pushToast: (message: string, tone: ToastTone) => void
) {
  const [saving, setSaving] = useState(false);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    const { draft } = draftState;
    const trimmedTitle = draft.title.trim();

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
        content: draft.content.trim() || null,
        materialType: draft.materialType,
        fileUrl: draft.fileUrl.trim() || null,
        tags: prepareTagsFromInput(draft.tagsInput),
      }),
    });
    setSaving(false);

    if (!response.ok) {
      pushToast(await readErrorMessage(response, "Could not save material."), "error");
      return;
    }

    const data = (await response.json()) as { material: MaterialDetail };
    setMaterial(data.material);
    draftState.resetFromMaterial(data.material);
    setIsEditing(false);
    pushToast("Material updated.", "success");
  }

  return { saving, handleSave };
}

function usePinMaterialAction(
  material: MaterialDetail,
  isPinned: boolean,
  setIsPinned: (updater: (current: boolean) => boolean) => void,
  pushToast: (message: string, tone: ToastTone) => void
) {
  const [pinBusy, setPinBusy] = useState(false);

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

  return { pinBusy, handleTogglePin };
}

function useDeleteMaterialAction(
  material: MaterialDetail,
  moduleInfo: MaterialPageData["module"],
  pushToast: (message: string, tone: ToastTone) => void
) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  async function handleDeleteMaterial() {
    setDeleteBusy(true);
    const response = await fetch(`/api/materials/${material.id}`, { method: "DELETE" });
    setDeleteBusy(false);

    if (!response.ok) {
      pushToast(await readErrorMessage(response, "Could not delete material."), "error");
      return;
    }

    router.push(`/modules/${moduleInfo.id}/${slugify(moduleInfo.title)}`);
  }

  return { showDeleteModal, setShowDeleteModal, deleteBusy, handleDeleteMaterial };
}

function useShareMaterialAction(
  material: MaterialDetail,
  pushToast: (message: string, tone: ToastTone) => void
) {
  const [showShareModal, setShowShareModal] = useState(false);

  async function handleShare(recipientEmail: string) {
    const response = await fetch(`/api/materials/${material.id}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientEmail }),
    });

    if (!response.ok) {
      const msg = await readErrorMessage(response, "Could not send share notification.");
      pushToast(msg, "error");
      return;
    }

    setShowShareModal(false);
    pushToast("Material shared successfully.", "success");
  }

  return { showShareModal, setShowShareModal, handleShare };
}

export function useMaterialPageController({ initialData, initialEditing }: ControllerArgs) {
  const [material, setMaterial] = useState(initialData.material);
  const [isEditing, setIsEditing] = useState(initialEditing);
  const [isPinned, setIsPinned] = useState(initialData.isPinned);
  const draftState = useMaterialDraft(initialData.material);
  const toastState = useToastState();
  const aiOutputs = useAiOutputActions(
    initialData.aiOutputs,
    draftState.setDraft,
    setIsEditing,
    toastState.pushToast
  );
  const saveAction = useSaveMaterialAction(
    material,
    draftState,
    setMaterial,
    setIsEditing,
    toastState.pushToast
  );
  const pinAction = usePinMaterialAction(material, isPinned, setIsPinned, toastState.pushToast);
  const deleteAction = useDeleteMaterialAction(material, initialData.module, toastState.pushToast);
  const shareAction = useShareMaterialAction(material, toastState.pushToast);
  const normalizedTags = useMemo(() => parseTags(material.tags), [material.tags]);
  const pageTitle = isEditing ? draftState.draft.title.trim() || material.title : material.title;

  function startEditing() {
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    draftState.resetFromMaterial(material);
  }

  return {
    course: initialData.course,
    moduleInfo: initialData.module,
    isOwner: initialData.isOwner,
    material,
    draft: draftState.draft,
    setDraft: draftState.setDraft,
    isEditing,
    isPinned,
    normalizedTags,
    pageTitle,
    startEditing,
    cancelEditing,
    ...toastState,
    ...aiOutputs,
    ...saveAction,
    ...pinAction,
    ...deleteAction,
    ...shareAction,
  };
}

export type MaterialPageController = ReturnType<typeof useMaterialPageController>;
