"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CourseWorkspaceHeader } from "../../../components/course/course-workspace-header";
import { ModuleList } from "../../../components/course/module-list";
import { ConfirmModal } from "../../../components/ui/confirm-modal";
import { Spinner } from "../../../components/ui/spinner";
import { Toast, type ToastTone } from "../../../components/ui/toast";
import {
  matchesFilter,
  matchesSearch,
  sortMaterials,
  type CourseMaterial,
} from "../../../lib/course-materials";
import { readErrorMessage } from "../../../lib/http";
import {
  prepareTagsFromInput,
  resolveMaterialTitle,
  type MaterialFilter,
  type MaterialSort,
} from "../../../lib/materials";
import type { MaterialDraft, ModuleInfo } from "../../../components/course/module-section";

type Course = { id: number; title: string; description: string | null };
type ModuleResponse = { module?: ModuleInfo };
type MaterialResponse = { material?: CourseMaterial };
type ToastState = { tone: ToastTone; message: string };
const EMPTY_MATERIAL_DRAFT: MaterialDraft = { title: "", content: "", materialType: "note", fileUrl: "", tags: "" };

export default function CourseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [materialsByModule, setMaterialsByModule] = useState<Record<number, CourseMaterial[]>>({});
  const [favoriteMaterialIds, setFavoriteMaterialIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [moduleToDelete, setModuleToDelete] = useState<number | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [activeMaterialFormModuleId, setActiveMaterialFormModuleId] = useState<number | null>(null);
  const [materialDraft, setMaterialDraft] = useState<MaterialDraft>(EMPTY_MATERIAL_DRAFT);
  const [pinBusyMaterialId, setPinBusyMaterialId] = useState<number | null>(null);
  const [filterBy, setFilterBy] = useState<MaterialFilter>("all");
  const [sortBy, setSortBy] = useState<MaterialSort>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<ToastState | null>(null);
  useEffect(() => {
    void loadPageData();
  }, [id]);
  async function loadCourseData() {
    const courseResponse = await fetch(`/api/courses/${id}`);
    if (courseResponse.status === 401) {
      router.push("/login");
      return false;
    }
    if (!courseResponse.ok) {
      router.push("/dashboard");
      return false;
    }
    const coursePayload = (await courseResponse.json()) as { course: Course };
    setCourse(coursePayload.course);
    const modulesResponse = await fetch(`/api/courses/${id}/modules`);
    const modulesPayload = (await modulesResponse.json()) as { modules?: ModuleInfo[] };
    const moduleRows = modulesPayload.modules ?? [];
    setModules(moduleRows);
    const materialPairs = await Promise.all(
      moduleRows.map(async (moduleRow) => {
        const materialsResponse = await fetch(`/api/modules/${moduleRow.id}/materials`);
        const materialsPayload = (await materialsResponse.json()) as { materials?: CourseMaterial[] };
        return [moduleRow.id, materialsPayload.materials ?? []] as const;
      })
    );
    const nextMap: Record<number, CourseMaterial[]> = {};
    for (const [moduleId, materials] of materialPairs) {
      nextMap[moduleId] = materials;
    }
    setMaterialsByModule(nextMap);
    return true;
  }
  async function loadFavorites() {
    const response = await fetch("/api/favorites");
    if (!response.ok) {
      setFavoriteMaterialIds([]);
      return;
    }
    const data = (await response.json()) as { favorites?: { materialId: number }[] };
    setFavoriteMaterialIds((data.favorites ?? []).map((favorite) => favorite.materialId));
  }
  async function loadPageData() {
    setLoading(true);
    const success = await loadCourseData();
    if (success) {
      await loadFavorites();
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
  function toggleMaterialForm(moduleId: number) {
    setMaterialDraft(EMPTY_MATERIAL_DRAFT);
    setActiveMaterialFormModuleId((current) => (current === moduleId ? null : moduleId));
  }

  async function handleAddModule(event: FormEvent) {
    event.preventDefault();
    if (!newModuleTitle.trim()) {
      return;
    }
    const response = await fetch(`/api/courses/${id}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newModuleTitle, orderIndex: modules.length }),
    });
    if (!response.ok) {
      pushToast(await readErrorMessage(response, "Could not create module."), "error");
      return;
    }
    const payload = (await response.json()) as ModuleResponse;
    if (payload.module) {
      setModules((current) => [...current, payload.module as ModuleInfo]);
      setMaterialsByModule((current) => ({ ...current, [payload.module!.id]: [] }));
    }
    setNewModuleTitle("");
    setShowModuleForm(false);
    pushToast("Module created.", "success");
  }
  async function handleRenameModule(moduleId: number, title: string) {
    if (!title.trim()) {
      pushToast("Module title is required.", "error");
      return false;
    }

    const response = await fetch(`/api/modules/${moduleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) {
      pushToast(await readErrorMessage(response, "Could not rename module."), "error");
      return false;
    }
    const payload = (await response.json()) as ModuleResponse;
    if (payload.module) {
      setModules((current) => current.map((item) => (item.id === moduleId ? payload.module! : item)));
    }
    pushToast("Module renamed.", "success");
    return true;
  }
  async function confirmDeleteModule() {
    if (!moduleToDelete) {
      return;
    }
    setDeleteBusy(true);
    const response = await fetch(`/api/modules/${moduleToDelete}`, { method: "DELETE" });
    setDeleteBusy(false);
    if (!response.ok) {
      pushToast(await readErrorMessage(response, "Could not delete module."), "error");
      return;
    }
    setModuleToDelete(null);
    setModules((current) => current.filter((item) => item.id !== moduleToDelete));
    setMaterialsByModule((current) => {
      const next = { ...current };
      delete next[moduleToDelete];
      return next;
    });
    pushToast("Module deleted.", "success");
  }
  async function handleAddMaterial(moduleId: number, event: FormEvent) {
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
    const response = await fetch(`/api/modules/${moduleId}/materials`, {
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
    if (!response.ok) {
      pushToast(await readErrorMessage(response, "Could not create material."), "error");
      return;
    }
    const payload = (await response.json()) as MaterialResponse;
    if (payload.material) {
      setMaterialsByModule((current) => ({
        ...current,
        [moduleId]: [payload.material as CourseMaterial, ...(current[moduleId] ?? [])],
      }));
    }
    setMaterialDraft(EMPTY_MATERIAL_DRAFT);
    setActiveMaterialFormModuleId(null);
    pushToast("Material created.", "success");
  }
  async function togglePin(materialId: number, isPinned: boolean) {
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
    setFavoriteMaterialIds((current) =>
      isPinned ? current.filter((id) => id !== materialId) : [...current, materialId]
    );
    pushToast(isPinned ? "Material unpinned." : "Material pinned.", "success");
  }
  const favoriteMaterialSet = useMemo(() => new Set(favoriteMaterialIds), [favoriteMaterialIds]);
  const processedMaterialsByModule = useMemo(() => {
    const nextMap: Record<number, CourseMaterial[]> = {};
    for (const [moduleId, materials] of Object.entries(materialsByModule)) {
      const prepared = materials.filter(
        (material) => matchesFilter(material, filterBy) && matchesSearch(material, searchQuery)
      );
      nextMap[Number(moduleId)] = sortMaterials(prepared, sortBy);
    }
    return nextMap;
  }, [filterBy, materialsByModule, searchQuery, sortBy]);
  if (loading) {
    return <Spinner centered label="Loading course workspace..." />;
  }
  if (!course) {
    return null;
  }
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <CourseWorkspaceHeader
          title={course.title}
          description={course.description}
          searchQuery={searchQuery}
          sortBy={sortBy}
          filterBy={filterBy}
          showModuleForm={showModuleForm}
          newModuleTitle={newModuleTitle}
          onSearchQueryChange={setSearchQuery}
          onSortChange={setSortBy}
          onFilterChange={setFilterBy}
          onToggleModuleForm={() => setShowModuleForm((current) => !current)}
          onModuleTitleChange={setNewModuleTitle}
          onCreateModule={handleAddModule}
        />
        <ModuleList
          modules={modules}
          materialsByModule={processedMaterialsByModule}
          activeMaterialFormModuleId={activeMaterialFormModuleId}
          materialDraft={materialDraft}
          pinBusyMaterialId={pinBusyMaterialId}
          favoriteMaterialIds={favoriteMaterialSet}
          onToggleCreateForm={toggleMaterialForm}
          onDraftChange={updateMaterialDraft}
          onRenameModule={handleRenameModule}
          onSubmitMaterial={handleAddMaterial}
          onDeleteModule={setModuleToDelete}
          onTogglePin={togglePin}
        />
      </div>
      <ConfirmModal
        isOpen={moduleToDelete !== null}
        title="Delete module?"
        description="This action will remove the module and all of its materials."
        confirmLabel="Delete module"
        busy={deleteBusy}
        onCancel={() => setModuleToDelete(null)}
        onConfirm={confirmDeleteModule}
      />
      {toast && <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}
    </>
  );
}
