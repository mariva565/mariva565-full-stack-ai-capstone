"use client";

import { FormEvent, useState } from "react";
import type { Milestone } from "./milestone-timeline";

type Props = {
  ideas: Milestone[];
  onAdd: (title: string, description: string) => void;
  onEdit: (id: number, title: string, description: string) => Promise<boolean>;
  onPromote: (id: number) => void;
  onDelete: (id: number) => void;
  addBusy: boolean;
};

export function IdeasBacklog({ ideas, onAdd, onEdit, onPromote, onDelete, addBusy }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editBusy, setEditBusy] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd(title.trim(), description.trim());
    setTitle("");
    setDescription("");
    setShowForm(false);
  }

  function startEdit(idea: Milestone) {
    setEditingId(idea.id);
    setEditTitle(idea.title);
    setEditDescription(idea.description ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  }

  async function saveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editingId || !editTitle.trim()) return;
    setEditBusy(true);
    const ok = await onEdit(editingId, editTitle.trim(), editDescription.trim());
    setEditBusy(false);
    if (ok) cancelEdit();
  }

  return (
    <section
      id="ideas-backlog"
      className="rounded-xl border border-cyan-200 bg-cyan-50/60 p-5 dark:border-cyan-500/20 dark:bg-cyan-500/5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
            Backlog
          </p>
          <h2 className="dashboard-panel-title mt-1 text-[1.55rem]">Ideas Backlog</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Feature ideas and improvements for later
          </p>
        </div>
        <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400">{ideas.length}</span>
      </div>

      {ideas.length > 0 && (
        <ul className="mb-4 space-y-2">
          {ideas.map((idea) => (
            <li
              key={idea.id}
              className="rounded-lg border border-slate-200 bg-white/90 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/70"
            >
              {editingId === idea.id ? (
                <form onSubmit={saveEdit} className="space-y-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-cyan-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                    autoFocus
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={2}
                    placeholder="Notes (optional)"
                    className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-cyan-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editBusy || !editTitle.trim()}
                      className="rounded-lg bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-cyan-500 disabled:opacity-50"
                    >
                      {editBusy ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-100">{idea.title}</p>
                    {idea.description && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{idea.description}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => startEdit(idea)}
                      className="rounded px-2 py-1 text-xs text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                      title="Edit idea"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onPromote(idea.id)}
                      className="rounded px-2 py-1 text-xs text-cyan-700 transition-colors hover:bg-cyan-500/10 dark:text-cyan-400"
                      title="Move to timeline"
                    >
                      Promote
                    </button>
                    <button
                      onClick={() => onDelete(idea.id)}
                      className="rounded px-2 py-1 text-xs text-slate-500 transition-colors hover:text-red-500 dark:hover:text-red-400"
                      title="Remove idea"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="text"
            placeholder="Feature idea..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-cyan-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            autoFocus
          />
          <textarea
            placeholder="Notes (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-cyan-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addBusy || !title.trim()}
              className="rounded-lg bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-cyan-500 disabled:opacity-50"
            >
              {addBusy ? "Adding..." : "Add Idea"}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-lg border border-dashed border-cyan-300 py-2 text-sm text-cyan-700 transition-colors hover:border-cyan-400 hover:text-cyan-600 dark:border-cyan-500/30 dark:text-cyan-400/70 dark:hover:border-cyan-400 dark:hover:text-cyan-300"
        >
          + Jot down an idea
        </button>
      )}
    </section>
  );
}
