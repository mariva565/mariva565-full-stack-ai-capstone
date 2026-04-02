"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarGrid, type CalendarEvent } from "../../components/calendar/calendar-grid";
import { EventSidebar } from "../../components/calendar/event-sidebar";
import { Spinner } from "../../components/ui/spinner";
import { Toast, type ToastTone } from "../../components/ui/toast";

type ToastState = { tone: ToastTone; message: string };

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function CalendarPage() {
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  );
  const [addBusy, setAddBusy] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    void loadEvents();
  }, [year, month]);

  async function loadEvents() {
    setLoading(true);
    const monthStr = `${year}-${pad(month + 1)}`;
    const res = await fetch(`/api/events?month=${monthStr}`);
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.ok) {
      const data = (await res.json()) as { events: CalendarEvent[] };
      setEvents(data.events);
    }
    setLoading(false);
  }

  function goToPrevMonth() {
    if (month === 0) {
      setYear((value) => value - 1);
      setMonth(11);
      return;
    }

    setMonth((value) => value - 1);
  }

  function goToNextMonth() {
    if (month === 11) {
      setYear((value) => value + 1);
      setMonth(0);
      return;
    }

    setMonth((value) => value + 1);
  }

  function goToToday() {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDate(
      `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
    );
  }

  async function handleAddEvent(data: { title: string; description: string; type: string }) {
    if (!selectedDate) return;

    setAddBusy(true);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, date: selectedDate }),
    });
    setAddBusy(false);

    if (res.ok) {
      await loadEvents();
      setToast({ tone: "success", message: "Event added." });
      return;
    }

    setToast({ tone: "error", message: "Could not add event." });
  }

  async function handleDeleteEvent(id: number) {
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (res.ok) {
      await loadEvents();
      setToast({ tone: "success", message: "Event deleted." });
      return;
    }

    setToast({ tone: "error", message: "Could not delete event." });
  }

  const selectedEvents = useMemo(
    () => (selectedDate ? events.filter((event) => event.date === selectedDate) : []),
    [events, selectedDate]
  );

  if (loading && events.length === 0) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,rgba(248,250,252,0.96)_0%,rgba(241,245,249,0.92)_100%)] dark:bg-slate-900">
        <Spinner centered label="Loading calendar..." />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[radial-gradient(circle_at_82%_14%,rgba(125,211,252,0.2)_0%,rgba(196,181,253,0.14)_20%,rgba(255,255,255,0)_44%),linear-gradient(180deg,rgba(248,250,252,0.98)_0%,rgba(241,245,249,0.96)_55%,rgba(238,242,255,0.94)_100%)] dark:bg-[radial-gradient(circle_at_82%_14%,rgba(34,211,238,0.16)_0%,rgba(168,85,247,0.12)_20%,rgba(15,23,42,0)_44%),linear-gradient(180deg,rgba(2,8,22,0.98)_0%,rgba(5,11,24,0.97)_55%,rgba(8,15,30,0.98)_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Link
            href="/progress"
            className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-brand-700 dark:text-slate-400 dark:hover:text-cyan-200"
          >
            &larr; Progress
          </Link>

          <section className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-[linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(248,250,252,0.94)_55%,rgba(238,242,255,0.92)_100%)] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] dark:border-cyan-400/10 dark:bg-[radial-gradient(circle_at_82%_16%,rgba(226,232,240,0.14)_0%,rgba(148,163,184,0.08)_18%,rgba(15,23,42,0)_42%),linear-gradient(160deg,rgba(15,24,48,0.96)_0%,rgba(8,16,38,0.95)_58%,rgba(5,12,28,0.98)_100%)]">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Progress
              </p>
              <h1 className="dashboard-script-title mt-3 text-4xl md:text-5xl">Calendar</h1>
            </div>

            <button
              onClick={goToToday}
              className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-600 shadow-[0_10px_30px_rgba(148,163,184,0.14)] transition hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-950/55 dark:text-slate-300 dark:hover:border-cyan-400/30 dark:hover:text-cyan-200 sm:w-auto"
            >
              Today
            </button>
          </section>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)]">
            <section className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-[0_18px_45px_rgba(148,163,184,0.16)] dark:border-cyan-400/10 dark:bg-slate-950/45 dark:shadow-[0_20px_50px_rgba(8,15,30,0.38)] sm:p-5">
              <div className="mb-4 flex items-center gap-3 sm:mb-5">
                <button
                  onClick={goToPrevMonth}
                  className="rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-950/55 dark:text-slate-400 dark:hover:border-cyan-400/30 dark:hover:text-cyan-200"
                >
                  &larr;
                </button>
                <div className="min-w-0 flex-1 text-center">
                  <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-100">
                    {MONTH_NAMES[month]} {year}
                  </h2>
                </div>
                <button
                  onClick={goToNextMonth}
                  className="rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-950/55 dark:text-slate-400 dark:hover:border-cyan-400/30 dark:hover:text-cyan-200"
                >
                  &rarr;
                </button>
              </div>

              <CalendarGrid
                year={year}
                month={month}
                events={events}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            </section>

            {selectedDate && (
              <EventSidebar
                date={selectedDate}
                events={selectedEvents}
                onAdd={handleAddEvent}
                onDelete={handleDeleteEvent}
                addBusy={addBusy}
              />
            )}
          </div>
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />
      )}
    </>
  );
}
