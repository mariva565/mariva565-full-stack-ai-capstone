"use client";

import { useMemo } from "react";

export type CalendarEvent = {
  id: number;
  title: string;
  description: string | null;
  date: string;
  type: string;
  color: string | null;
  courseId: number | null;
  milestoneId: number | null;
};

type Props = {
  year: number;
  month: number;
  events: CalendarEvent[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
};

const typeColors: Record<string, string> = {
  deadline: "bg-red-400",
  exam: "bg-orange-400",
  milestone: "bg-violet-400",
  reminder: "bg-cyan-500",
  personal: "bg-emerald-400",
};

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function CalendarGrid({ year, month, events, selectedDate, onSelectDate }: Props) {
  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const startDow = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: { day: number | null; dateStr: string }[] = [];

    for (let i = 0; i < startDow; i += 1) {
      cells.push({ day: null, dateStr: "" });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({
        day,
        dateStr: `${year}-${pad(month + 1)}-${pad(day)}`,
      });
    }

    return cells;
  }, [year, month]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const event of events) {
      (map[event.date] ??= []).push(event);
    }
    return map;
  }, [events]);

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }, []);

  return (
    <div>
      <div className="mb-1 grid grid-cols-7">
        {DAY_NAMES.map((dayName) => (
          <div
            key={dayName}
            className="py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400"
          >
            {dayName}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((cell, index) => {
          if (cell.day === null) {
            return <div key={`empty-${index}`} />;
          }

          const dayEvents = eventsByDate[cell.dateStr] ?? [];
          const isToday = cell.dateStr === todayStr;
          const isSelected = cell.dateStr === selectedDate;

          return (
            <button
              key={cell.dateStr}
              onClick={() => onSelectDate(cell.dateStr)}
              className={`relative flex min-h-[3.75rem] flex-col items-center rounded-xl border px-1 py-2 transition ${
                isSelected
                  ? "border-violet-300 bg-violet-50 shadow-[0_10px_26px_rgba(139,92,246,0.12)] dark:border-violet-500/60 dark:bg-violet-500/16"
                  : isToday
                  ? "border-slate-300 bg-white/95 shadow-sm dark:border-slate-600 dark:bg-slate-800/70"
                  : "border-transparent hover:border-slate-200 hover:bg-white/80 dark:hover:border-slate-700 dark:hover:bg-slate-800/55"
              }`}
            >
              <span
                className={`text-sm ${
                  isToday
                    ? "font-bold text-brand-700 dark:text-cyan-200"
                    : isSelected
                    ? "font-semibold text-brand-700 dark:text-slate-100"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {cell.day}
              </span>

              {dayEvents.length > 0 && (
                <div className="mt-1 flex flex-wrap justify-center gap-0.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <span
                      key={event.id}
                      className={`h-1.5 w-1.5 rounded-full ${
                        event.color ? "" : typeColors[event.type] ?? "bg-slate-400"
                      }`}
                      style={event.color ? { backgroundColor: event.color } : undefined}
                    />
                  ))}

                  {dayEvents.length > 3 && (
                    <span className="text-[9px] text-slate-400 dark:text-slate-500">
                      +{dayEvents.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
