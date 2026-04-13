"use client";

import Link from "next/link";
import { ConfirmModal } from "../ui/confirm-modal";
import {
  STATUS_FILTERS,
  STATUS_STYLES,
  TYPE_STYLES,
} from "./moderation-queue.constants";
import { useModerationQueue } from "./use-moderation-queue";
import { timeAgo } from "./moderation-queue.utils";
import type { ModerationRole } from "./moderation-queue.types";

type ModerationQueueProps = {
  role: ModerationRole;
  embedded?: boolean;
};

function QueueHeader({ role, pendingRatioLabel }: { role: ModerationRole; pendingRatioLabel: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-shantell text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Moderation Queue
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {role === "admin"
            ? "Review community posts across all courses."
            : "Review posts from courses you mentor."}
        </p>
      </div>
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
        {pendingRatioLabel}
      </span>
    </div>
  );
}

function StatusCards({
  pending,
  approved,
  hidden,
}: {
  pending: number;
  approved: number;
  hidden: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-900/20">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">Pending</p>
        <p className="mt-1 text-2xl font-black text-amber-800 dark:text-amber-200">{pending}</p>
      </div>
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/40 dark:bg-emerald-900/20">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Approved</p>
        <p className="mt-1 text-2xl font-black text-emerald-800 dark:text-emerald-200">{approved}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Hidden</p>
        <p className="mt-1 text-2xl font-black text-slate-800 dark:text-slate-200">{hidden}</p>
      </div>
    </div>
  );
}

export function ModerationQueue({ role, embedded = false }: ModerationQueueProps) {
  const state = useModerationQueue(role);
  const containerClassName = embedded
    ? "space-y-4"
    : "mx-auto max-w-6xl space-y-5 px-4 py-8 sm:px-6";

  return (
    <div className={containerClassName}>
      {!embedded ? (
        <QueueHeader role={role} pendingRatioLabel={state.pendingRatioLabel} />
      ) : null}

      <StatusCards
        pending={state.statusCounts.pending}
        approved={state.statusCounts.approved}
        hidden={state.statusCounts.hidden}
      />

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-900/60">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => state.setStatusFilter(filter.value)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              state.statusFilter === filter.value
                ? "bg-brand-500 text-white"
                : "border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {filter.label}
          </button>
        ))}
        <input
          type="search"
          value={state.searchInput}
          onChange={(event) => state.setSearchInput(event.target.value)}
          placeholder="Search title, content, author, course..."
          className="ml-auto w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 sm:w-80 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200"
        />
      </div>

      {state.error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-300">
          {state.error}
        </div>
      ) : null}

      {state.loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : state.posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No posts match the current moderation filters.
        </div>
      ) : (
        <div className="space-y-3">
          {state.posts.map((post) => (
            <div
              key={post.id}
              className={`rounded-2xl border bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:bg-slate-900/60 ${
                post.status === "pending"
                  ? "border-amber-200 dark:border-amber-900/50"
                  : "border-slate-200 dark:border-slate-700"
              } ${state.actionId === post.id ? "opacity-60" : ""}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {post.isPinned ? (
                      <span className="text-xs font-bold text-brand-500">📌</span>
                    ) : null}
                    <Link
                      href={`/community/${post.id}`}
                      target="_blank"
                      className="line-clamp-1 text-sm font-semibold text-slate-800 hover:text-brand-600 dark:text-slate-100 dark:hover:text-brand-400"
                    >
                      {post.title}
                    </Link>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className={`rounded-full px-2 py-0.5 font-semibold ${TYPE_STYLES[post.postType] ?? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                      {post.postType}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 font-semibold ${STATUS_STYLES[post.status] ?? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                      {post.status}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">{post.authorName}</span>
                    {post.courseTitle ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {post.courseTitle}
                      </span>
                    ) : null}
                    <span className="text-slate-400">{timeAgo(post.createdAt)}</span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    ♥ {post.likeCount} · 💬 {post.commentCount}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  {post.status !== "approved" ? (
                    <button
                      type="button"
                      onClick={() => state.setPostStatus(post.id, "approved")}
                      className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300"
                    >
                      Approve
                    </button>
                  ) : null}
                  {post.status !== "hidden" ? (
                    <button
                      type="button"
                      onClick={() => state.setPostStatus(post.id, "hidden")}
                      className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    >
                      Hide
                    </button>
                  ) : null}
                  {state.canPin ? (
                    <button
                      type="button"
                      onClick={() => state.togglePin(post.id, post.isPinned)}
                      className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 dark:bg-brand-900/20 dark:text-brand-300"
                    >
                      {post.isPinned ? "Unpin" : "Pin"}
                    </button>
                  ) : null}
                  {state.canDelete ? (
                    <button
                      type="button"
                      onClick={() => state.setConfirmDeleteId(post.id)}
                      className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-300"
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {state.hasMore && !state.loading ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => void state.loadMore()}
            disabled={state.loadingMore}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {state.loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      ) : null}

      <ConfirmModal
        isOpen={state.confirmDeleteId !== null}
        title="Delete post?"
        description="This permanently removes the post and all comments."
        confirmLabel="Delete"
        busy={state.actionId === state.confirmDeleteId}
        onConfirm={() => {
          const targetId = state.confirmDeleteId;
          state.setConfirmDeleteId(null);
          if (targetId) {
            void state.deletePost(targetId);
          }
        }}
        onCancel={() => state.setConfirmDeleteId(null)}
      />
    </div>
  );
}

