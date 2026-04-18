"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type Post, type Comment } from "./post-types";
import { CommentItem } from "./comment-item";
import { ConfirmModal } from "../ui/confirm-modal";
import { PostHeader } from "./post-header";
import { PostCommentForm } from "./post-comment-form";

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

  const isAuthor    = post.authorId === currentUser.id;
  const isAdmin     = currentUser.role === "admin";
  const isMentor    = currentUser.role === "mentor";
  const canModerate = (isAdmin || isMentor) && post.status !== "approved";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PostHeader
        post={post}
        currentUserId={currentUser.id}
        isAuthor={isAuthor}
        isAdmin={isAdmin}
        canModerate={canModerate}
        fromAdmin={fromAdmin}
        messaging={messaging}
        deleting={deleting}
        onMessage={handleMessage}
        onModerate={handleModerate}
        onRequestDelete={() => setConfirmOpen(true)}
        onLike={handleLike}
        onBookmark={handleBookmark}
      />

      <div className="mt-6">
        <h2 className="mb-4 text-base font-bold text-slate-700 dark:text-slate-300">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </h2>

        <PostCommentForm
          value={newComment}
          submitting={submitting}
          onChange={setNewComment}
          onSubmit={handleAddComment}
        />

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
