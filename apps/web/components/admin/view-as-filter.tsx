"use client";

import { useEffect, useState } from "react";
import { useAdminContext } from "./admin-context";

type FilterUser = {
  name: string;
  email: string;
};

export function ViewAsFilter() {
  const { viewAsFilter, setViewAsFilter } = useAdminContext();
  const [detectedUsers, setDetectedUsers] = useState<FilterUser[]>([]);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.users) {
          setDetectedUsers(
            data.users.map((u: { name: string; email: string }) => ({
              name: u.name,
              email: u.email,
            }))
          );
        }
      });
  }, []);

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
        View As:
      </label>
      <select
        value={viewAsFilter}
        onChange={(e) => setViewAsFilter(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
      >
        <option value="all">Global Administrator (All)</option>
        {detectedUsers.map((u) => (
          <option key={u.email} value={u.email}>
            {u.name} ({u.email})
          </option>
        ))}
      </select>
    </div>
  );
}
