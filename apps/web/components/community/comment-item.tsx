"use client";

import Link from "next/link";
import { getProfileInitials } from "@/lib/profile";
import { type Comment, timeAgo } from "./post-types";

function getProfileHref(authorId: number, currentUserId: number) {
  if (authorId === currentUserId) {
    return "/profile";
  }
  return `/profile/${authorId}`;
}

export function CommentItem({ comment, currentUserId, canDelete, onDelete }: {
  comment: Comment;
  currentUserId: number;
  canDelete: boolean;
  onDelete: (id: number) => void;
}) {
  const initials = getProfileInitials(comment.authorName);
  const authorProfileHref = getProfileHref(comment.authorId, currentUserId);
  return (
    <div className="flex gap-3">
      <Link
        href={authorProfileHref}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 via-fuchsia-500 to-cyan-400 text-xs font-black text-white overflow-hidden transition hover:scale-105"
        title={`Open ${comment.authorName} profile`}
      >
        {comment.authorAvatarUrl ? (
          <img src={comment.authorAvatarUrl} alt={comment.authorName} className="h-full w-full object-cover" />
        ) : initials}
      </Link>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <Link
            href={authorProfileHref}
            className="text-sm font-semibold text-slate-700 transition hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
          >
            {comment.authorName}
          </Link>
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
