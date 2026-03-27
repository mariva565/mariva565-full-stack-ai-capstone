"use client";

import { useEffect, useState } from "react";

type LogEntry = {
  id: number;
  actionType: string;
  targetId: number | null;
  details: Record<string, unknown> | null;
  createdAt: string;
  userName: string;
  userEmail: string;
};

export function ActivityTab() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    const res = await fetch("/api/admin/activity-logs?limit=100");
    if (res.ok) {
      const data = await res.json();
      setLogs(data.logs || []);
    }
    setLoading(false);
  }

  if (loading) {
    return <p className="text-slate-500 dark:text-slate-400">Loading activity...</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Time</th>
            <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">User</th>
            <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Action</th>
            <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Target</th>
            <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                {new Date(log.createdAt).toLocaleString()}
              </td>
              <td className="py-3 text-slate-900 dark:text-white">{log.userName}</td>
              <td className="py-3">
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/20 dark:text-brand-100">
                  {log.actionType}
                </span>
              </td>
              <td className="py-3 text-slate-500 dark:text-slate-400">
                {log.targetId ?? "—"}
              </td>
              <td className="py-3 max-w-[200px] truncate text-xs text-slate-400 dark:text-slate-500">
                {log.details ? JSON.stringify(log.details) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {logs.length === 0 && (
        <p className="mt-4 text-center text-slate-500 dark:text-slate-400">
          No activity logs yet.
        </p>
      )}
    </div>
  );
}
