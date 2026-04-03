"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CourseCard } from "./course-card";
import { CreateCourseForm } from "./create-course-form";
import { EditCourseModal } from "./edit-course-modal";
import { CourseFilters, type CourseStatusFilter } from "./course-filters";
import { useDashboardCourseEditor } from "./use-dashboard-course-editor";
import { DashboardHero } from "./dashboard-hero";
import { DashboardPageShell } from "./dashboard-page-shell";
import { PinnedSidebar } from "./pinned-sidebar";
import type { DashboardCourse, DashboardData, PinnedMaterial } from "./types";
import { ConfirmModal } from "../ui/confirm-modal";
import { Toast, type ToastTone } from "../ui/toast";
import { readErrorMessage } from "../../lib/http";

type DashboardClientPageProps = {
  initialCourses: DashboardCourse[];
  initialFavorites: PinnedMaterial[];
};

type ToastState = {
  tone: ToastTone;
  message: string;
};

function matchesCourse(course: DashboardCourse, search: string, status: CourseStatusFilter): boolean {
  const normalizedSearch = search.trim().toLowerCase();
  const matchesSearch =
    normalizedSearch.length === 0 ||
    course.title.toLowerCase().includes(normalizedSearch) ||
    (course.description ?? "").toLowerCase().includes(normalizedSearch);

  const matchesStatus = status === "all" || course.status === status;
  return matchesSearch && matchesStatus;
}

export function DashboardClientPage({
  initialCourses,
  initialFavorites,
}: DashboardClientPageProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<DashboardCourse[]>(initialCourses);
  const [favorites, setFavorites] = useState<PinnedMaterial[]>(initialFavorites);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [courseStatusFilter, setCourseStatusFilter] = useState<CourseStatusFilter>("all");
  const [pinnedSearch, setPinnedSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const {
    courseToEdit,
    editTitle,
    editDescription,
    editBusy,
    openEditCourse,
    closeEditCourse,
    handleEditCourse,
    setEditTitle,
    setEditDescription,
  } = useDashboardCourseEditor({
    onSaved: refreshDashboardData,
    onToast: (tone, message) => setToast({ tone, message }),
  });

  async function refreshDashboardData() {
    try {
      const response = await fetch("/api/dashboard");

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setToast({ tone: "error", message: "Could not refresh your dashboard." });
        return;
      }

      const data = (await response.json()) as DashboardData;
      setCourses(data.courses);
      setFavorites(data.favorites);
    } catch {
      setToast({ tone: "error", message: "Could not refresh your dashboard." });
    }
  }

  async function handleCreateCourse(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setToast({ tone: "error", message: "Course title is required." });
      return;
    }

    setCreating(true);
    const response = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    setCreating(false);

    if (!response.ok) {
      setToast({
        tone: "error",
        message: await readErrorMessage(response, "Could not create course."),
      });
      return;
    }

    setTitle("");
    setDescription("");
    setShowCreateForm(false);
    await refreshDashboardData();
    setToast({ tone: "success", message: "Course created." });
  }

  async function confirmDeleteCourse() {
    if (!courseToDelete) {
      return;
    }

    setDeleteBusy(true);
    const response = await fetch(`/api/courses/${courseToDelete}`, {
      method: "DELETE",
    });
    setDeleteBusy(false);

    if (!response.ok) {
      setToast({
        tone: "error",
        message: await readErrorMessage(response, "Could not delete course."),
      });
      return;
    }

    setCourseToDelete(null);
    await refreshDashboardData();
    setToast({ tone: "success", message: "Course deleted." });
  }

  const filteredCourses = useMemo(
    () => courses.filter((course) => matchesCourse(course, courseSearch, courseStatusFilter)),
    [courseSearch, courseStatusFilter, courses]
  );

  const draftCount = courses.filter((course) => course.status === "draft").length;

  return (
    <>
      <DashboardPageShell>
        <DashboardHero
          courseCount={courses.length}
          draftCount={draftCount}
          pinnedCount={favorites.length}
          showCreateForm={showCreateForm}
          onToggleCreateForm={() => setShowCreateForm((current) => !current)}
        />

        {showCreateForm && (
          <CreateCourseForm
            title={title}
            description={description}
            creating={creating}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onSubmit={handleCreateCourse}
          />
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section>
            <CourseFilters
              searchValue={courseSearch}
              statusValue={courseStatusFilter}
              onSearchChange={setCourseSearch}
              onStatusChange={setCourseStatusFilter}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              {filteredCourses.length === 0 && (
                <p className="sm:col-span-2 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  No courses match this search or course-state filter yet.
                </p>
              )}
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEdit={openEditCourse}
                  onDelete={setCourseToDelete}
                />
              ))}
            </div>
          </section>

          <PinnedSidebar
            favorites={favorites}
            searchValue={pinnedSearch}
            activeTag={activeTag}
            onSearchChange={setPinnedSearch}
            onTagSelect={setActiveTag}
          />
        </div>
      </DashboardPageShell>

      <ConfirmModal
        isOpen={courseToDelete !== null}
        title="Delete course?"
        description="This action removes the course, modules, and materials."
        confirmLabel="Delete course"
        busy={deleteBusy}
        onCancel={() => setCourseToDelete(null)}
        onConfirm={confirmDeleteCourse}
      />

      <EditCourseModal
        isOpen={courseToEdit !== null}
        title={editTitle}
        description={editDescription}
        busy={editBusy}
        onTitleChange={setEditTitle}
        onDescriptionChange={setEditDescription}
        onSubmit={handleEditCourse}
        onCancel={closeEditCourse}
      />

      {toast ? <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}
    </>
  );
}
