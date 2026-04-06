"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type AdminSettings = {
  itemsPerPage: number;
};

type AdminContextValue = {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  viewAsFilter: string;         // "all" or a user email
  setViewAsFilter: (v: string) => void;
  settings: AdminSettings;
  updateSettings: (patch: Partial<AdminSettings>) => void;
};

const STORAGE_KEY = "adminSettings";
const DEFAULT_SETTINGS: AdminSettings = { itemsPerPage: 10 };

function loadSettings(): AdminSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewAsFilter, setViewAsFilter] = useState("all");
  const [settings, setSettings] = useState<AdminSettings>(loadSettings);

  const updateSettings = useCallback((patch: Partial<AdminSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AdminContext.Provider value={{ searchQuery, setSearchQuery, viewAsFilter, setViewAsFilter, settings, updateSettings }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminContext(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdminContext must be used inside AdminProvider");
  return ctx;
}
