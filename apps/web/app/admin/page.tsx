"use client";

import { useState } from "react";

import { UsersTab } from "../../components/admin/users-tab";
import { MaterialsTab } from "../../components/admin/materials-tab";
import { ActivityTab } from "../../components/admin/activity-tab";

const TABS = ["Users", "Materials", "Activity Logs"] as const;
type Tab = (typeof TABS)[number];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Users");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Admin Panel
      </h1>

      <div className="mt-6 flex gap-1 border-b border-slate-200 dark:border-slate-700">
        {TABS.map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-brand-500 text-brand-500 dark:text-brand-100"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        {activeTab === "Users" && <UsersTab />}
        {activeTab === "Materials" && <MaterialsTab />}
        {activeTab === "Activity Logs" && <ActivityTab />}
      </div>
    </div>
  );
}
