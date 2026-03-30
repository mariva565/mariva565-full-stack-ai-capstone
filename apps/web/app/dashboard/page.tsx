"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CourseCard } from "../../components/dashboard/course-card";
import { CreateCourseForm } from "../../components/dashboard/create-course-form";
import { CourseFilters, type CourseStatusFilter } from "../../components/dashboard/course-filters";
import { DashboardHero } from "../../components/dashboard/dashboard-hero";
import { PinnedSidebar } from "../../components/dashboard/pinned-sidebar";
import { type PinnedMaterial } from "../../components/dashboard/pinned-material-item";
import { ProgressWidget } from "../../components/dashboard/progress-widget";
import { CalendarWidget } from "../../components/dashboard/calendar-widget";
import { ConfirmModal } from "../../components/ui/confirm-modal";
import { Spinner } from "../../components/ui/spinner";
import { Toast, type ToastTone } from "../../components/ui/toast";
import { readErrorMessage } from "../../lib/http";

type Course = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
};

type ToastState = {
  tone: ToastTone;
  message: string;
};

function matchesCourse(course: Course, search: string, status: CourseStatusFilter): boolean {
  const normalizedSearch = search.trim().toLowerCase();
  const matchesSearch =
    normalizedSearch.length === 0 ||
    course.title.toLowerCase().includes(normalizedSearch) ||
    (course.description ?? "").toLowerCase().includes(normalizedSearch);

  const matchesStatus = status === "all" || course.status === status;
  return matchesSearch && matchesStatus;
}

export default function DashboardPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [favorites, setFavorites] = useState<PinnedMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [courseStatusFilter, setCourseStatusFilter] =
    useState<CourseStatusFilter>("all");
  const [pinnedSearch, setPinnedSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [milestones, setMilestones] = useState<{ id: number; title: string; status: string; dueDate: string | null }[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<{ id: number; title: string; date: string; type: string }[]>([]);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    void loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);

    const [coursesResponse, favoritesResponse, milestonesResponse, eventsResponse] = await Promise.all([
      fetch("/api/courses"),
      fetch("/api/favorites"),
      fetch("/api/milestones"),
      fetch("/api/events"),
    ]);

    if (coursesResponse.status === 401) {
      router.push("/login");
      return;
    }

    if (!coursesResponse.ok) {
      setToast({ tone: "error", message: "Could not load your dashboard." });
      setLoading(false);
      return;
    }

    const coursesData = (await coursesResponse.json()) as { courses?: Course[] };
    setCourses(coursesData.courses ?? []);

    if (favoritesResponse.ok) {
      const favoritesData = (await favoritesResponse.json()) as {
        favorites?: PinnedMaterial[];
      };
      setFavorites(favoritesData.favorites ?? []);
    } else {
      setFavorites([]);
    }

    if (milestonesResponse.ok) {
      const msData = (await milestonesResponse.json()) as { milestones?: typeof milestones };
      setMilestones(msData.milestones ?? []);
    }

    if (eventsResponse.ok) {
      const evData = (await eventsResponse.json()) as { events?: typeof calendarEvents };
      setCalendarEvents(evData.events ?? []);
    }

    setLoading(false);
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
    await loadDashboardData();
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
    await loadDashboardData();
    setToast({ tone: "success", message: "Course deleted." });
  }

  const filteredCourses = useMemo(
    () =>
      courses.filter((course) =>
        matchesCourse(course, courseSearch, courseStatusFilter)
      ),
    [courseSearch, courseStatusFilter, courses]
  );

  const draftCount = courses.filter((course) => course.status === "draft").length;

  if (loading) {
    return <Spinner centered label="Loading your workspace..." />;
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <DashboardHero
          courseCount={courses.length}
          draftCount={draftCount}
          pinnedCount={favorites.length}
          showCreateForm={showCreateForm}
          onToggleCreateForm={() => setShowCreateForm((current) => !current)}
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ProgressWidget milestones={milestones} />
          <CalendarWidget events={calendarEvents} />
        </div>

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
                  No courses match your search/filter yet.
                </p>
              )}
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} onDelete={setCourseToDelete} />
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
      </div>

      <ConfirmModal
        isOpen={courseToDelete !== null}
        title="Delete course?"
        description="This action removes the course, modules, and materials."
        confirmLabel="Delete course"
        busy={deleteBusy}
        onCancel={() => setCourseToDelete(null)}
        onConfirm={confirmDeleteCourse}
      />

      {toast && <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}
    </>
  );
}
