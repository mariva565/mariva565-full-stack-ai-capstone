"use client";

import { FormEvent, useMemo, useState } from "react";

import { MaterialRow } from "../course/material-row";
import {
  ModuleMaterialComposer,
  type MaterialDraft,
} from "./module-material-composer";
import { ModulePinnedSidebar } from "./module-pinned-sidebar";
import { ModuleSidebar } from "./module-sidebar";
import type { ModuleWorkspaceData } from "./types";
import { ModuleWorkspaceHeader } from "./module-workspace-header";
import { ScrollToTop } from "../ui/scroll-to-top";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Toast, type ToastTone } from "../ui/toast";
import {
  matchesFilter,
  matchesSearch,
  sortMaterials,
  type CourseMaterial,
} from "../../lib/course-materials";
import { readErrorMessage } from "../../lib/http";
import { prepareTagsFromInput, resolveMaterialTitle } from "../../lib/materials";

type MaterialResponse = {
  material?: CourseMaterial;
};

type ToastState = {
  tone: ToastTone;
  message: string;
};

type ModuleWorkspaceClientPageProps = {
  initialData: ModuleWorkspaceData;
};

const EMPTY_MATERIAL_DRAFT: MaterialDraft = {
  title: "",
  content: "",
  materialType: "note",
  fileUrl: "",
  tags: "",
};

