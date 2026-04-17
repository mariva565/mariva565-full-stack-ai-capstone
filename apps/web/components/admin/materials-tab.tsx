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

type AdminMaterial = {
  id: number;
  title: string;
  materialType: string;
  createdAt: string;
  moduleTitle: string;
  courseTitle: string;
  authorName: string;
  authorEmail: string;
};

const SEARCHABLE: (keyof AdminMaterial)[] = ["title", "materialType", "courseTitle", "authorName"];

export function MaterialsTab() {
  const [materials, setMaterials] = useState<AdminMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [materialToDelete, setMaterialToDelete] = useState<Pick<AdminMaterial, "id" | "title"> | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<AdminMaterial | null>(null);
  const [bulkDeleteBusy, setBulkDeleteBusy] = useState(false);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ tone: ToastTone; message: string } | null>(null);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const { searchQuery, viewAsFilter, settings } = useAdminContext();
  const filtered = useFilteredData(materials, searchQuery, SEARCHABLE, viewAsFilter, "authorEmail");
  const paged = filtered.slice((page - 1) * settings.itemsPerPage, page * settings.itemsPerPage);
  const pagedIds = useMemo(() => paged.map((m) => m.id), [paged]);
  const bulk = useBulkSelection(pagedIds);

  useEffect(() => { setPage(1); }, [searchQuery]);
  useEffect(() => { fetchMaterials(); }, []);

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = bulk.checkboxState === "some";
    }
  }, [bulk.checkboxState]);

  async function fetchMaterials() {
    const res = await fetch("/api/admin/materials");
    if (res.ok) {
      const data = await res.json();
      setMaterials(data.materials || []);
    }
    setLoading(false);
  }

  async function confirmDeleteMaterial() {
    if (!materialToDelete) return;
    setDeleteBusy(true);
    const res = await fetch(`/api/admin/materials/${materialToDelete.id}`, { method: "DELETE" });
    setDeleteBusy(false);
    if (res.ok) {
      setMaterials((prev) => prev.filter((m) => m.id !== materialToDelete.id));
      setMaterialToDelete(null);
    } else {
      setToast({ tone: "error", message: await readErrorMessage(res, "Failed to delete material.") });
    }
  }

  async function handleBulkDelete() {
    const ids = Array.from(bulk.selectedIds);
    setBulkDeleteBusy(true);
    const res = await fetch("/api/admin/materials/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    setBulkDeleteBusy(false);
    if (res.ok) {
      bulk.deselectAll();
      await fetchMaterials();
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
          headers={["Title", "Type", "Course", "Author", "Created"]}
          keys={["title", "materialType", "courseTitle", "authorName", "createdAt"]}
          filename="materials"
        />
      </div>
      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {paged.map((mat) => (
          <AdminMobileCard
            key={mat.id}
            checked={bulk.isSelected(mat.id)}
            onCheck={() => bulk.toggle(mat.id)}
            title={mat.title}
            subtitle={`${mat.moduleTitle} · ${mat.courseTitle}`}
            badge={
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                {mat.materialType}
              </span>
            }
            meta={[
              { label: "Author", value: mat.authorName },
              { label: "Created", value: new Date(mat.createdAt).toLocaleDateString() },
            ]}
            onEdit={() => setEditingMaterial(mat)}
            onDelete={() => setMaterialToDelete({ id: mat.id, title: mat.title })}
          />
        ))}
        {filtered.length === 0 && <p className="text-center text-slate-500 dark:text-slate-400">No materials found.</p>}
      </div>

      {/* Desktop table view */}
      <div className={`hidden overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/60 p-4 shadow-sm md:block dark:border-slate-700/60 ${PREMIUM_DARK_CARD_BG}`}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="pb-3 w-8">
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  checked={bulk.checkboxState === "all"}
                  onChange={bulk.toggleAll}
                  className="rounded border-slate-300 dark:border-slate-600"
                />
              </th>
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Title</th>
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Type</th>
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Course</th>
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Author</th>
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Created</th>
              <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {paged.map((mat) => (
              <tr key={mat.id} className={`transition-colors hover:bg-slate-50/60 dark:hover:bg-white/5 ${bulk.isSelected(mat.id) ? "bg-brand-50/50 dark:bg-brand-500/5" : ""}`}>
                <td className="py-3">
                  <input
                    type="checkbox"
                    checked={bulk.isSelected(mat.id)}
                    onChange={() => bulk.toggle(mat.id)}
                    className="rounded border-slate-300 dark:border-slate-600"
                  />
                </td>
                <td className="py-3 font-medium text-slate-900 dark:text-white">{mat.title}</td>
                <td className="py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {mat.materialType}
                  </span>
                </td>
                <td className="py-3 text-slate-600 dark:text-slate-400">{mat.courseTitle}</td>
                <td className="py-3 text-slate-600 dark:text-slate-400">{mat.authorName}</td>
                <td className="py-3 text-slate-500 dark:text-slate-400">
                  {new Date(mat.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 flex gap-2">
                  <button onClick={() => setEditingMaterial(mat)} className="text-xs font-medium text-brand-500 hover:text-brand-700 dark:text-brand-400">Edit</button>
                  <button onClick={() => setMaterialToDelete({ id: mat.id, title: mat.title })} className="text-xs font-medium text-red-500 hover:text-red-700 dark:text-red-400">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="mt-4 text-center text-slate-500 dark:text-slate-400">No materials found.</p>
        )}
      </div>

      <Pagination currentPage={page} totalItems={filtered.length} itemsPerPage={settings.itemsPerPage} onPageChange={setPage} />

      <BulkActionToolbar selectedCount={bulk.selectedIds.size} onDelete={handleBulkDelete} onCancel={bulk.deselectAll} busy={bulkDeleteBusy} />

      <ConfirmModal
        isOpen={materialToDelete !== null}
        title="Delete material?"
        description={materialToDelete ? `Delete "${materialToDelete.title}". This action cannot be undone.` : ""}
        confirmLabel="Delete material"
        busy={deleteBusy}
        onCancel={() => setMaterialToDelete(null)}
        onConfirm={confirmDeleteMaterial}
      />

      <EditModal isOpen={editingMaterial !== null} entityType="material" entity={editingMaterial} onClose={() => setEditingMaterial(null)} onSaved={fetchMaterials} />

      {toast ? <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}
    </>
  );
}
