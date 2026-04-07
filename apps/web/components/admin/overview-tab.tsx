"use client";

import { motion } from "framer-motion";
import { useAdminContext } from "./admin-context";
import { AdminHero } from "./hero/AdminHero";
import { ActivityChart } from "./activity-chart";
import { StatsCards } from "./stats-cards";

export function OverviewTab() {
  const { viewAsFilter } = useAdminContext();
  const isGlobalView = viewAsFilter === "all";

  return (
    <div className="space-y-8">
      {/* Hello Admin */}
      <AdminHero />

      {isGlobalView ? (
        <>
          {/* Stats Summary */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 rounded-full bg-primary-500" />
              <h3 className="text-xl font-black text-slate-800 dark:text-white font-shantell tracking-tight">
                Key Metrics
              </h3>
            </div>
            <StatsCards />
          </div>

          {/* Main Grid: Activity & Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Activity Chart - 2/3 width */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 rounded-full bg-primary-500" />
                <h3 className="text-xl font-black text-slate-800 dark:text-white font-shantell tracking-tight">
                  Activity Overview
                </h3>
              </div>
              <ActivityChart />
            </div>

            {/* Quick Insights - 1/3 width */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 rounded-full bg-primary-500" />
                <h3 className="text-xl font-black text-slate-800 dark:text-white font-shantell tracking-tight">
                  System Insights
                </h3>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-3xl border border-white/20 bg-white/50 p-6 shadow-glass backdrop-blur-md dark:border-white/10 dark:bg-slate-800/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-slate-900 dark:text-white">Moderation Queue</h4>
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[0.65rem] font-black uppercase tracking-wider text-slate-500 dark:bg-slate-700/50 dark:text-slate-400">
                    Planned
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-400">Flagged Materials</span>
                    <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-black text-white">0</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-400">New User Requests</span>
                    <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-black text-white">3</span>
                  </div>
                </div>
                <button className="mt-6 w-full py-3 rounded-2xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 font-bold text-sm transition-colors hover:bg-indigo-500/20">
                  Process Queue
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="rounded-3xl border border-white/20 bg-primary-500/5 p-6 shadow-glass backdrop-blur-md dark:border-primary-500/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">Storage Usage</h4>
                  <span className="rounded-md bg-primary-500/10 px-1.5 py-0.5 text-[0.65rem] font-black uppercase tracking-wider text-primary-600 dark:bg-primary-500/20 dark:text-primary-400">
                    Mock
                  </span>
                </div>
                <div className="mt-4 h-2 w-full rounded-full bg-indigo-100 dark:bg-slate-700 overflow-hidden text-transparent">
                  <div className="h-full w-[12%] bg-gradient-to-r from-primary-500 to-cyan-500" />
                </div>
                <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  1.2 GB of 10 GB (Cloudflare R2)
                </p>
              </motion.div>
            </div>
          </div>
        </>
      ) : (
        /* User-perspective view — no admin stats */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-slate-200/60 bg-white/50 p-8 text-center shadow-glass backdrop-blur-md dark:border-white/10 dark:bg-slate-800/40"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10">
            <svg className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white font-shantell">
            User Perspective
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Viewing as a regular user. Admin statistics, activity charts, and system insights are not visible in this view. Switch to other tabs to preview user-specific content.
          </p>
        </motion.div>
      )}
    </div>
  );
}
