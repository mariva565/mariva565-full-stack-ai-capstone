"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarGrid, type CalendarEvent } from "../../components/calendar/calendar-grid";
import { EventSidebar } from "../../components/calendar/event-sidebar";
import { Spinner } from "../../components/ui/spinner";
import { Toast, type ToastTone } from "../../components/ui/toast";

type ToastState = { tone: ToastTone; message: string };

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
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
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
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
    } else {
      setToast({ tone: "error", message: "Could not add event." });
    }
  }

  async function handleDeleteEvent(id: number) {
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (res.ok) {
      await loadEvents();
      setToast({ tone: "success", message: "Event deleted." });
    } else {
      setToast({ tone: "error", message: "Could not delete event." });
    }
  }

  const selectedEvents = useMemo(
    () => (selectedDate ? events.filter((e) => e.date === selectedDate) : []),
    [events, selectedDate]
  );

  if (loading && events.length === 0) {
    return <Spinner centered label="Loading calendar..." />;
  }

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors mb-4"
        >
          &larr; Dashboard
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <button
            onClick={goToToday}
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Today
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={goToPrevMonth}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
              >
                &larr;
              </button>
              <h2 className="text-lg font-semibold text-white">
                {MONTH_NAMES[month]} {year}
              </h2>
              <button
                onClick={goToNextMonth}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
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
          </div>

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

      {toast && (
        <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />
      )}
    </>
  );
}
