"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { CourseWorkspaceHeader } from "../../../components/course/course-workspace-header";
import { ModuleList } from "../../../components/course/module-list";
import type { ModuleInfo } from "../../../components/course/module-section";
import { ConfirmModal } from "../../../components/ui/confirm-modal";
import { Spinner } from "../../../components/ui/spinner";
import { Toast, type ToastTone } from "../../../components/ui/toast";
import { readErrorMessage } from "../../../lib/http";

type Course = {
  id: number;
  title: string;
  description: string | null;
};

type ToastState = {
  tone: ToastTone;
  message: string;
};

type ModuleResponse = {
  module?: ModuleInfo;
};

export default function CourseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleDescription, setNewModuleDescription] = useState("");
  const [moduleToDelete, setModuleToDelete] = useState<number | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [movingModuleId, setMovingModuleId] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    void loadPageData();
  }, [id]);

  async function loadCourseData() {
    const response = await fetch(`/api/courses/${id}`);
    if (response.status === 401) {
      router.push("/login");
      return false;
    }

    if (!response.ok) {
      router.push("/dashboard");
      return false;
    }

    const payload = (await response.json()) as { course: Course };
    setCourse(payload.course);
    return true;
  }

  async function loadModulesData() {
    const response = await fetch(`/api/courses/${id}/modules`);
    if (!response.ok) {
      setModules([]);
      return;
    }

    const payload = (await response.json()) as { modules?: ModuleInfo[] };
    setModules(payload.modules ?? []);
  }

  async function loadPageData() {
    setLoading(true);
    const success = await loadCourseData();
    if (success) {
      await loadModulesData();
    }
    setLoading(false);
  }

  function pushToast(message: string, tone: ToastTone) {
    setToast({ message, tone });
  }

  async function persistModuleOrder(nextModules: ModuleInfo[]) {
    const results = await Promise.all(
      nextModules.map(async (moduleRow, index) => {
        const response = await fetch(`/api/modules/${moduleRow.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderIndex: index }),
        });

        return response.ok;
      })
    );

    return results.every(Boolean);
  }

  async function handleAddModule(event: FormEvent) {
    event.preventDefault();
    if (!newModuleTitle.trim()) {
      pushToast("Module title is required.", "error");
      return;
    }

    const response = await fetch(`/api/courses/${id}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newModuleTitle.trim(),
        description: newModuleDescription.trim() || null,
        orderIndex: modules.length,
      }),
    });

    if (!response.ok) {
      pushToast(await readErrorMessage(response, "Could not create module."), "error");
      return;
    }

    const payload = (await response.json()) as ModuleResponse;
    if (payload.module) {
      setModules((current) => [...current, payload.module!]);
    }

    setNewModuleTitle("");
    setNewModuleDescription("");
    setShowModuleForm(false);
    pushToast("Module created.", "success");
  }

  async function handleUpdateModule(moduleId: number, title: string, description: string) {
    if (!title.trim()) {
      pushToast("Module title is required.", "error");
      return false;
    }

    const response = await fetch(`/api/modules/${moduleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), description: description.trim() || null }),
    });

    if (!response.ok) {
      pushToast(await readErrorMessage(response, "Could not update module."), "error");
      return false;
    }

    const payload = (await response.json()) as ModuleResponse;
    if (payload.module) {
      setModules((current) => current.map((item) => (item.id === moduleId ? payload.module! : item)));
    }

    pushToast("Module updated.", "success");
    return true;
  }

  async function handleMoveModule(moduleId: number, direction: "up" | "down") {
    const currentIndex = modules.findIndex((item) => item.id === moduleId);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= modules.length) {
      return;
    }

    const reordered = [...modules];
    [reordered[currentIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[currentIndex]];
    const normalized = reordered.map((moduleRow, index) => ({
      ...moduleRow,
      orderIndex: index,
    }));

    setMovingModuleId(moduleId);
    setModules(normalized);

    const reorderedSuccessfully = await persistModuleOrder(normalized);
    setMovingModuleId(null);
    if (reorderedSuccessfully) {
      pushToast("Module order updated.", "success");
      return;
    }

    pushToast("Could not update module order.", "error");
    await loadModulesData();
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
    const remainingModules = modules
      .filter((item) => item.id !== moduleToDelete)
      .map((item, index) => ({ ...item, orderIndex: index }));
    setModules(remainingModules);
    await persistModuleOrder(remainingModules);
    pushToast("Module deleted.", "success");
  }

  if (loading) {
    return <Spinner centered label="Loading course workspace..." />;
  }

  if (!course) {
    return null;
  }

  return (
    <>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-10 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-500/10" />
        <div className="pointer-events-none absolute right-0 top-24 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl dark:bg-cyan-500/10" />

        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <CourseWorkspaceHeader
            title={course.title}
            description={course.description}
            moduleCount={modules.length}
            showModuleForm={showModuleForm}
            newModuleTitle={newModuleTitle}
            newModuleDescription={newModuleDescription}
            onToggleModuleForm={() => {
              setShowModuleForm((current) => {
                const next = !current;
                if (!next) {
                  setNewModuleTitle("");
                  setNewModuleDescription("");
                }
                return next;
              });
            }}
            onModuleTitleChange={setNewModuleTitle}
            onModuleDescriptionChange={setNewModuleDescription}
            onCreateModule={handleAddModule}
          />

          <ModuleList
            modules={modules}
            movingModuleId={movingModuleId}
            onUpdateModule={handleUpdateModule}
            onDeleteModule={setModuleToDelete}
            onMoveModule={handleMoveModule}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={moduleToDelete !== null}
        title="Delete module?"
        description="This action removes the module and all of its materials."
        confirmLabel="Delete module"
        busy={deleteBusy}
        onCancel={() => setModuleToDelete(null)}
        onConfirm={confirmDeleteModule}
      />

      {toast ? <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}
    </>
  );
}
