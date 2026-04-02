"use client";

import { FormEvent, useState } from "react";
import type { CalendarEvent } from "./types";
import { TrashIcon } from "../ui/action-icons";

type Props = {
  date: string;
  events: CalendarEvent[];
  onAdd: (data: { title: string; description: string; type: string }) => void;
  onDelete: (id: number) => void;
  addBusy: boolean;
};

const typeOptions = [
  { value: "reminder", label: "Reminder", color: "bg-cyan-500" },
  { value: "deadline", label: "Deadline", color: "bg-red-400" },
  { value: "exam", label: "Exam", color: "bg-orange-400" },
  { value: "milestone", label: "Milestone", color: "bg-violet-400" },
  { value: "personal", label: "Personal", color: "bg-emerald-400" },
];

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-GB", {
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
  const eventCountLabel =
    events.length === 0
      ? "Nothing scheduled yet."
      : `${events.length} ${events.length === 1 ? "event" : "events"} scheduled.`;

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
    <section className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-[0_18px_45px_rgba(148,163,184,0.16)] dark:border-cyan-400/10 dark:bg-slate-950/45 dark:shadow-[0_20px_50px_rgba(8,15,30,0.38)] sm:p-5">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
        Day view
      </p>
      <h3 className="mb-1 mt-2 text-sm font-semibold text-slate-700 dark:text-slate-100">
        {formatDate(date)}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400">{eventCountLabel}</p>

      {events.length > 0 && (
        <ul className="mt-3 space-y-2">
          {events.map((event) => {
            const option = typeOptions.find((item) => item.value === event.type);
            return (
              <li
                key={event.id}
                className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 dark:border-slate-700 dark:bg-slate-950/35"
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${option?.color ?? "bg-slate-400"}`}
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-100">
                    {event.title}
                  </p>
                  {event.description && (
                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                      {event.description}
                    </p>
                  )}
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {event.type}
                  </span>
                </div>

                <button
                  onClick={() => onDelete(event.id)}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-400 transition hover:-translate-y-0.5 hover:border-rose-200 hover:text-rose-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-500 dark:hover:border-rose-500/30 dark:hover:text-rose-400"
                  title="Delete"
                  aria-label="Delete"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
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
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-violet-400 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            autoFocus
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-violet-400 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-violet-400 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

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
              className="rounded-full bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] px-3 py-1.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-50"
            >
              {addBusy ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mt-3 w-full rounded-xl border border-dashed border-slate-300 py-2 text-sm text-slate-500 transition hover:border-violet-300 hover:text-brand-700 dark:border-slate-600 dark:text-slate-400 dark:hover:border-violet-500 dark:hover:text-violet-300"
        >
          + Add Event
        </button>
      )}
    </section>
  );
}
