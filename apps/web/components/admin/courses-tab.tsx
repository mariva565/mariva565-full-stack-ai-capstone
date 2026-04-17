"use client";

import { useEffect, useState, useRef, useMemo } from "react";

import { readErrorMessage } from "../../lib/http";
import { ConfirmModal } from "../ui/confirm-modal";
import { Toast, type ToastTone } from "../ui/toast";
import { EditModal } from "./edit-modal";
import { BulkActionToolbar } from "./bulk-action-toolbar";
import { useBulkSelection } from "./use-bulk-selection";
import { useAdminContext } from "./admin-context";
import { useFilteredData } from "./use-filtered-data";
import { Pagination } from "./pagination";
import { ExportButton } from "./export-button";
import { SkeletonTable } from "./skeleton-table";
import { AdminMobileCard } from "./admin-mobile-card";
import { PREMIUM_DARK_CARD_BG } from "../layout/premium-dark-styles";

type AdminCourse = {
  id: number;
  title: string;
  description: string | null;
  isPublic: boolean;
  status: string;
  createdAt: string;
  authorName: string;
  authorEmail: string;
};

const SEARCHABLE: (keyof AdminCourse)[] = ["title", "description", "authorName", "status"];

export function CoursesTab() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseToDelete, setCourseToDelete] = useState<Pick<AdminCourse, "id" | "title"> | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null);
  const [bulkDeleteBusy, setBulkDeleteBusy] = useState(false);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ tone: ToastTone; message: string } | null>(null);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const { searchQuery, viewAsFilter, settings } = useAdminContext();
  const filtered = useFilteredData(courses, searchQuery, SEARCHABLE, viewAsFilter, "authorEmail");
  const paged = filtered.slice((page - 1) * settings.itemsPerPage, page * settings.itemsPerPage);
  const pagedIds = useMemo(() => paged.map((c) => c.id), [paged]);
  const bulk = useBulkSelection(pagedIds);

  useEffect(() => { setPage(1); }, [searchQuery]);
  useEffect(() => { fetchCourses(); }, []);

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = bulk.checkboxState === "some";
    }
  }, [bulk.checkboxState]);

  async function fetchCourses() {
    const res = await fetch("/api/admin/courses");
    if (res.ok) {
      const data = await res.json();
      setCourses(data.courses || []);
    }
    setLoading(false);
  }

  async function confirmDeleteCourse() {
    if (!courseToDelete) return;
    setDeleteBusy(true);
    const res = await fetch(`/api/admin/courses/${courseToDelete.id}`, { method: "DELETE" });
    setDeleteBusy(false);
    if (res.ok) {
      setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
      setCourseToDelete(null);
    } else {
      setToast({ tone: "error", message: await readErrorMessage(res, "Failed to delete course.") });
    }
  }

  async function handleBulkDelete() {
    const ids = Array.from(bulk.selectedIds);
    setBulkDeleteBusy(true);
    const res = await fetch("/api/admin/courses/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    setBulkDeleteBusy(false);
    if (res.ok) {
      bulk.deselectAll();
      await fetchCourses();
    }
  }

  if (loading) {
    return <SkeletonTable rows={5} columns={7} />;
  }

  return (
    <>
      <div className="mb-4">
        <ExportButton
          data={filtered as unknown as Record<string, unknown>[]}
          headers={["Title", "Description", "Author", "Status", "Created"]}
          keys={["title", "description", "authorName", "status", "createdAt"]}
          filename="courses"
        />
      </div>
      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {paged.map((course) => (
          <AdminMobileCard
            key={course.id}
            checked={bulk.isSelected(course.id)}
            onCheck={() => bulk.toggle(course.id)}
            title={course.title}
            subtitle={course.authorName}
            badge={
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${course.status === "published" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"}`}>
                {course.status}
              </span>
            }
            meta={[
              ...(course.description ? [{ label: "Desc", value: <span className="max-w-[160px] truncate block">{course.description}</span> }] : []),
              { label: "Created", value: new Date(course.createdAt).toLocaleDateString() },
            ]}
            onEdit={() => setEditingCourse(course)}
            onDelete={() => setCourseToDelete({ id: course.id, title: course.title })}
          />
        ))}
        {filtered.length === 0 && <p className="text-center text-slate-500 dark:text-slate-400">No courses found.</p>}
      </div>

      {/* Desktop table view */}
      <div className={`hidden overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/60 p-4 shadow-sm md:block dark:border-slate-700/60 ${PREMIUM_DARK_CARD_BG}`}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="pb-3 w-8">
                <input ref={headerCheckboxRef} type="checkbox" checked={bulk.checkboxState === "all"} onChange={bulk.toggleAll} className="rounded border-slate-300 dark:border-slate-600" />
              </th>
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Title</th>
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Description</th>
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Author</th>
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Status</th>
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Created</th>
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {paged.map((course) => (
              <tr key={course.id} className={`transition-colors hover:bg-slate-50/60 dark:hover:bg-white/5 ${bulk.isSelected(course.id) ? "bg-brand-50/50 dark:bg-brand-500/5" : ""}`}>
                <td className="py-3">
                  <input type="checkbox" checked={bulk.isSelected(course.id)} onChange={() => bulk.toggle(course.id)} className="rounded border-slate-300 dark:border-slate-600" />
                </td>
                <td className="py-3 font-medium text-slate-900 dark:text-white">{course.title}</td>
                <td className="py-3 max-w-[200px] truncate text-slate-600 dark:text-slate-400">{course.description || "—"}</td>
                <td className="py-3 text-slate-600 dark:text-slate-400">{course.authorName}</td>
                <td className="py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${course.status === "published" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"}`}>
                    {course.status}
                  </span>
                </td>
                <td className="py-3 text-slate-500 dark:text-slate-400">{new Date(course.createdAt).toLocaleDateString()}</td>
                <td className="py-3 flex gap-2">
                  <button onClick={() => setEditingCourse(course)} className="text-xs font-medium text-brand-500 hover:text-brand-700 dark:text-brand-400">Edit</button>
                  <button onClick={() => setCourseToDelete({ id: course.id, title: course.title })} className="text-xs font-medium text-red-500 hover:text-red-700 dark:text-red-400">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="mt-4 text-center text-slate-500 dark:text-slate-400">No courses found.</p>
        )}
      </div>

      <Pagination currentPage={page} totalItems={filtered.length} itemsPerPage={settings.itemsPerPage} onPageChange={setPage} />

      <BulkActionToolbar selectedCount={bulk.selectedIds.size} onDelete={handleBulkDelete} onCancel={bulk.deselectAll} busy={bulkDeleteBusy} />

      <ConfirmModal
        isOpen={courseToDelete !== null}
        title="Delete course?"
        description={courseToDelete ? `Delete "${courseToDelete.title}" and all its modules and materials. This cannot be undone.` : ""}
        confirmLabel="Delete course"
        busy={deleteBusy}
        onCancel={() => setCourseToDelete(null)}
        onConfirm={confirmDeleteCourse}
      />

      <EditModal isOpen={editingCourse !== null} entityType="course" entity={editingCourse} onClose={() => setEditingCourse(null)} onSaved={fetchCourses} />

      {toast ? <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}
    </>
  );
}
