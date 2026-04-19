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
import { useFilteredData } from "./use-filtered-data";
import { Pagination } from "./pagination";
import { ExportButton } from "./export-button";
import { SkeletonTable } from "./skeleton-table";
import { AdminMobileCard } from "./admin-mobile-card";
import { PREMIUM_DARK_CARD_BG } from "../layout/premium-dark-styles";

type AdminModule = {
  id: number;
  title: string;
  description: string | null;
  orderIndex: number;
  courseId: number;
  courseTitle: string;
  authorName: string;
  authorEmail: string;
};

const SEARCHABLE: (keyof AdminModule)[] = ["title", "courseTitle", "authorName"];

export function ModulesTab() {
  const [modulesList, setModulesList] = useState<AdminModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleToDelete, setModuleToDelete] = useState<Pick<AdminModule, "id" | "title"> | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [editingModule, setEditingModule] = useState<AdminModule | null>(null);
  const [bulkDeleteBusy, setBulkDeleteBusy] = useState(false);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ tone: ToastTone; message: string } | null>(null);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const { searchQuery, viewAsFilter, settings } = useAdminContext();
  const filtered = useFilteredData(modulesList, searchQuery, SEARCHABLE, viewAsFilter, "authorEmail");
  const paged = filtered.slice((page - 1) * settings.itemsPerPage, page * settings.itemsPerPage);
  const pagedIds = useMemo(() => paged.map((m) => m.id), [paged]);
  const bulk = useBulkSelection(pagedIds);

  useEffect(() => { setPage(1); }, [searchQuery]);
  const fetchModules = useCallback(() => {
    void (async () => {
      const res = await fetch("/api/admin/modules");
      if (res.ok) {
        const data = await res.json();
        setModulesList(data.modules || []);
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => { fetchModules(); }, [fetchModules]);
  useAdminRefresh({ onManualRefresh: fetchModules });

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = bulk.checkboxState === "some";
    }
  }, [bulk.checkboxState]);

  async function confirmDeleteModule() {
    if (!moduleToDelete) return;
    setDeleteBusy(true);
    const res = await fetch(`/api/admin/modules/${moduleToDelete.id}`, { method: "DELETE" });
    setDeleteBusy(false);
    if (res.ok) {
      setModulesList((prev) => prev.filter((m) => m.id !== moduleToDelete.id));
      setModuleToDelete(null);
      dispatchAdminDataChanged();
    } else {
      setToast({ tone: "error", message: await readErrorMessage(res, "Failed to delete module.") });
    }
  }

  async function handleBulkDelete() {
    const ids = Array.from(bulk.selectedIds);
    setBulkDeleteBusy(true);
    const res = await fetch("/api/admin/modules/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    setBulkDeleteBusy(false);
    if (res.ok) {
      bulk.deselectAll();
      await fetchModules();
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
          data={filtered as unknown as Record<string, unknown>[]}
          headers={["Title", "Course", "Author", "Order", "Created"]}
          keys={["title", "courseTitle", "authorName", "orderIndex"]}
          filename="modules"
        />
      </div>
      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {paged.map((mod) => (
          <AdminMobileCard
            key={mod.id}
            checked={bulk.isSelected(mod.id)}
            onCheck={() => bulk.toggle(mod.id)}
            title={mod.title}
            subtitle={mod.courseTitle}
            meta={[
              { label: "Author", value: mod.authorName },
              { label: "Order", value: `#${mod.orderIndex + 1}` },
            ]}
            onEdit={() => setEditingModule(mod)}
            onDelete={() => setModuleToDelete({ id: mod.id, title: mod.title })}
          />
        ))}
        {filtered.length === 0 && <p className="text-center text-slate-500 dark:text-slate-400">No modules found.</p>}
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
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Course</th>
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Author</th>
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Order</th>
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {paged.map((mod) => (
              <tr key={mod.id} className={`transition-colors hover:bg-slate-50/60 dark:hover:bg-white/5 ${bulk.isSelected(mod.id) ? "bg-brand-50/50 dark:bg-brand-500/5" : ""}`}>
                <td className="py-3">
                  <input type="checkbox" checked={bulk.isSelected(mod.id)} onChange={() => bulk.toggle(mod.id)} className="rounded border-slate-300 dark:border-slate-600" />
                </td>
                <td className="py-3 font-medium text-slate-900 dark:text-white">{mod.title}</td>
                <td className="py-3 text-slate-600 dark:text-slate-400">{mod.courseTitle}</td>
                <td className="py-3 text-slate-600 dark:text-slate-400">{mod.authorName}</td>
                <td className="py-3 text-slate-500 dark:text-slate-400">{mod.orderIndex}</td>
                <td className="py-3 flex gap-2">
                  <button onClick={() => setEditingModule(mod)} className="text-xs font-medium text-brand-500 hover:text-brand-700 dark:text-brand-400">Edit</button>
                  <button onClick={() => setModuleToDelete({ id: mod.id, title: mod.title })} className="text-xs font-medium text-red-500 hover:text-red-700 dark:text-red-400">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="mt-4 text-center text-slate-500 dark:text-slate-400">No modules found.</p>
        )}
      </div>

      <Pagination currentPage={page} totalItems={filtered.length} itemsPerPage={settings.itemsPerPage} onPageChange={setPage} />

      <BulkActionToolbar selectedCount={bulk.selectedIds.size} onDelete={handleBulkDelete} onCancel={bulk.deselectAll} busy={bulkDeleteBusy} />

      <ConfirmModal
        isOpen={moduleToDelete !== null}
        title="Delete module?"
        description={moduleToDelete ? `Delete "${moduleToDelete.title}" and all its materials. This cannot be undone.` : ""}
        confirmLabel="Delete module"
        busy={deleteBusy}
        onCancel={() => setModuleToDelete(null)}
        onConfirm={confirmDeleteModule}
      />

      <EditModal isOpen={editingModule !== null} entityType="module" entity={editingModule} onClose={() => setEditingModule(null)} onSaved={fetchModules} />

      {toast ? <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}
    </>
  );
}
