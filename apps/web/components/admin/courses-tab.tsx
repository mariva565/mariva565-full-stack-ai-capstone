"use client";

import { useCallback, useEffect, useState, useRef, useMemo } from "react";

import {
  dispatchAdminDataChanged,
  useAdminRefresh,
} from "./admin-refresh";
import { readErrorMessage } from "../../lib/http";
import { ConfirmModal } from "../ui/confirm-modal";
import { Toast, type ToastTone } from "../ui/toast";
import { EditModal } from "./edit-modal";
import { BulkActionToolbar } from "./bulk-action-toolbar";
import { useBulkSelection } from "./use-bulk-selection";
import { useAdminContext } from "./admin-context";
import { Pagination } from "./pagination";
import { ExportButton } from "./export-button";
import { SkeletonTable } from "./skeleton-table";
import { AdminMobileCard } from "./admin-mobile-card";
import { buildPagedListUrl, fetchAllPagedItems } from "./paged-list-utils";
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

export function CoursesTab() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [courseToDelete, setCourseToDelete] = useState<Pick<AdminCourse, "id" | "title"> | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null);
  const [bulkDeleteBusy, setBulkDeleteBusy] = useState(false);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ tone: ToastTone; message: string } | null>(null);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const { searchQuery, viewAsFilter, settings } = useAdminContext();
  const pagedIds = useMemo(() => courses.map((course) => course.id), [courses]);
  const bulk = useBulkSelection(pagedIds);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const res = await fetch(buildPagedListUrl("/api/admin/courses", {
      page,
      limit: settings.itemsPerPage,
      search: searchQuery,
      viewAs: viewAsFilter,
    }));
    if (res.ok) {
      const data = await res.json();
      setCourses(data.courses || []);
      setTotalCourses(data.total || 0);
    }
    setLoading(false);
  }, [page, searchQuery, settings.itemsPerPage, viewAsFilter]);

  useEffect(() => { setPage(1); }, [searchQuery, viewAsFilter, settings.itemsPerPage]);
  useEffect(() => { void fetchCourses(); }, [fetchCourses]);
  useAdminRefresh({ onManualRefresh: () => void fetchCourses() });

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = bulk.checkboxState === "some";
    }
  }, [bulk.checkboxState]);

  async function confirmDeleteCourse() {
    if (!courseToDelete) return;
    setDeleteBusy(true);
    const res = await fetch(`/api/admin/courses/${courseToDelete.id}`, { method: "DELETE" });
    setDeleteBusy(false);
    if (res.ok) {
      setCourseToDelete(null);
      if (courses.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await fetchCourses();
      }
      dispatchAdminDataChanged();
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
      dispatchAdminDataChanged();
    }
  }

  if (loading) {
    return <SkeletonTable rows={5} columns={6} />;
  }

  return (
    <>
      <div className="mb-4">
        <ExportButton
          data={courses as unknown as Record<string, unknown>[]}
          headers={["Title", "Description", "Author", "Created"]}
          keys={["title", "description", "authorName", "createdAt"]}
          filename="courses"
          loadData={() =>
            fetchAllPagedItems<AdminCourse>("/api/admin/courses", "courses", {
              search: searchQuery,
              viewAs: viewAsFilter,
            }) as Promise<Record<string, unknown>[]>
          }
        />
      </div>
      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {courses.map((course) => (
          <AdminMobileCard
            key={course.id}
            checked={bulk.isSelected(course.id)}
            onCheck={() => bulk.toggle(course.id)}
            title={course.title}
            subtitle={course.authorName}
            badge={undefined}
            meta={[
              ...(course.description ? [{ label: "Desc", value: <span className="max-w-[160px] truncate block">{course.description}</span> }] : []),
              { label: "Created", value: new Date(course.createdAt).toLocaleDateString() },
            ]}
            onEdit={() => setEditingCourse(course)}
            onDelete={() => setCourseToDelete({ id: course.id, title: course.title })}
          />
        ))}
        {totalCourses === 0 && <p className="text-center text-slate-500 dark:text-slate-400">No courses found.</p>}
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
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Created</th>
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {courses.map((course) => (
              <tr key={course.id} className={`transition-colors hover:bg-slate-50/60 dark:hover:bg-white/5 ${bulk.isSelected(course.id) ? "bg-brand-50/50 dark:bg-brand-500/5" : ""}`}>
                <td className="py-3">
                  <input type="checkbox" checked={bulk.isSelected(course.id)} onChange={() => bulk.toggle(course.id)} className="rounded border-slate-300 dark:border-slate-600" />
                </td>
                <td className="py-3 font-medium text-slate-900 dark:text-white">{course.title}</td>
                <td className="py-3 max-w-[200px] truncate text-slate-600 dark:text-slate-400">{course.description || "—"}</td>
                <td className="py-3 text-slate-600 dark:text-slate-400">{course.authorName}</td>
                <td className="py-3 text-slate-500 dark:text-slate-400">{new Date(course.createdAt).toLocaleDateString()}</td>
                <td className="py-3 flex gap-2">
                  <button onClick={() => setEditingCourse(course)} className="text-xs font-medium text-brand-500 hover:text-brand-700 dark:text-brand-400">Edit</button>
                  <button onClick={() => setCourseToDelete({ id: course.id, title: course.title })} className="text-xs font-medium text-red-500 hover:text-red-700 dark:text-red-400">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalCourses === 0 && (
          <p className="mt-4 text-center text-slate-500 dark:text-slate-400">No courses found.</p>
        )}
      </div>

      <Pagination currentPage={page} totalItems={totalCourses} itemsPerPage={settings.itemsPerPage} onPageChange={setPage} />

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

      <EditModal isOpen={editingCourse !== null} entityType="course" entity={editingCourse} onClose={() => setEditingCourse(null)} onSaved={() => void fetchCourses()} />

      {toast ? <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}
    </>
  );
}
