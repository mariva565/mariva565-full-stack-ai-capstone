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
  month: number; // 0-indexed
  events: CalendarEvent[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
};

const typeColors: Record<string, string> = {
  deadline: "bg-red-400",
  exam: "bg-orange-400",
  milestone: "bg-violet-400",
  reminder: "bg-blue-400",
  personal: "bg-emerald-400",
};

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function CalendarGrid({ year, month, events, selectedDate, onSelectDate }: Props) {
  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    // Monday=0 ... Sunday=6
    const startDow = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: { day: number | null; dateStr: string }[] = [];

    // Leading empty cells
    for (let i = 0; i < startDow; i++) {
      cells.push({ day: null, dateStr: "" });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        dateStr: `${year}-${pad(month + 1)}-${pad(d)}`,
      });
    }

    return cells;
  }, [year, month]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of events) {
      (map[ev.date] ??= []).push(ev);
    }
    return map;
  }, [events]);

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }, []);

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-slate-500 py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((cell, i) => {
          if (cell.day === null) {
            return <div key={`empty-${i}`} />;
          }

          const dayEvents = eventsByDate[cell.dateStr] ?? [];
          const isToday = cell.dateStr === todayStr;
          const isSelected = cell.dateStr === selectedDate;

          return (
            <button
              key={cell.dateStr}
              onClick={() => onSelectDate(cell.dateStr)}
              className={`relative flex flex-col items-center rounded-lg py-2 px-1 min-h-[3.5rem] transition-colors ${
                isSelected
                  ? "bg-violet-600/30 border border-violet-500"
                  : isToday
                  ? "bg-slate-700/50 border border-slate-600"
                  : "hover:bg-slate-800 border border-transparent"
              }`}
            >
              <span
                className={`text-sm ${
                  isToday ? "font-bold text-violet-400" : "text-slate-300"
                }`}
              >
                {cell.day}
              </span>

              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <span
                      key={ev.id}
                      className={`h-1.5 w-1.5 rounded-full ${
                        ev.color
                          ? ""
                          : typeColors[ev.type] ?? "bg-slate-400"
                      }`}
                      style={ev.color ? { backgroundColor: ev.color } : undefined}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[9px] text-slate-500">+{dayEvents.length - 3}</span>
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
