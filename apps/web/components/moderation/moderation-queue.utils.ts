import type { QueueResponse, StatusCounts } from "./moderation-queue.types";

export function toStatusCounts(value: QueueResponse["statusCounts"]): StatusCounts {
  return {
    pending: Number(value?.pending ?? 0),
    approved: Number(value?.approved ?? 0),
    hidden: Number(value?.hidden ?? 0),
  };
}

export function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function buildQuery(page: number, status: string, search: string) {
  const params = new URLSearchParams({ page: String(page) });
  if (status) {
    params.set("status", status);
  }
  if (search.trim()) {
    params.set("search", search.trim());
  }
  return params.toString();
}

export function toErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

