"use client";

import { useState } from "react";

import { AdminProvider, useAdminContext } from "../../components/admin/admin-context";
import { SearchBar } from "../../components/admin/search-bar";
import { StatsCards } from "../../components/admin/stats-cards";
import { SettingsModal } from "../../components/admin/settings-modal";
import { ViewAsFilter } from "../../components/admin/view-as-filter";
import { UsersTab } from "../../components/admin/users-tab";
import { MaterialsTab } from "../../components/admin/materials-tab";
import { CoursesTab } from "../../components/admin/courses-tab";
import { ModulesTab } from "../../components/admin/modules-tab";
import { ActivityTab } from "../../components/admin/activity-tab";
import { NetworkMapTab } from "../../components/admin/network-map-tab";

const TABS = ["Users", "Materials", "Courses", "Modules", "Activity Logs", "Network Map"] as const;
type Tab = (typeof TABS)[number];

function AdminContent() {
  const [activeTab, setActiveTab] = useState<Tab>("Users");
  const [showSettings, setShowSettings] = useState(false);
  const { searchQuery, setSearchQuery } = useAdminContext();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="bg-v1-gradient bg-clip-text text-2xl font-bold text-transparent">
            Admin Panel
          </h1>
          <span className="rounded-full bg-brand-500 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
            Admin
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          title="Settings"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Stats */}
      <div className="mt-6 animate-fade-in-scale">
        <StatsCards />
      </div>

      {/* View As + Search */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ViewAsFilter />
        <div className="flex-1 sm:max-w-sm">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-700">
        {TABS.map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-brand-500 text-brand-500 dark:text-brand-100"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content — glassmorphism panel */}
      <div className="mt-6 rounded-2xl border border-white/20 bg-white/80 p-6 shadow-glass backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-800/80">
        {activeTab === "Users" && <UsersTab />}
        {activeTab === "Materials" && <MaterialsTab />}
        {activeTab === "Courses" && <CoursesTab />}
        {activeTab === "Modules" && <ModulesTab />}
        {activeTab === "Activity Logs" && <ActivityTab />}
        {activeTab === "Network Map" && <NetworkMapTab />}
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminProvider>
      <AdminContent />
    </AdminProvider>
  );
}
