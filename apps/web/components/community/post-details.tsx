"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getProfileInitials } from "@/lib/profile";
import { type Post, type Comment, TYPE_LABELS, TYPE_COLORS, timeAgo } from "./post-types";
import { CommentItem } from "./comment-item";
import { ConfirmModal } from "../ui/confirm-modal";

function getProfileHref(targetUserId: number, currentUserId: number) {
  if (targetUserId === currentUserId) {
    return "/profile";
  }
  return `/profile/${targetUserId}`;
}

export function PostDetails({ postId, currentUser }: {
  postId: number;
  currentUser: { id: number; role: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromAdmin = searchParams.get("from") === "admin";
  const [post, setPost]         = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading]   = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [messaging, setMessaging]   = useState(false);

  useEffect(() => {
    fetch(`/api/posts/${postId}`)
      .then((r) => r.json())
      .then((d) => {
        setPost(d.post);
        setComments(d.comments ?? []);
        setLoading(false);
      });
  }, [postId]);

  async function handleLike() {
    if (!post) return;
    await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    setPost((p) => p ? { ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 } : p);
  }

  async function handleBookmark() {
    if (!post) return;
    await fetch(`/api/posts/${postId}/bookmark`, { method: "POST" });
    setPost((p) => p ? { ...p, isBookmarked: !p.isBookmarked } : p);
  }

  async function handleDeletePost() {
    setDeleting(true);
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    router.push("/community");
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment }),
    });
    const data = await res.json();
    setComments((prev) => [data.comment, ...prev]);
    setNewComment("");
    setSubmitting(false);
  }

  async function handleMessage() {
    if (!post || messaging) return;
    setMessaging(true);
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: post.authorId }),
    });
    const data = await res.json();
    router.push(`/messages/${data.id}`);
  }

  async function handleDeleteComment(commentId: number) {
    await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  async function handleModerate(status: "approved" | "hidden") {
    if (!post) return;
    await fetch(`/api/admin/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.push("/admin");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-slate-500">
        Post not found.{" "}
        <Link href="/community" className="font-semibold text-brand-600 hover:underline">Back to Community</Link>
      </div>
    );
  }

  const isAuthor   = post.authorId === currentUser.id;
  const isAdmin    = currentUser.role === "admin";
  const isMentor   = currentUser.role === "mentor";
  const canModerate = (isAdmin || isMentor) && post.status !== "approved";
  const initials = getProfileInitials(post.authorName);
  const showPendingBadge = post.status === "pending";
  const authorProfileHref = getProfileHref(post.authorId, currentUser.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Back */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={fromAdmin ? "/admin" : "/community"}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {fromAdmin ? "Back to Admin" : "Back"}
        </Link>

        {canModerate && (
          <div className="flex items-center gap-2">
            {post.status !== "approved" && (
              <button
                type="button"
                onClick={() => void handleModerate("approved")}
                className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300"
              >
                ✓ Approve
              </button>
            )}
            {post.status !== "hidden" && (
              <button
                type="button"
                onClick={() => void handleModerate("hidden")}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              >
                Hide
              </button>
            )}
          </div>
        )}
      </div>

      {/* Post card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/60">
        {/* Author + meta */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={authorProfileHref}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 via-fuchsia-500 to-cyan-400 text-xs font-black text-white overflow-hidden transition hover:scale-105"
              title={`Open ${post.authorName} profile`}
            >
              {post.authorAvatarUrl ? (
                <img src={post.authorAvatarUrl} alt={post.authorName} className="h-full w-full object-cover" />
              ) : initials}
            </Link>
            <div>
              <Link
                href={authorProfileHref}
                className="text-sm font-semibold text-slate-800 transition hover:text-brand-600 dark:text-slate-200 dark:hover:text-brand-400"
              >
                {post.authorName}
              </Link>
              <p className="text-xs text-slate-400">{timeAgo(post.createdAt)}{post.courseTitle && ` · ${post.courseTitle}`}</p>
            </div>
            {!isAuthor && (
              <button
                onClick={handleMessage}
                disabled={messaging}
                className="ml-2 rounded-xl border border-brand-300 px-3 py-1 text-xs font-semibold text-brand-600 transition hover:bg-brand-50 disabled:opacity-50 dark:border-brand-700 dark:text-brand-400 dark:hover:bg-brand-900/20"
              >
                {messaging ? "Opening..." : "Send message"}
              </button>
            )}
          </div>

          {/* Actions for author/admin */}
          {(isAuthor || isAdmin) && (
            <div className="flex items-center gap-2">
              {isAuthor && (
                <Link href={`/community/${post.id}/edit`} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400">
                  Edit
                </Link>
              )}
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={deleting}
                className="rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-500 transition hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-900/20"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Type badge */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TYPE_COLORS[post.postType] ?? ""}`}>
            {TYPE_LABELS[post.postType] ?? post.postType}
          </span>
          {showPendingBadge ? (
            <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
              Pending review
            </span>
          ) : null}
          {post.isPinned && <span className="text-xs font-bold text-brand-500">Pinned</span>}
          {post.questionStatus && (
            <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
              {post.questionStatus}
            </span>
          )}
        </div>

        {/* Title + Content */}
        <h1 className="mt-3 font-shantell text-xl font-black text-slate-900 dark:text-white">{post.title}</h1>
        {showPendingBadge ? (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs font-medium text-amber-700 dark:border-amber-800/70 dark:bg-amber-900/20 dark:text-amber-300">
            {isAuthor
              ? "Your post is pending moderation and remains visible to you until approved."
              : "This post is pending moderation review."}
          </div>
        ) : null}
        <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {post.content}
        </div>

        {/* Like + Bookmark */}
        <div className="mt-6 flex items-center gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition hover:bg-slate-100 dark:hover:bg-slate-800 ${post.isLiked ? "text-rose-500 dark:text-rose-400" : "text-slate-500"}`}
          >
            <svg className="h-4 w-4" fill={post.isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            {post.likeCount} {post.likeCount === 1 ? "like" : "likes"}
          </button>

          <button
            onClick={handleBookmark}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition hover:bg-slate-100 dark:hover:bg-slate-800 ${post.isBookmarked ? "text-brand-500 dark:text-brand-400" : "text-slate-500"}`}
          >
            <svg className="h-4 w-4" fill={post.isBookmarked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
            {post.isBookmarked ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      {/* Comments */}
      <div className="mt-6">
        <h2 className="mb-4 text-base font-bold text-slate-700 dark:text-slate-300">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </h2>

        {/* Add comment form */}
        <form onSubmit={handleAddComment} className="mb-6 flex gap-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={2}
            placeholder="Write a comment..."
            className="flex-1 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white resize-none"
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="self-end rounded-xl bg-v1-gradient px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            {submitting ? "..." : "Post"}
          </button>
        </form>

        <div className="space-y-5">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              currentUserId={currentUser.id}
              canDelete={c.authorId === currentUser.id || isAdmin}
              onDelete={handleDeleteComment}
            />
          ))}
          {comments.length === 0 && (
            <p className="text-center text-sm text-slate-400">No comments yet. Be the first!</p>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Delete post?"
        description="This will permanently delete the post and all its comments. This cannot be undone."
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={() => { setConfirmOpen(false); handleDeletePost(); }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

