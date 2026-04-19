import { useCallback, useEffect, useMemo, useState } from "react";
import {
  dispatchAdminDataChanged,
  useAdminRefresh,
} from "../admin/admin-refresh";
import { buildQuery, toErrorMessage, toStatusCounts } from "./moderation-queue.utils";
import type { ModerationPost, ModerationRole, QueueResponse, StatusCounts } from "./moderation-queue.types";

function shouldKeepPostForFilter(post: ModerationPost, statusFilter: string) {
  return statusFilter ? post.status === statusFilter : true;
}

type QueueState = {
  posts: ModerationPost[];
  statusCounts: StatusCounts;
  statusFilter: string;
  searchInput: string;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  actionId: number | null;
  confirmDeleteId: number | null;
  canPin: boolean;
  canDelete: boolean;
  pendingRatioLabel: string;
  setStatusFilter: (value: string) => void;
  setSearchInput: (value: string) => void;
  setConfirmDeleteId: (id: number | null) => void;
  loadMore: () => Promise<void>;
  setPostStatus: (postId: number, nextStatus: "approved" | "hidden") => Promise<void>;
  togglePin: (postId: number, currentPinned: boolean) => Promise<void>;
  deletePost: (postId: number) => Promise<void>;
};

export function useModerationQueue(role: ModerationRole): QueueState {
  const [posts, setPosts] = useState<ModerationPost[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    pending: 0,
    approved: 0,
    hidden: 0,
  });
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const canPin = role === "admin";
  const canDelete = role === "admin";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const fetchPage = useCallback(
    async (targetPage: number, append: boolean) => {
      const query = buildQuery(targetPage, statusFilter, search);
      const response = await fetch(`/api/admin/posts?${query}`);
      if (!response.ok) {
        throw new Error("Could not load moderation queue.");
      }

      const data = (await response.json()) as QueueResponse;
      const nextPosts = data.posts ?? [];
      setStatusCounts(toStatusCounts(data.statusCounts));
      setHasMore(Boolean(data.hasMore));
      setPage(targetPage);
      setPosts((prev) => (append ? [...prev, ...nextPosts] : nextPosts));
      setError(null);
    },
    [search, statusFilter]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void fetchPage(1, false)
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(toErrorMessage(err, "Could not load moderation queue."));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetchPage]);

  useAdminRefresh({
    onManualRefresh: () => {
      void fetchPage(1, false).catch(() => undefined);
    },
  });

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      await fetchPage(page + 1, true);
    } catch (err) {
      setError(toErrorMessage(err, "Could not load more posts."));
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, hasMore, loadingMore, page]);

  const setPostStatus = useCallback(
    async (postId: number, nextStatus: "approved" | "hidden") => {
      setActionId(postId);
      setError(null);
      let didChange = false;
      try {
        const response = await fetch(`/api/admin/posts/${postId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { message?: string }
            | null;
          throw new Error(payload?.message ?? "Moderation update failed.");
        }
        setPosts((prev) =>
          prev
            .map((post) =>
              post.id === postId ? { ...post, status: nextStatus } : post
            )
            .filter((post) => shouldKeepPostForFilter(post, statusFilter))
        );
        didChange = true;
      } catch (err) {
        setError(toErrorMessage(err, "Moderation update failed."));
      } finally {
        setActionId(null);
        if (didChange) {
          dispatchAdminDataChanged();
        }
        void fetchPage(1, false).catch(() => undefined);
      }
    },
    [fetchPage, statusFilter]
  );

  const togglePin = useCallback(
    async (postId: number, currentPinned: boolean) => {
      if (!canPin) return;
      setActionId(postId);
      setError(null);
      let didChange = false;
      try {
        const response = await fetch(`/api/admin/posts/${postId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPinned: !currentPinned }),
        });
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { message?: string }
            | null;
          throw new Error(payload?.message ?? "Pin update failed.");
        }
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId ? { ...post, isPinned: !currentPinned } : post
          )
        );
        didChange = true;
      } catch (err) {
        setError(toErrorMessage(err, "Pin update failed."));
      } finally {
        setActionId(null);
        if (didChange) {
          dispatchAdminDataChanged();
        }
      }
    },
    [canPin]
  );

  const deletePost = useCallback(
    async (postId: number) => {
      if (!canDelete) return;
      setActionId(postId);
      setError(null);
      let didChange = false;
      try {
        const response = await fetch(`/api/admin/posts/${postId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { message?: string }
            | null;
          throw new Error(payload?.message ?? "Delete failed.");
        }
        setPosts((prev) => prev.filter((post) => post.id !== postId));
        didChange = true;
      } catch (err) {
        setError(toErrorMessage(err, "Delete failed."));
      } finally {
        setActionId(null);
        if (didChange) {
          dispatchAdminDataChanged();
        }
        void fetchPage(1, false).catch(() => undefined);
      }
    },
    [canDelete, fetchPage]
  );

  const pendingRatioLabel = useMemo(() => {
    const total =
      statusCounts.pending + statusCounts.approved + statusCounts.hidden;
    if (total === 0) return "0% pending";
    const percent = Math.round((statusCounts.pending / total) * 100);
    return `${percent}% pending`;
  }, [statusCounts]);

  return {
    posts,
    statusCounts,
    statusFilter,
    searchInput,
    hasMore,
    loading,
    loadingMore,
    error,
    actionId,
    confirmDeleteId,
    canPin,
    canDelete,
    pendingRatioLabel,
    setStatusFilter,
    setSearchInput,
    setConfirmDeleteId,
    loadMore,
    setPostStatus,
    togglePin,
    deletePost,
  };
}
