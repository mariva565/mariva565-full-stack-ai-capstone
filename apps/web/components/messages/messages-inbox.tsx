"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageBackgroundShell } from "../layout/page-background-shell";
import {
  PREMIUM_DARK_CARD_BG,
  PREMIUM_DARK_ICON_SURFACE,
} from "../layout/premium-dark-styles";

type OtherUser = {
  id: number;
  name: string;
  avatarUrl: string | null;
};

type LastMessage = {
  content: string;
  senderId: number;
  createdAt: string;
};

type Conversation = {
  id: number;
  other: OtherUser | null;
  lastMessage: LastMessage | null;
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

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="h-11 w-11 flex-shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm dark:ring-slate-900"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 via-fuchsia-500 to-cyan-400 text-sm font-bold text-white ring-2 ring-white shadow-sm dark:ring-slate-900">
      {initials}
    </div>
  );
}

function EmptyStateIcon() {
  return (
    <svg
      className="h-8 w-8 text-slate-400 dark:text-slate-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.7}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
      />
    </svg>
  );
}

export function MessagesInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((data) => {
        setConversations(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <PageBackgroundShell contentClassName="max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="bg-v1-gradient bg-clip-text font-shantell text-3xl font-black tracking-tight text-transparent">
          Messages
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Your conversations
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`h-20 rounded-2xl border border-slate-200/80 bg-white/80 animate-pulse dark:border-slate-700/60 ${PREMIUM_DARK_CARD_BG}`}
            />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="py-20 text-center">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm dark:border-slate-700/60 ${PREMIUM_DARK_ICON_SURFACE}`}>
            <EmptyStateIcon />
          </div>
          <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">
            No conversations yet
          </p>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            Start a conversation from a community post.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/messages/${conv.id}`}
              className={`group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-slate-700/60 dark:hover:border-brand-700/60 ${PREMIUM_DARK_CARD_BG}`}
            >
              {conv.other ? (
                <Avatar name={conv.other.name} avatarUrl={conv.other.avatarUrl} />
              ) : (
                <div className="h-11 w-11 flex-shrink-0 rounded-full bg-slate-200 dark:bg-slate-800/80" />
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-semibold text-slate-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                    {conv.other?.name ?? "Unknown"}
                  </span>
                  {conv.lastMessage ? (
                    <span className="flex-shrink-0 text-xs text-slate-400 dark:text-slate-500">
                      {timeAgo(conv.lastMessage.createdAt)}
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">
                  {conv.lastMessage?.content ?? "No messages yet"}
                </p>
              </div>

              <svg
                className="h-4 w-4 flex-shrink-0 text-slate-300 transition-colors group-hover:text-brand-400 dark:text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </PageBackgroundShell>
  );
}
