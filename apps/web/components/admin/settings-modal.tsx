"use client";

import { useState, useEffect } from "react";
import { useAdminContext } from "./admin-context";

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const PAGE_OPTIONS = [5, 10, 25, 50];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useAdminContext();
  const [itemsPerPage, setItemsPerPage] = useState(settings.itemsPerPage);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setItemsPerPage(settings.itemsPerPage);
      // Load maintenance mode from localStorage
      const stored = localStorage.getItem("maintenanceMode");
      setMaintenanceMode(stored === "true");
    }
  }, [isOpen, settings.itemsPerPage]);

  if (!isOpen) return null;

  function handleSave() {
    setSaving(true);
    updateSettings({ itemsPerPage });
    localStorage.setItem("maintenanceMode", String(maintenanceMode));
    setTimeout(() => {
      setSaving(false);
      onClose();
    }, 300);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Settings</h2>

        <div className="mt-4 space-y-5">
          {/* Items per page */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Items per page
            </label>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              {PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Maintenance mode */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Maintenance Mode</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Restrict site access during maintenance</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={maintenanceMode}
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                maintenanceMode ? "bg-brand-500" : "bg-slate-300 dark:bg-slate-600"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
                  maintenanceMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
