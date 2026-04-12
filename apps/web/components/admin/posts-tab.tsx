"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type AdminPost = {
  id: number;
  title: string;
  postType: string;
  status: string;
  isPinned: boolean;
  questionStatus: string | null;
  courseTitle: string | null;
  authorName: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
};

const STATUS_COLORS: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  pending:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  hidden:   "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

const TYPE_COLORS: Record<string, string> = {
  discussion: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
  question:   "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
  resource:   "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300",
  article:    "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function PostsTab() {
  const [posts, setPosts]         = useState<AdminPost[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [actionId, setActionId]   = useState<number | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    const res = await fetch(`/api/admin/posts?${params}`);
    const data = await res.json();
    setPosts(data.posts ?? []);
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  async function setStatus(postId: number, status: string) {
    setActionId(postId);
    await fetch(`/api/admin/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, status } : p));
    setActionId(null);
  }

  async function togglePin(postId: number, current: boolean) {
    setActionId(postId);
    await fetch(`/api/admin/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPinned: !current }),
    });
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, isPinned: !current } : p));
    setActionId(null);
  }

  async function deletePost(postId: number) {
    if (!confirm("Permanently delete this post?")) return;
    setActionId(postId);
    await fetch(`/api/admin/posts/${postId}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setActionId(null);
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Filter by status:</span>
        {["", "approved", "pending", "hidden"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilterStatus(s)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              filterStatus === s
                ? "bg-brand-500 text-white"
                : "border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
            }`}
          >
            {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">{posts.length} posts</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-400 dark:border-slate-700">
          No posts found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Author</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Stats</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Created</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {posts.map((post) => (
                <tr key={post.id} className={`transition hover:bg-slate-50 dark:hover:bg-slate-800/40 ${actionId === post.id ? "opacity-50" : ""}`}>
                  <td className="max-w-[220px] px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {post.isPinned && <span title="Pinned" className="text-brand-500">📌</span>}
                      <Link href={`/community/${post.id}`} className="truncate font-medium text-slate-800 hover:text-brand-600 dark:text-slate-200 dark:hover:text-brand-400" target="_blank">
                        {post.title}
                      </Link>
                    </div>
                    {post.courseTitle && <p className="mt-0.5 truncate text-xs text-slate-400">{post.courseTitle}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_COLORS[post.postType] ?? ""}`}>
                      {post.postType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[post.status] ?? ""}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{post.authorName}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    <span title="Likes">♥ {post.likeCount}</span>
                    {" · "}
                    <span title="Comments">💬 {post.commentCount}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{timeAgo(post.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {post.status !== "approved" && (
                        <button
                          onClick={() => setStatus(post.id, "approved")}
                          className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400"
                        >
                          Approve
                        </button>
                      )}
                      {post.status !== "hidden" && (
                        <button
                          onClick={() => setStatus(post.id, "hidden")}
                          className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                        >
                          Hide
                        </button>
                      )}
                      <button
                        onClick={() => togglePin(post.id, post.isPinned)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${post.isPinned ? "bg-brand-100 text-brand-600 dark:bg-brand-900/20" : "bg-slate-100 text-slate-500 dark:bg-slate-800"} hover:opacity-80`}
                        title={post.isPinned ? "Unpin" : "Pin"}
                      >
                        {post.isPinned ? "Unpin" : "Pin"}
                      </button>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-500 transition hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
