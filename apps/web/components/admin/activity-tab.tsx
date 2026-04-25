"use client";

import { useCallback, useEffect, useState } from "react";

import { useAdminRefresh } from "./admin-refresh";
import { useAdminContext } from "./admin-context";
import { useFilteredData } from "./use-filtered-data";
import { Pagination } from "./pagination";
import { SkeletonTable } from "./skeleton-table";
import { ExportButton } from "./export-button";

type LogEntry = {
  id: number;
  actionType: string;
  targetId: number | null;
  details: Record<string, unknown> | null;
  createdAt: string;
  userName: string;
  userEmail: string;
};

const SEARCHABLE: (keyof LogEntry)[] = ["actionType", "userName", "userEmail"];
const ACTIVITY_LOGS_POLL_MS = 60_000;
const LOGS_BATCH_SIZE = 200;

export function ActivityTab() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextBackendPage, setNextBackendPage] = useState(2);
  const [page, setPage] = useState(1);

  const { searchQuery, viewAsFilter, settings } = useAdminContext();
  const filtered = useFilteredData(logs, searchQuery, SEARCHABLE, viewAsFilter, "userEmail");
  const paged = filtered.slice((page - 1) * settings.itemsPerPage, page * settings.itemsPerPage);

  useEffect(() => { setPage(1); }, [searchQuery]);

  const fetchLogs = useCallback(() => {
    void (async () => {
      const res = await fetch(`/api/admin/activity-logs?page=1&limit=${LOGS_BATCH_SIZE}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setHasMore(Boolean(data.hasMore));
        setNextBackendPage(2);
      }
      setLoading(false);
    })();
  }, []);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    void (async () => {
      const res = await fetch(`/api/admin/activity-logs?page=${nextBackendPage}&limit=${LOGS_BATCH_SIZE}`);
      if (res.ok) {
        const data = await res.json();
        setLogs((prev) => [...prev, ...((data.logs || []) as LogEntry[])]);
        setHasMore(Boolean(data.hasMore));
        setNextBackendPage((p) => p + 1);
      }
      setLoadingMore(false);
    })();
  }, [loadingMore, hasMore, nextBackendPage]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useAdminRefresh({
    onManualRefresh: fetchLogs,
    onDataChanged: fetchLogs,
    pollMs: ACTIVITY_LOGS_POLL_MS,
  });

  if (loading) {
    return <SkeletonTable rows={5} columns={5} />;
  }

  return (
    <>
      <div className="mb-4">
        <ExportButton
          data={filtered as unknown as Record<string, unknown>[]}
          headers={["Time", "User", "Action", "Target", "Details"]}
          keys={["createdAt", "userName", "actionType", "targetId", "details"]}
          filename="activity_logs"
        />
      </div>
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
            {paged.map((log) => (
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
        {filtered.length === 0 && (
          <p className="mt-4 text-center text-slate-500 dark:text-slate-400">
            No activity logs yet.
          </p>
        )}
      </div>

      <Pagination
        currentPage={page}
        totalItems={filtered.length}
        itemsPerPage={settings.itemsPerPage}
        onPageChange={setPage}
      />

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </>
  );
}
