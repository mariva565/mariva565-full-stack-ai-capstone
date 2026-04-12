"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProfileInitials } from "@/lib/profile";

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
  updatedAt: string;
  likeCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
};

type Comment = {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  authorAvatarUrl: string | null;
  createdAt: string;
};

const TYPE_LABELS: Record<string, string> = {
  discussion: "Discussion",
  question:   "Question",
  resource:   "Resource",
  article:    "Article",
};

const TYPE_COLORS: Record<string, string> = {
  discussion: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  question:   "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  resource:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  article:    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
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

function CommentItem({ comment, canDelete, onDelete }: {
  comment: Comment;
  canDelete: boolean;
  onDelete: (id: number) => void;
}) {
  const initials = getProfileInitials(comment.authorName);
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 via-fuchsia-500 to-cyan-400 text-xs font-black text-white overflow-hidden">
        {comment.authorAvatarUrl ? (
          <img src={comment.authorAvatarUrl} alt={comment.authorName} className="h-full w-full object-cover" />
        ) : initials}
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{comment.authorName}</span>
          <span className="text-xs text-slate-400">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{comment.content}</p>
      </div>
      {canDelete && (
        <button
          onClick={() => onDelete(comment.id)}
          className="shrink-0 rounded-lg p-1.5 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20"
          title="Delete comment"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      )}
    </div>
  );
}

export function PostDetails({ postId, currentUser }: {
  postId: number;
  currentUser: { id: number; role: string };
}) {
  const router = useRouter();
  const [post, setPost]         = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading]   = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting]     = useState(false);

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
    if (!confirm("Delete this post?")) return;
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

  async function handleDeleteComment(commentId: number) {
    await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    setComments((prev) => prev.filter((c) => c.id !== commentId));
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
        <Link href="/community" className="font-semibold text-primary-600 hover:underline">Back to Community</Link>
      </div>
    );
  }

  const isAuthor = post.authorId === currentUser.id;
  const isAdmin  = currentUser.role === "admin";
  const initials = getProfileInitials(post.authorName);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Back */}
      <Link href="/community" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Community
      </Link>

      {/* Post card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/60">
        {/* Author + meta */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 via-fuchsia-500 to-cyan-400 text-xs font-black text-white overflow-hidden">
              {post.authorAvatarUrl ? (
                <img src={post.authorAvatarUrl} alt={post.authorName} className="h-full w-full object-cover" />
              ) : initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{post.authorName}</p>
              <p className="text-xs text-slate-400">{timeAgo(post.createdAt)}{post.courseTitle && ` · ${post.courseTitle}`}</p>
            </div>
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
                onClick={handleDeletePost}
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
          {post.isPinned && <span className="text-xs font-bold text-primary-500">📌 Pinned</span>}
          {post.questionStatus && (
            <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
              {post.questionStatus}
            </span>
          )}
        </div>

        {/* Title + Content */}
        <h1 className="mt-3 text-xl font-black text-slate-900 dark:text-white">{post.title}</h1>
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
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition hover:bg-slate-100 dark:hover:bg-slate-800 ${post.isBookmarked ? "text-primary-500 dark:text-primary-400" : "text-slate-500"}`}
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
            className="flex-1 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white resize-none"
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
              canDelete={c.authorId === currentUser.id || isAdmin}
              onDelete={handleDeleteComment}
            />
          ))}
          {comments.length === 0 && (
            <p className="text-center text-sm text-slate-400">No comments yet. Be the first!</p>
          )}
        </div>
      </div>
    </div>
  );
}
