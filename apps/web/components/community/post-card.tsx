"use client";

import Link from "next/link";
import { getProfileInitials } from "@/lib/profile";
import { PREMIUM_DARK_CARD_BG } from "../layout/premium-dark-styles";
import { type Post, TYPE_LABELS, TYPE_COLORS, timeAgo } from "./post-types";

const Q_STATUS: Record<string, string> = {
  open:     "bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300",
  answered: "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-300",
  closed:   "bg-slate-100 border-slate-300 text-slate-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400",
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

type Props = {
  post: Post;
  currentUserId: number;
  onLike: (id: number) => void;
};

export function PostCard({ post, currentUserId, onLike }: Props) {
  const initials = getProfileInitials(post.authorName);
  const showPendingBadge = post.status === "pending" && post.authorId === currentUserId;
  const authorProfileHref = post.authorId === currentUserId ? "/profile" : `/profile/${post.authorId}`;

  return (
    <div className={`group relative rounded-2xl border bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700/60 ${PREMIUM_DARK_CARD_BG} ${post.isPinned ? "border-brand-300 dark:border-brand-700/60" : "border-slate-200/80"}`}>
      {post.isPinned && (
        <span className="absolute right-4 top-4 text-xs font-bold text-brand-500 dark:text-brand-400">Pinned</span>
      )}

      <div className="flex items-start gap-3">
        <Link
          href={authorProfileHref}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 via-fuchsia-500 to-cyan-400 text-xs font-black text-white shadow-sm overflow-hidden transition hover:scale-105"
          title={`Open ${post.authorName} profile`}
        >
          {post.authorAvatarUrl ? (
            <img src={post.authorAvatarUrl} alt={post.authorName} className="h-full w-full object-cover" />
          ) : initials}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Link
              href={authorProfileHref}
              className="font-semibold text-slate-700 transition hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
            >
              {post.authorName}
            </Link>
            <span>|</span>
            <span>{timeAgo(post.createdAt)}</span>
            {post.courseTitle && (
              <>
                <span>|</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
                  {post.courseTitle}
                </span>
              </>
            )}
          </div>

          <Link href={`/community/${post.id}`} className="mt-1 block">
            <h3 className="font-shantell text-base font-bold text-slate-800 transition group-hover:text-brand-600 dark:text-slate-100 dark:group-hover:text-brand-400 line-clamp-2">
              {post.title}
            </h3>
          </Link>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{stripHtml(post.content)}</p>
          {showPendingBadge ? (
            <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300">
              Pending review. Visible only to you until approved.
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TYPE_COLORS[post.postType] ?? ""}`}>
              {TYPE_LABELS[post.postType] ?? post.postType}
            </span>
            {showPendingBadge ? (
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                Pending review
              </span>
            ) : null}
            {post.questionStatus && (
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${Q_STATUS[post.questionStatus] ?? ""}`}>
                {post.questionStatus}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center gap-1.5 rounded-full px-2 py-1 transition hover:bg-slate-100 dark:hover:bg-white/5 ${post.isLiked ? "text-rose-500 dark:text-rose-400" : ""}`}
            >
              <svg className="h-4 w-4" fill={post.isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              <span>{post.likeCount}</span>
            </button>

            <Link href={`/community/${post.id}`} className="flex items-center gap-1.5 rounded-full px-2 py-1 transition hover:bg-slate-100 dark:hover:bg-white/5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              <span>{post.commentCount ?? 0}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
