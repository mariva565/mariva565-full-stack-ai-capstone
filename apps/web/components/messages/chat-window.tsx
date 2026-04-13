"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Pusher from "pusher-js";

type Message = {
  id: number;
  content: string;
  createdAt: string;
  senderId: number;
  senderName: string;
  senderAvatar: string | null;
};

type OtherUser = { id: number; name: string; avatarUrl: string | null };

type Props = {
  conversationId: number;
  currentUserId: number;
};

function Avatar({
  name,
  avatarUrl,
  size = 8,
}: {
  name: string;
  avatarUrl: string | null;
  size?: number;
}) {
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
        className={`w-${size} h-${size} rounded-full object-cover flex-shrink-0`}
      />
    );
  }
  return (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-brand-500 via-fuchsia-500 to-cyan-400 text-white font-bold text-xs`}
    >
      {initials}
    </div>
  );
}

export function ChatWindow({ conversationId, currentUserId }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  // Fit container to remaining viewport height below the navbar
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    const recalc = () => {
      const top = el.getBoundingClientRect().top;
      el.style.height = `calc(100dvh - ${Math.max(top, 0)}px)`;
    };

    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load message history + other user info
  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (res.status === 403) {
        router.replace("/messages");
        return;
      }
      const data = await res.json();
      setMessages(data.messages ?? []);
      if (data.other) setOtherUser(data.other);
    } finally {
      setLoading(false);
    }
  }, [conversationId, router]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Pusher real-time subscription
  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!pusherKey || !pusherCluster) return;

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
      authEndpoint: "/api/pusher/auth",
    });

    const channel = pusher.subscribe(`private-conversation-${conversationId}`);

    channel.bind("new-message", (data: Message) => {
      setMessages((prev) => {
        // Avoid duplicates (in case sender already sees the message)
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`private-conversation-${conversationId}`);
      pusher.disconnect();
    };
  }, [conversationId]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || sending) return;

    setSending(true);
    setInput("");

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const msg = await res.json();
        // Add sender's own message immediately (Pusher won't echo back to sender)
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [
            ...prev,
            {
              id: msg.id,
              content: msg.content,
              createdAt: msg.createdAt,
              senderId: msg.senderId,
              senderName: "You",
              senderAvatar: null,
            },
          ];
        });
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div ref={shellRef} className="bg-slate-50 dark:bg-slate-950 flex flex-col px-4 py-3 overflow-hidden">
      <div className="max-w-2xl w-full mx-auto flex flex-col flex-1 min-h-0 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200/80 dark:border-slate-700/60 flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          aria-label="Back"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {otherUser && (
          <Avatar name={otherUser.name} avatarUrl={otherUser.avatarUrl} size={8} />
        )}
        <span className="font-shantell font-bold text-slate-900 dark:text-white">
          {otherUser ? otherUser.name : "Chat"}
        </span>
      </div>

      {/* Messages — flex column anchored to bottom */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col justify-end min-h-full px-4 py-4 gap-4">
          {loading ? (
            <div className="flex flex-col gap-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse flex-shrink-0" />
                  <div className="h-10 w-48 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm flex items-center justify-center text-2xl mx-auto mb-3">
                👋
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Say hello to {otherUser?.name ?? "them"}!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.senderId === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                >
                  {!isOwn && (
                    <Avatar
                      name={msg.senderName}
                      avatarUrl={msg.senderAvatar}
                      size={8}
                    />
                  )}
                  <div
                    className={`max-w-xs lg:max-w-md ${isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}
                  >
                    {!isOwn && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                        {msg.senderName}
                      </span>
                    )}
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        isOwn
                          ? "bg-v1-gradient text-white rounded-tr-sm"
                          : "bg-white/90 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-700/60 rounded-tl-sm backdrop-blur-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 mx-1">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-200/80 dark:border-slate-700/60 flex-shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send)"
            rows={1}
            className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200/80 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:focus:ring-brand-500 transition-shadow"
            style={{ minHeight: "42px", maxHeight: "120px" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-v1-gradient disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 hover:shadow-md flex items-center justify-center"
            aria-label="Send"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
