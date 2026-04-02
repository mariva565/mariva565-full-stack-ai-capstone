"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import type { ModuleInfo } from "../../../components/course/module-section";
import { MaterialRow } from "../../../components/course/material-row";
import {
  ModuleMaterialComposer,
  type MaterialDraft,
} from "../../../components/modules/module-material-composer";
import { ModulePinnedSidebar } from "../../../components/modules/module-pinned-sidebar";
import { ModuleSidebar } from "../../../components/modules/module-sidebar";
import { ModuleWorkspaceHeader } from "../../../components/modules/module-workspace-header";
import { Spinner } from "../../../components/ui/spinner";
import { Toast, type ToastTone } from "../../../components/ui/toast";
import {
  matchesFilter,
  matchesSearch,
  sortMaterials,
  type CourseMaterial,
} from "../../../lib/course-materials";
import { readErrorMessage } from "../../../lib/http";
import { prepareTagsFromInput, resolveMaterialTitle } from "../../../lib/materials";

type CourseSummary = {
  id: number;
  title: string;
  description: string | null;
};

type ModulePayload = {
  module: ModuleInfo;
  course: CourseSummary;
};

type MaterialResponse = {
  material?: CourseMaterial;
};

type FavoriteItem = {
  id: number;
  materialId: number;
  materialTitle: string;
  materialType: string;
  tags: string | null;
  moduleId: number;
  moduleTitle: string;
  courseId: number;
  courseTitle: string;
};

type ToastState = {
  tone: ToastTone;
  message: string;
};

const EMPTY_MATERIAL_DRAFT: MaterialDraft = {
  title: "",
  content: "",
  materialType: "note",
  fileUrl: "",
  tags: "",
};

export default function ModuleWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<CourseSummary | null>(null);
  const [currentModule, setCurrentModule] = useState<ModuleInfo | null>(null);
  const [courseModules, setCourseModules] = useState<ModuleInfo[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [savingMaterial, setSavingMaterial] = useState(false);
  const [pinBusyMaterialId, setPinBusyMaterialId] = useState<number | null>(null);
  const [materialDraft, setMaterialDraft] = useState<MaterialDraft>(EMPTY_MATERIAL_DRAFT);
  const [filterBy, setFilterBy] = useState<"all" | "note" | "link" | "file">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    setShowCreateForm(false);
    setMaterialDraft(EMPTY_MATERIAL_DRAFT);
    setSearchQuery("");
    setFilterBy("all");
    setSortBy("newest");
    void loadPageData();
  }, [id]);

  async function loadModuleContext() {
    const response = await fetch(`/api/modules/${id}`);
    if (response.status === 401) {
      router.push("/login");
      return null;
    }

    if (!response.ok) {
      router.push("/dashboard");
      return null;
    }

    const payload = (await response.json()) as ModulePayload;
    setCurrentModule(payload.module);
    setCourse(payload.course);
    return payload;
  }

  async function loadFavorites() {
    const response = await fetch("/api/favorites");
    if (!response.ok) {
      setFavoriteItems([]);
      return;
    }

    const payload = (await response.json()) as { favorites?: FavoriteItem[] };
    setFavoriteItems(payload.favorites ?? []);
  }

  async function loadPageData() {
    setLoading(true);
    const context = await loadModuleContext();
    if (!context) {
      setLoading(false);
      return;
    }

    const [modulesResponse, materialsResponse] = await Promise.all([
      fetch(`/api/courses/${context.course.id}/modules`),
      fetch(`/api/modules/${context.module.id}/materials`),
      loadFavorites(),
    ]);

    if (modulesResponse.ok) {
      const payload = (await modulesResponse.json()) as { modules?: ModuleInfo[] };
      setCourseModules(payload.modules ?? []);
    } else {
      setCourseModules([]);
    }

    if (materialsResponse.ok) {
      const payload = (await materialsResponse.json()) as { materials?: CourseMaterial[] };
      setMaterials(payload.materials ?? []);
    } else {
      setMaterials([]);
    }

    setLoading(false);
  }

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
    if (!currentModule || !course) {
      return;
    }

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
    if (!currentModule || !course) {
      return;
    }

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
    () =>
      currentModule
        ? favoriteItems.filter((item) => item.moduleId === currentModule.id)
        : [],
    [currentModule, favoriteItems]
  );
  const processedMaterials = useMemo(() => {
    const filtered = materials.filter(
      (material) => matchesFilter(material, filterBy) && matchesSearch(material, searchQuery)
    );
    return sortMaterials(filtered, sortBy);
  }, [filterBy, materials, searchQuery, sortBy]);

  if (loading) {
    return <Spinner centered label="Loading module workspace..." />;
  }

  if (!course || !currentModule) {
    return null;
  }

  return (
    <>
      <div className="relative overflow-hidden">
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
                materialCount={materials.length}
                pinnedCount={pinnedItems.length}
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
                    Try another filter, clear the search, or add the first study item for this module.
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

            <ModulePinnedSidebar items={pinnedItems} />
          </div>
        </div>
      </div>

      {toast ? <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}
    </>
  );
}
