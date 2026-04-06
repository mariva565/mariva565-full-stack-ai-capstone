"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAnimatedCounter } from "./use-animated-counter";

type Stats = { users: number; courses: number; modules: number; materials: number };

/* ── v1 Bootstrap Icons as SVG paths ── */

function CoursesIcon() {
  return (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16">
      {/* bi-journal-bookmark-fill */}
      <path fillRule="evenodd" d="M6 1h6v7a.5.5 0 0 1-.757.429L9 7.083 6.757 8.43A.5.5 0 0 1 6 8z" />
      <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2" />
      <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z" />
    </svg>
  );
}

function ModulesIcon() {
  return (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16">
      {/* bi-layers-fill */}
      <path d="M7.765 1.559a.5.5 0 0 1 .47 0l7.5 4a.5.5 0 0 1 0 .882l-7.5 4a.5.5 0 0 1-.47 0l-7.5-4a.5.5 0 0 1 0-.882z" />
      <path d="m2.125 8.567-1.86.992a.5.5 0 0 0 0 .882l7.5 4a.5.5 0 0 0 .47 0l7.5-4a.5.5 0 0 0 0-.882l-1.86-.992-5.17 2.756a1.5 1.5 0 0 1-1.41 0z" />
    </svg>
  );
}

function MaterialsIcon() {
  return (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16">
      {/* bi-file-earmark-text-fill */}
      <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M4.5 9a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1zM4 10.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16">
      {/* bi-people-fill */}
      <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
    </svg>
  );
}

/* ── v1-faithful gradient backgrounds ── */
const CARDS: { key: keyof Stats; label: string; icon: ReactNode; gradient: string }[] = [
  { key: "courses",   label: "Courses",   icon: <CoursesIcon />,   gradient: "from-[#6366f1] to-[#8b5cf6]" },
  { key: "modules",   label: "Modules",   icon: <ModulesIcon />,   gradient: "from-[#06b6d4] to-[#0ea5e9]" },
  { key: "materials", label: "Materials", icon: <MaterialsIcon />, gradient: "from-[#f59e0b] to-[#f97316]" },
  { key: "users",     label: "Users",     icon: <UsersIcon />,     gradient: "from-[#ec4899] to-[#f43f5e]" },
];

function StatCard({ label, icon, gradient, value }: {
  label: string; icon: ReactNode; gradient: string; value: number;
}) {
  const display = useAnimatedCounter(value);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-5 shadow-glass backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-v1-glow dark:border-slate-700/50 dark:bg-slate-800/70">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{display}</p>
        </div>
      </div>
    </div>
  );
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats>({ users: 0, courses: 0, modules: 0, materials: 0 });

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setStats(data); });
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {CARDS.map((card) => (
        <StatCard
          key={card.key}
          label={card.label}
          icon={card.icon}
          gradient={card.gradient}
          value={stats[card.key]}
        />
      ))}
    </div>
  );
}
