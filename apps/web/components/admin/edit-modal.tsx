"use client";

import { useState, useEffect } from "react";
import { readErrorMessage } from "../../lib/http";
import { PREMIUM_DARK_INPUT, PREMIUM_DARK_MODAL_BG } from "../layout/premium-dark-styles";

type EntityType = "material" | "course" | "module";

type EditModalProps = {
  isOpen: boolean;
  entityType: EntityType;
  entity: { id: number; title: string; description?: string | null; orderIndex?: number } | null;
  onClose: () => void;
  onSaved: () => void;
};

const API_MAP: Record<EntityType, string> = {
  material: "/api/admin/materials",
  course: "/api/admin/courses",
  module: "/api/admin/modules",
};

export function EditModal({ isOpen, entityType, entity, onClose, onSaved }: EditModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (entity) {
      setTitle(entity.title);
      setDescription(entity.description ?? "");
      setOrderIndex(entity.orderIndex ?? 0);
      setError("");
    }
  }, [entity]);

  if (!isOpen || !entity) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const body: Record<string, unknown> = { title: title.trim() };
    if (entityType === "course") body.description = description.trim();
    if (entityType === "module") body.orderIndex = orderIndex;

    setBusy(true);
    const res = await fetch(`${API_MAP[entityType]}/${entity!.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);

    if (res.ok) {
      onSaved();
      onClose();
    } else {
      setError(await readErrorMessage(res, "Failed to save changes."));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-cyan-400/10 ${PREMIUM_DARK_MODAL_BG}`}
      >
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Edit {entityType}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-cyan-400/10 ${PREMIUM_DARK_INPUT}`}
            />
          </div>

          {entityType === "course" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-cyan-400/10 ${PREMIUM_DARK_INPUT}`}
              />
            </div>
          )}

          {entityType === "module" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Order Index</label>
              <input
                type="number"
                min={0}
                value={orderIndex}
                onChange={(e) => setOrderIndex(parseInt(e.target.value, 10) || 0)}
                className={`mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-cyan-400/10 ${PREMIUM_DARK_INPUT}`}
              />
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
            >
              {busy ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
