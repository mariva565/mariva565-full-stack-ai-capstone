"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminRefresh } from "./admin-refresh";
import { useAdminContext } from "./admin-context";
import { PREMIUM_DARK_INPUT } from "../layout/premium-dark-styles";

type FilterUser = {
  name: string;
  email: string;
};

export function ViewAsFilter() {
  const { viewAsFilter, setViewAsFilter } = useAdminContext();
  const [detectedUsers, setDetectedUsers] = useState<FilterUser[]>([]);

  const fetchUsers = useCallback(() => {
    void fetch("/api/admin/users?page=1&limit=200")
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

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useAdminRefresh({
    onManualRefresh: fetchUsers,
    onDataChanged: fetchUsers,
  });

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
        View As:
      </label>
      <select
        value={viewAsFilter}
        onChange={(e) => setViewAsFilter(e.target.value)}
        className={`rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-cyan-400/10 ${PREMIUM_DARK_INPUT}`}
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
