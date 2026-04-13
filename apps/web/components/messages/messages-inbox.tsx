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

function Avatar({ name, avatarUrl, size = 10 }: { name: string; avatarUrl: string | null; size?: number }) {
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`w-${size} h-${size} rounded-full object-cover flex-shrink-0`}
      />
    );
  }
  return (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-brand-500 to-cyan-500 text-white font-semibold text-sm`}
    >
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-shantell">
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
                className="h-20 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">💬</div>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
              No conversations yet
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
              Start a conversation from a user&apos;s profile or a community post.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-500 transition-colors"
              >
                {conv.other ? (
                  <Avatar name={conv.other.name} avatarUrl={conv.other.avatarUrl} size={11} />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white truncate">
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
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