export function ModuleWorkspaceClientPage({
  initialData,
}: ModuleWorkspaceClientPageProps) {
  const course = initialData.course;
  const currentModule = initialData.module;
  const courseModules = initialData.modules;
  const [materials, setMaterials] = useState(initialData.materials);
  const [favoriteItems, setFavoriteItems] = useState(initialData.favorites);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [savingMaterial, setSavingMaterial] = useState(false);
  const [pinBusyMaterialId, setPinBusyMaterialId] = useState<number | null>(null);
  const [materialDraft, setMaterialDraft] = useState<MaterialDraft>(EMPTY_MATERIAL_DRAFT);
  const [filterBy, setFilterBy] = useState<"all" | "note" | "link" | "file">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<ToastState | null>(null);

  function pushToast(message: string, tone: ToastTone) {
    setToast({ message, tone });
  }

  function updateMaterialDraft(field: keyof MaterialDraft, value: string) {
    setMaterialDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function closeCreateForm() {
    setShowCreateForm(false);
    setMaterialDraft(EMPTY_MATERIAL_DRAFT);
  }

  function toggleCreateForm() {
    if (showCreateForm) {
      closeCreateForm();
      return;
    }

    setShowCreateForm(true);
  }

  async function handleCreateMaterial(event: FormEvent) {
    event.preventDefault();

    const trimmedTitle = materialDraft.title.trim();
    const trimmedContent = materialDraft.content.trim();
    const trimmedFileUrl = materialDraft.fileUrl.trim();
    const resolvedTitle = resolveMaterialTitle(
      trimmedTitle,
      trimmedContent,
      materialDraft.materialType,
      trimmedFileUrl
    );

    if (!resolvedTitle) {
      pushToast("Add a title, some content, or a link first.", "error");
      return;
    }

    setSavingMaterial(true);
    const response = await fetch(`/api/modules/${currentModule.id}/materials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: resolvedTitle,
        content: trimmedContent || null,
        materialType: materialDraft.materialType,
        fileUrl: trimmedFileUrl || null,
        tags: prepareTagsFromInput(materialDraft.tags),
      }),
    });
    setSavingMaterial(false);

    if (!response.ok) {
      pushToast(await readErrorMessage(response, "Could not create material."), "error");
      return;
    }

    const payload = (await response.json()) as MaterialResponse;
    if (payload.material) {
      setMaterials((current) => [payload.material!, ...current]);
    }

    closeCreateForm();
    pushToast("Material created.", "success");
  }

  async function handleTogglePin(materialId: number, isPinned: boolean) {
    setPinBusyMaterialId(materialId);
    const response = await fetch(
      isPinned ? `/api/favorites?materialId=${materialId}` : "/api/favorites",
      {
        method: isPinned ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: isPinned ? undefined : JSON.stringify({ materialId }),
      }
    );
    setPinBusyMaterialId(null);

    if (!response.ok) {
      pushToast(await readErrorMessage(response, "Could not update pin state."), "error");
      return;
    }

    if (isPinned) {
      setFavoriteItems((current) => current.filter((item) => item.materialId !== materialId));
      pushToast("Material unpinned.", "success");
      return;
    }

    const material = materials.find((item) => item.id === materialId);
    if (material) {
      setFavoriteItems((current) => [
        {
          id: materialId,
          materialId,
          materialTitle: material.title,
          materialType: material.materialType,
          tags: material.tags,
          moduleId: currentModule.id,
          moduleTitle: currentModule.title,
          courseId: course.id,
          courseTitle: course.title,
        },
        ...current,
      ]);
    }
    pushToast("Material pinned.", "success");
  }

  const favoriteMaterialIds = useMemo(
    () => new Set(favoriteItems.map((item) => item.materialId)),
    [favoriteItems]
  );
  const pinnedItems = useMemo(
    () => favoriteItems.filter((item) => item.moduleId === currentModule.id),
    [currentModule.id, favoriteItems]
  );
  const processedMaterials = useMemo(() => {
    const filtered = materials.filter(
      (material) => matchesFilter(material, filterBy) && matchesSearch(material, searchQuery)
    );
    return sortMaterials(filtered, sortBy);
  }, [filterBy, materials, searchQuery, sortBy]);

  return (
    <>
      <div className="relative overflow-hidden font-poppins">
        <div className="pointer-events-none absolute -left-10 top-10 h-80 w-80 rounded-full bg-brand-200/35 blur-3xl dark:bg-brand-500/10" />
        <div className="pointer-events-none absolute right-0 top-24 h-80 w-80 rounded-full bg-cyan-200/35 blur-3xl dark:bg-cyan-500/10" />

        <div className="relative mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
            <ModuleSidebar
              courseId={course.id}
              courseTitle={course.title}
              activeModuleId={currentModule.id}
              modules={courseModules}
            />

            <div className="space-y-6">
              <ModuleWorkspaceHeader
                courseId={course.id}
                courseTitle={course.title}
                moduleTitle={currentModule.title}
                moduleDescription={currentModule.description}
                searchQuery={searchQuery}
                sortBy={sortBy}
                filterBy={filterBy}
                showCreateForm={showCreateForm}
                onSearchQueryChange={setSearchQuery}
                onSortChange={setSortBy}
                onFilterChange={setFilterBy}
                onToggleCreateForm={toggleCreateForm}
              />

              {showCreateForm ? (
                <ModuleMaterialComposer
                  draft={materialDraft}
                  saving={savingMaterial}
                  onDraftChange={updateMaterialDraft}
                  onSubmit={handleCreateMaterial}
                  onCancel={closeCreateForm}
                />
              ) : null}

              {processedMaterials.length === 0 ? (
                <div className="rounded-[1.8rem] border border-dashed border-slate-300/80 bg-white/75 px-6 py-10 text-center shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/55">
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    No materials for the current view
                  </p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Try another filter, clear the search, or add the first material for this module.
                  </p>
                  {(searchQuery || filterBy !== "all" || sortBy !== "newest") ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setFilterBy("all");
                        setSortBy("newest");
                      }}
                      className="mt-4 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Reset filters
                    </button>
                  ) : null}
                </div>
              ) : (
                <ul className="space-y-4">
                  {processedMaterials.map((material) => (
                    <MaterialRow
                      key={material.id}
                      material={material}
                      isPinned={favoriteMaterialIds.has(material.id)}
                      pinBusy={pinBusyMaterialId === material.id}
                      onTogglePin={handleTogglePin}
                    />
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-4">
              <div className="pointer-events-none mx-auto h-[160px] w-[160px] opacity-80 drop-shadow-[0_0_15px_rgba(99,102,241,0.1)] sm:h-[180px] sm:w-[180px]">
                <DotLottieReact
                  src="https://lottie.host/4db68bbd-31f6-4cd8-84eb-189de081159a/IGmMCqhzpt.lottie"
                  loop
                  autoplay
                />
              </div>
              <ModulePinnedSidebar items={pinnedItems} />
            </div>
          </div>
        </div>
      </div>

      <ScrollToTop />

      {toast ? <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}
    </>
  );
}
