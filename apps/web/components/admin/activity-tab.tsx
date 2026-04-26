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
  userName: string | null;
  userEmail: string | null;
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
  const [loadMoreError, setLoadMoreError] = useState("");

  const { searchQuery, viewAsFilter, settings } = useAdminContext();
  const filtered = useFilteredData(logs, searchQuery, SEARCHABLE, viewAsFilter, "userEmail");
  const totalPages = Math.max(1, Math.ceil(filtered.length / settings.itemsPerPage));
  const paged = filtered.slice((page - 1) * settings.itemsPerPage, page * settings.itemsPerPage);

  useEffect(() => { setPage(1); }, [searchQuery, viewAsFilter, settings.itemsPerPage]);
  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const fetchLogs = useCallback(() => {
    void (async () => {
      const res = await fetch(`/api/admin/activity-logs?page=1&limit=${LOGS_BATCH_SIZE}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setHasMore(Boolean(data.hasMore));
        setNextBackendPage(2);
        setLoadMoreError("");
      }
      setLoading(false);
    })();
  }, []);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    void (async () => {
      try {
        const res = await fetch(`/api/admin/activity-logs?page=${nextBackendPage}&limit=${LOGS_BATCH_SIZE}`);
        if (!res.ok) {
          throw new Error("Could not load older activity logs.");
        }

        const data = await res.json();
        const newLogs = (data.logs || []) as LogEntry[];
        const existingIds = new Set(logs.map((log) => log.id));
        const uniqueNewLogs = newLogs.filter((log) => !existingIds.has(log.id));
        const firstNewItemPage = Math.max(1, Math.ceil((logs.length + 1) / settings.itemsPerPage));

        setLogs((prev) => [...prev, ...uniqueNewLogs]);
        setHasMore(Boolean(data.hasMore));
        setNextBackendPage((p) => p + 1);
        setLoadMoreError("");
        if (uniqueNewLogs.length > 0 && !searchQuery && viewAsFilter === "all") {
          setPage(firstNewItemPage);
        }
      } catch {
        setLoadMoreError("Could not load older activity logs. Please try again.");
      } finally {
        setLoadingMore(false);
      }
    })();
  }, [loadingMore, hasMore, nextBackendPage, logs, settings.itemsPerPage, searchQuery, viewAsFilter]);

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
                <td className="py-3 text-slate-900 dark:text-white">
                  {log.userName ?? "Deleted user"}
                </td>
                <td className="py-3">
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/20 dark:text-brand-100">
                    {log.actionType}
                  </span>
                </td>
                <td className="py-3 text-slate-500 dark:text-slate-400">
                  {log.targetId ?? "-"}
                </td>
                <td className="py-3 max-w-[200px] truncate text-xs text-slate-400 dark:text-slate-500">
                  {log.details ? JSON.stringify(log.details) : "-"}
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

      {loadMoreError && (
        <p className="mt-3 text-center text-sm text-red-600 dark:text-red-300">
          {loadMoreError}
        </p>
      )}

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
      {!hasMore && logs.length > LOGS_BATCH_SIZE && (
        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          All activity logs are loaded.
        </p>
      )}
    </>
  );
}
