"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type SpinnerProps = {
  label?: string;
  centered?: boolean;
  tips?: string[];
};

const DEFAULT_TIPS = [
  "Tip: Use filters like Today and Next 7 Days to stay focused.",
  "Tip: Keep Ideas backlog small and promote only actionable items.",
  "Tip: Mark finished milestones quickly to keep progress accurate.",
  "Tip: Use Due Soon panel as your daily check-in list.",
];

function useTipRotation(enabled: boolean, tipCount: number) {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (!enabled || tipCount < 2) return;
    const timer = window.setInterval(() => {
      setTipIndex((current) => (current + 1) % tipCount);
    }, 2500);

    return () => {
      window.clearInterval(timer);
    };
  }, [enabled, tipCount]);

  return tipIndex;
}

export function Spinner({ label = "Loading your workspace...", centered = false, tips }: SpinnerProps) {
  const resolvedTips = useMemo(() => {
    if (!tips || tips.length === 0) return DEFAULT_TIPS;
    return tips;
  }, [tips]);

  const tipIndex = useTipRotation(centered, resolvedTips.length);
  const containerClass = centered
    ? "relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-14"
    : "relative flex items-center overflow-hidden";

  return (
    <div className={containerClass} role="status" aria-live="polite">
      {centered && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-100 via-white to-cyan-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
          <div className="pointer-events-none absolute -left-20 top-16 h-72 w-72 rounded-full bg-brand-300/35 blur-3xl dark:bg-brand-500/20" />
          <div className="pointer-events-none absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-cyan-300/40 blur-3xl dark:bg-cyan-500/20" />
        </>
      )}

      <div className="relative w-full max-w-xl rounded-3xl border border-white/45 bg-white/75 p-7 shadow-[0_25px_70px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:p-9 dark:border-slate-700/70 dark:bg-slate-900/70">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6 flex h-40 w-40 items-center justify-center rounded-3xl border border-white/60 bg-gradient-to-br from-white to-slate-100 shadow-inner sm:h-44 sm:w-44 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
            <div className="pointer-events-none absolute -inset-1 rounded-[1.2rem] bg-gradient-to-br from-brand-200/35 to-cyan-300/35 blur-md dark:from-brand-500/20 dark:to-cyan-500/20" />
            <div className="relative flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">
              <div className="absolute inset-0 rounded-full border-4 border-brand-100/90 dark:border-slate-700" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-500 border-r-cyan-400 animate-spin" />
              <div className="absolute inset-5 rounded-full bg-gradient-to-br from-brand-100 via-white to-cyan-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800" />
              <div className="absolute h-3 w-3 rounded-full bg-brand-500 shadow-[0_0_22px_rgba(99,102,241,0.55)] animate-pulse" />
              <div className="absolute bottom-2 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:bg-slate-800/80 dark:text-slate-300">
                loading
              </div>
            </div>
          </div>

          <p className="text-xl font-bold text-slate-800 sm:text-2xl dark:text-slate-100">{label}</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={tipIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="mt-3 min-h-12 max-w-lg text-base text-slate-600 dark:text-slate-300"
            >
              {resolvedTips[tipIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
