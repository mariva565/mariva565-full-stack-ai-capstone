"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getProfileInitials } from "@/lib/profile";
import { PageBackgroundShell } from "../layout/page-background-shell";
import {
  PREMIUM_DARK_BUTTON,
  PREMIUM_DARK_CARD_BG,
  PREMIUM_DARK_INPUT,
} from "../layout/premium-dark-styles";

type Post = {
  id: number;
  title: string;
  content: string;
  postType: string;
  status: string;
  isPinned: boolean;
  questionStatus: string | null;
  courseId: number | null;
  courseTitle: string | null;
  authorId: number;
  authorName: string;
  authorAvatarUrl: string | null;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
};

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  discussion: { label: "Discussion", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  question:   { label: "Question",   color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  resource:   { label: "Resource",   color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  article:    { label: "Article",    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
};

const Q_STATUS: Record<string, string> = {
  open:     "bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300",
  answered: "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-300",
  closed:   "bg-slate-100 border-slate-300 text-slate-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/** Strip HTML tags to show a plain-text excerpt in feed cards */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function shouldShowPendingBadge(post: Post, currentUserId: number) {
  return post.status === "pending" && post.authorId === currentUserId;
}

function getProfileHref(authorId: number, currentUserId: number) {
  if (authorId === currentUserId) {
    return "/profile";
  }
  return `/profile/${authorId}`;
}

function PostCard({ post, currentUserId, onLike }: {
  post: Post;
  currentUserId: number;
  onLike: (id: number) => void;
}) {
  const typeInfo = TYPE_LABELS[post.postType] ?? TYPE_LABELS.discussion;
  const initials = getProfileInitials(post.authorName);
  const showPendingBadge = shouldShowPendingBadge(post, currentUserId);
  const authorProfileHref = getProfileHref(post.authorId, currentUserId);

  return (
    <div className={`group relative rounded-2xl border bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700/60 ${PREMIUM_DARK_CARD_BG} ${post.isPinned ? "border-brand-300 dark:border-brand-700/60" : "border-slate-200/80"}`}>
      {post.isPinned && (
        <span className="absolute right-4 top-4 text-xs font-bold text-brand-500 dark:text-brand-400">Pinned</span>
      )}

      <div className="flex items-start gap-3">
        {/* Avatar */}
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
          {/* Meta row */}
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

          {/* Title */}
          <Link href={`/community/${post.id}`} className="mt-1 block">
            <h3 className="font-shantell text-base font-bold text-slate-800 transition group-hover:text-brand-600 dark:text-slate-100 dark:group-hover:text-brand-400 line-clamp-2">
              {post.title}
            </h3>
          </Link>

          {/* Excerpt */}
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{stripHtml(post.content)}</p>
          {showPendingBadge ? (
            <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300">
              Pending review. Visible only to you until approved.
            </p>
          ) : null}

          {/* Tags row */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeInfo.color}`}>
              {typeInfo.label}
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

          {/* Actions */}
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
              <span>{post.commentCount}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommunityFeed({ currentUser }: { currentUser: { id: number; role: string } }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const searchRef = useRef(search);
  const filterRef = useRef(filterType);

  // Sync refs so loadMore always sees latest values
  searchRef.current = search;
  filterRef.current = filterType;

  // Re-fetch from page 1 whenever filter or search changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPage(1);

    const params = new URLSearchParams({ page: "1" });
    if (filterType) params.set("type", filterType);
    if (search) params.set("search", search);

    fetch(`/api/posts?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setPosts(data.posts ?? []);
        setHasMore(data.hasMore ?? false);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [filterType, search]);

  async function handleLike(postId: number) {
    await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 }
          : p
      )
    );
  }

  async function loadMore() {
    const next = page + 1;
    setPage(next);
    setLoading(true);
    const params = new URLSearchParams({ page: String(next) });
    if (filterRef.current) params.set("type", filterRef.current);
    if (searchRef.current) params.set("search", searchRef.current);
    const res = await fetch(`/api/posts?${params}`);
    const data = await res.json();
    setPosts((prev) => [...prev, ...(data.posts ?? [])]);
    setHasMore(data.hasMore ?? false);
    setLoading(false);
  }

  return (
    <PageBackgroundShell contentClassName="max-w-3xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="hero-gradient-text font-shantell text-3xl font-black tracking-tight">
            Community
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Discuss, ask, share resources
          </p>
        </div>
        <Link
          href="/community/new"
          className="inline-flex items-center gap-2 rounded-xl bg-v1-gradient px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts..."
          className={`flex-1 rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-cyan-400/10 ${PREMIUM_DARK_INPUT}`}
          suppressHydrationWarning
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={`rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm shadow-sm dark:border-cyan-400/10 ${PREMIUM_DARK_INPUT}`}
        >
          <option value="">All types</option>
          <option value="discussion">Discussion</option>
          <option value="question">Question</option>
          <option value="resource">Resource</option>
          <option value="article">Article</option>
        </select>
      </div>

      {/* Post list */}
      {loading && posts.length === 0 ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-36 animate-pulse rounded-2xl bg-slate-100 dark:border dark:border-slate-800/80 ${PREMIUM_DARK_CARD_BG}`} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 py-20 dark:border-slate-700/80 ${PREMIUM_DARK_CARD_BG}`}>
          <svg className="h-10 w-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
          <p className="text-slate-500 dark:text-slate-400">No posts yet - be the first!</p>
          <Link href="/community/new" className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
            Create a post
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={currentUser.id} onLike={handleLike} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className={`rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700/60 ${PREMIUM_DARK_BUTTON}`}
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-v1-gradient text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          title="Back to top"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </button>
      )}
    </PageBackgroundShell>
  );
}
