"use client";

import { FormEvent, useState } from "react";
import type { Milestone } from "./milestone-timeline";

type Props = {
  ideas: Milestone[];
  onAdd: (title: string, description: string) => void;
  onPromote: (id: number) => void;
  onDelete: (id: number) => void;
  addBusy: boolean;
};

export function IdeasBacklog({ ideas, onAdd, onPromote, onDelete, addBusy }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), description.trim());
    setTitle("");
    setDescription("");
    setShowForm(false);
  }

  return (
    <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
            Ideas Backlog
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Feature ideas and improvements for later
          </p>
        </div>
        <span className="text-sm text-cyan-400 font-medium">{ideas.length}</span>
      </div>

      {ideas.length > 0 && (
        <ul className="space-y-2 mb-4">
          {ideas.map((idea) => (
            <li
              key={idea.id}
              className="rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{idea.title}</p>
                  {idea.description && (
                    <p className="text-xs text-slate-400 mt-1">{idea.description}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => onPromote(idea.id)}
                    className="rounded px-2 py-1 text-xs text-cyan-400 hover:bg-cyan-400/10 transition-colors"
                    title="Move to timeline"
                  >
                    Promote
                  </button>
                  <button
                    onClick={() => onDelete(idea.id)}
                    className="rounded px-2 py-1 text-xs text-slate-500 hover:text-red-400 transition-colors"
                    title="Remove idea"
                  >
                    ✕
                  </button>
                </div>
              </div>
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
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            autoFocus
          />
          <textarea
            placeholder="Notes (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addBusy || !title.trim()}
              className="rounded-lg bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50 transition-colors"
            >
              {addBusy ? "Adding..." : "Add Idea"}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-lg border border-dashed border-cyan-500/30 py-2 text-sm text-cyan-400/60 hover:border-cyan-400 hover:text-cyan-400 transition-colors"
        >
          + Jot down an idea
        </button>
      )}
    </div>
  );
}
