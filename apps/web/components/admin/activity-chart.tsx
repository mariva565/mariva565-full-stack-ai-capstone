"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ActivityData = { day: string; value: number };

const HEIGHT = 200;
const WIDTH = 600;

export function ActivityChart() {
  const [data, setData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/admin/activity-stats")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch activity stats:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-[328px] w-full items-center justify-center rounded-3xl border border-white/20 bg-white/50 shadow-glass backdrop-blur-md dark:border-white/10 dark:bg-slate-800/50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="text-sm font-bold text-slate-500 animate-pulse">Loading live stats...</p>
        </div>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="flex h-[328px] w-full items-center justify-center rounded-3xl border border-white/20 bg-white/50 shadow-glass backdrop-blur-md dark:border-white/10 dark:bg-slate-800/50">
        <p className="text-sm font-bold text-slate-500 italic">No activity data available yet.</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 10); // Minimum scale of 10
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * WIDTH;
      const y = HEIGHT - (d.value / maxValue) * HEIGHT;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-3xl border border-white/20 bg-white/50 p-8 shadow-glass backdrop-blur-md dark:border-white/10 dark:bg-slate-800/50">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white font-shantell tracking-tight">System Activity</h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total actions tracked in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-lg bg-green-500/10 px-2 py-1 text-xs font-bold text-green-600 dark:text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
            Live
          </span>
        </div>
      </div>

      <div className="relative h-[220px] w-full">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT + 20}`} className="h-full w-full overflow-visible">
          {/* Grid lines */}
          {[0, 0.5, 1].map((p) => (
            <line
              key={p}
              x1="0"
              y1={HEIGHT * p}
              x2={WIDTH}
              y2={HEIGHT * p}
              stroke="currentColor"
              strokeOpacity={p === 1 ? "0.1" : "0.05"}
            />
          ))}

          {/* Area fill */}
          <motion.polyline
            fill="url(#chartGradient)"
            stroke="none"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: 1, pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            points={`${points} ${WIDTH},${HEIGHT} 0,${HEIGHT}`}
          />

          {/* Line */}
          <motion.polyline
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            points={points}
          />

          {/* Data points (only for larger intervals or small datasets) */}
          {data.length < 20 &&
            data.map((d, i) => {
              const x = (i / (data.length - 1)) * WIDTH;
              const y = HEIGHT - (d.value / maxValue) * HEIGHT;
              return (
                <motion.circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  className="fill-primary-600 dark:fill-primary-400 stroke-white dark:stroke-slate-900 stroke-2"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + i * 0.05 }}
                />
              );
            })}

          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Labels - sparse labeling */}
        <div className="absolute bottom-[-15px] left-0 right-0 flex justify-between px-1">
          {data
            .filter((_, i) => i === 0 || i === data.length - 1 || (data.length > 5 && i === Math.floor(data.length / 2)))
            .map((d, i) => (
              <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {d.day}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
}
