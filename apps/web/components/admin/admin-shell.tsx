"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import { AnimatePresence, motion } from "framer-motion";
import { AdminProvider, useAdminContext } from "./admin-context";
import { dispatchAdminManualRefresh } from "./admin-refresh";
import { SearchBar } from "./search-bar";
import { SettingsModal } from "./settings-modal";
import { ViewAsFilter } from "./view-as-filter";
import { OverviewTab } from "./overview-tab";
import { SkeletonTable } from "./skeleton-table";
import { PageBackgroundShell } from "../layout/page-background-shell";
import {
  PREMIUM_DARK_BUTTON,
  PREMIUM_DARK_CARD_BG,
  PREMIUM_DARK_INPUT,
  PREMIUM_DARK_PANEL_BG,
} from "../layout/premium-dark-styles";

const UsersTab     = dynamic(() => import("./users-tab").then((m) => m.UsersTab), { loading: () => <SkeletonTable rows={5} columns={6} />, ssr: false });
const MaterialsTab = dynamic(() => import("./materials-tab").then((m) => m.MaterialsTab), { loading: () => <SkeletonTable rows={5} columns={7} />, ssr: false });
const CoursesTab   = dynamic(() => import("./courses-tab").then((m) => m.CoursesTab), { loading: () => <SkeletonTable rows={5} columns={7} />, ssr: false });
const ModulesTab   = dynamic(() => import("./modules-tab").then((m) => m.ModulesTab), { loading: () => <SkeletonTable rows={5} columns={6} />, ssr: false });
const ActivityTab  = dynamic(() => import("./activity-tab").then((m) => m.ActivityTab), { loading: () => <SkeletonTable rows={5} columns={5} />, ssr: false });
const NetworkMapTab = dynamic(() => import("./network-map-tab").then((m) => m.NetworkMapTab), { loading: () => <div className={`h-[500px] animate-pulse rounded-xl bg-slate-100 dark:border dark:border-slate-800/80 ${PREMIUM_DARK_CARD_BG}`} />, ssr: false });
const MembersTab    = dynamic(() => import("./members-tab").then((m) => m.MembersTab), { loading: () => <SkeletonTable rows={5} columns={5} />, ssr: false });
const PostsTab      = dynamic(() => import("./posts-tab").then((m) => m.PostsTab), { loading: () => <SkeletonTable rows={5} columns={6} />, ssr: false });

const TABS = ["Overview", "Users", "Materials", "Courses", "Modules", "Members", "Moderation", "Activity Logs", "Network Map"] as const;
type Tab = (typeof TABS)[number];

type AdminDataProps = {
  initialStats: any;
  initialQueue: any;
  initialStorage: any;
  initialActivity: any;
};

function AdminContent({ initialStats, initialQueue, initialStorage, initialActivity }: AdminDataProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [showSettings, setShowSettings] = useState(false);
  const { searchQuery, setSearchQuery } = useAdminContext();

  return (
    <PageBackgroundShell contentClassName="max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="bg-v1-gradient bg-clip-text text-3xl font-black tracking-tight text-transparent font-shantell">
            Admin Panel
          </h1>
          <span className="rounded-full bg-primary-500/10 border border-primary-500/20 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-primary-600 dark:text-primary-300">
            System Control
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={dispatchAdminManualRefresh}
            className={`rounded-xl border border-slate-200 bg-white/50 px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur-md transition-all hover:bg-white hover:text-primary-600 hover:shadow-md dark:border-cyan-400/10 dark:text-slate-200 dark:hover:text-primary-300 ${PREMIUM_DARK_BUTTON}`}
            title="Refresh active admin data"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className={`rounded-xl border border-slate-200 bg-white/50 p-2.5 text-slate-500 shadow-sm backdrop-blur-md transition-all hover:bg-white hover:text-primary-600 hover:shadow-md dark:border-cyan-400/10 dark:text-slate-300 dark:hover:text-primary-300 ${PREMIUM_DARK_BUTTON}`}
            title="Settings"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* View As + Search */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <ViewAsFilter />
        <div className="flex-1 sm:max-w-md">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      </div>

      {/* Tabs — dropdown on mobile, tab bar on desktop */}
      <div className="mt-6">
        {/* Mobile dropdown */}
        <div className="sm:hidden">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as Tab)}
            className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm dark:border-cyan-400/10 ${PREMIUM_DARK_INPUT}`}
          >
            {TABS.map((tab) => (
              <option key={tab} value={tab}>{tab}</option>
            ))}
          </select>
        </div>

        {/* Desktop tab bar */}
        <div className="hidden gap-1 overflow-x-auto border-b border-slate-200 hide-scrollbar dark:border-cyan-400/10 sm:flex">
          {TABS.map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative whitespace-nowrap px-6 py-3.5 text-sm font-bold tracking-tight transition-all ${
                activeTab === tab
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content — premium glassmorphism panel */}
      <div className="mt-8 min-h-[600px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`rounded-[2rem] border border-white/20 bg-white/40 p-8 shadow-glass backdrop-blur-xl dark:border-cyan-400/10 ${PREMIUM_DARK_PANEL_BG}`}
          >
            {activeTab === "Overview" && <OverviewTab onNavigateToModeration={() => setActiveTab("Moderation")} initialStats={initialStats} initialQueue={initialQueue} initialStorage={initialStorage} initialActivity={initialActivity} />}
            {activeTab === "Users" && <UsersTab />}
            {activeTab === "Materials" && <MaterialsTab />}
            {activeTab === "Courses" && <CoursesTab />}
            {activeTab === "Modules" && <ModulesTab />}
            {activeTab === "Members" && <MembersTab />}
            {activeTab === "Moderation" && <PostsTab />}
            {activeTab === "Activity Logs" && <ActivityTab />}
            {activeTab === "Network Map" && <NetworkMapTab />}
          </motion.div>
        </AnimatePresence>
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      </div>
    </PageBackgroundShell>
  );
}

export function AdminShell(props: AdminDataProps) {
  return (
    <AdminProvider>
      <AdminContent {...props} />
    </AdminProvider>
  );
}
