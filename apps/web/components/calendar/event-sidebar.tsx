"use client";

import { FormEvent, useState } from "react";
import type { CalendarEvent } from "./calendar-grid";

type Props = {
  date: string;
  events: CalendarEvent[];
  onAdd: (data: { title: string; description: string; type: string }) => void;
  onDelete: (id: number) => void;
  addBusy: boolean;
};

const typeOptions = [
  { value: "reminder", label: "Reminder", color: "bg-blue-400" },
  { value: "deadline", label: "Deadline", color: "bg-red-400" },
  { value: "exam", label: "Exam", color: "bg-orange-400" },
  { value: "milestone", label: "Milestone", color: "bg-violet-400" },
  { value: "personal", label: "Personal", color: "bg-emerald-400" },
];

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function EventSidebar({ date, events, onAdd, onDelete, addBusy }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("reminder");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), description: description.trim(), type });
    setTitle("");
    setDescription("");
    setType("reminder");
    setShowForm(false);
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
      <h3 className="text-sm font-semibold text-white mb-1">{formatDate(date)}</h3>

      {events.length === 0 && !showForm && (
        <p className="text-sm text-slate-500 my-4">No events on this day.</p>
      )}

      {events.length > 0 && (
        <ul className="mt-3 space-y-2">
          {events.map((ev) => {
            const opt = typeOptions.find((o) => o.value === ev.type);
            return (
              <li
                key={ev.id}
                className="flex items-start gap-2 rounded-lg bg-slate-900/50 px-3 py-2"
              >
                <span
                  className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${opt?.color ?? "bg-slate-400"}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{ev.title}</p>
                  {ev.description && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{ev.description}</p>
                  )}
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                    {ev.type}
                  </span>
                </div>
                <button
                  onClick={() => onDelete(ev.id)}
                  className="text-slate-600 hover:text-red-400 transition-colors text-xs shrink-0"
                  title="Delete event"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {showForm ? (
        <form onSubmit={handleSubmit} className="mt-3 space-y-2">
          <input
            type="text"
            placeholder="Event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
            autoFocus
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none resize-none"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
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
              className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50 transition-colors"
            >
              {addBusy ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mt-3 w-full rounded-lg border border-dashed border-slate-600 py-2 text-sm text-slate-400 hover:border-violet-500 hover:text-violet-400 transition-colors"
        >
          + Add Event
        </button>
      )}
    </div>
  );
}
