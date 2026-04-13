"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="w-11 h-11 rounded-full object-cover flex-shrink-0 ring-2 ring-white dark:ring-slate-800 shadow-sm"
      />
    );
  }
  return (
    <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-brand-500 via-fuchsia-500 to-cyan-400 text-white font-bold text-sm ring-2 ring-white dark:ring-slate-800 shadow-sm">
      {initials}
    </div>
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-shantell text-3xl font-black tracking-tight bg-v1-gradient bg-clip-text text-transparent">
            Messages
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your conversations
          </p>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60 animate-pulse"
              />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60 shadow-sm flex items-center justify-center text-3xl mx-auto mb-4">
              💬
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-lg font-semibold">
              No conversations yet
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
              Start a conversation from a community post.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60 backdrop-blur-sm shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700/60"
              >
                {conv.other ? (
                  <Avatar name={conv.other.name} avatarUrl={conv.other.avatarUrl} />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {conv.other?.name ?? "Unknown"}
                    </span>
                    {conv.lastMessage && (
                      <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">
                        {timeAgo(conv.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {conv.lastMessage?.content ?? "No messages yet"}
                  </p>
                </div>

                {/* Arrow hint */}
                <svg className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0 group-hover:text-brand-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
