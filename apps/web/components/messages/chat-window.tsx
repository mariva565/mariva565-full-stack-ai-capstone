"use client";

import Pusher from "pusher-js";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PageBackgroundShell } from "../layout/page-background-shell";
import {
  PREMIUM_DARK_CARD_BG,
  PREMIUM_DARK_ICON_SURFACE,
  PREMIUM_DARK_PANEL_BG,
} from "../layout/premium-dark-styles";
import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ChatMessageBubble, type ChatMessage } from "./chat-message-bubble";

type OtherUser = {
  id: number;
  name: string;
  avatarUrl: string | null;
};

type Props = {
  conversationId: number;
  currentUserId: number;
};

function EmptyThreadIcon() {
  return (
    <svg
      className="h-7 w-7 text-slate-400 dark:text-slate-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
      />
    </svg>
  );
}

export function ChatWindow({ conversationId, currentUserId }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!pusherKey || !pusherCluster) return;

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
      authEndpoint: "/api/pusher/auth",
    });

    const channel = pusher.subscribe(`private-conversation-${conversationId}`);
    channel.bind("new-message", (data: ChatMessage) => {
      setMessages((prev) => {
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

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <PageBackgroundShell contentClassName="max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
      <div ref={shellRef} className="flex flex-col overflow-hidden">
        <div className={`mx-auto flex w-full max-w-2xl min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl dark:border-slate-700/60 ${PREMIUM_DARK_PANEL_BG}`}>
          <ChatHeader otherUser={otherUser} />

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="flex min-h-full flex-col justify-end gap-4 px-4 py-4">
              {loading ? (
                <div className="flex flex-col gap-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
                      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-slate-200 animate-pulse dark:bg-slate-800/80" />
                      <div className={`h-10 w-48 rounded-2xl bg-slate-200 animate-pulse ${PREMIUM_DARK_CARD_BG}`} />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="py-16 text-center">
                  <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm dark:border-slate-700/60 ${PREMIUM_DARK_ICON_SURFACE}`}>
                    <EmptyThreadIcon />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Say hello to {otherUser?.name ?? "them"}!
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <ChatMessageBubble
                    key={msg.id}
                    message={msg}
                    isOwn={msg.senderId === currentUserId}
                    formatTime={formatTime}
                  />
                ))
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          <ChatInput
            value={input}
            onChange={setInput}
            onSend={sendMessage}
            sending={sending}
          />
        </div>
      </div>
    </PageBackgroundShell>
  );
}
