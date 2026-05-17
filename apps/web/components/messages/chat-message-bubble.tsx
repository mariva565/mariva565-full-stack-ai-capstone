"use client";

import {
  PREMIUM_DARK_CARD_BG,
} from "../layout/premium-dark-styles";

export type ChatMessage = {
  id: number;
  content: string;
  createdAt: string;
  senderId: number;
  senderName: string;
  senderAvatar: string | null;
};

export function Avatar({
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

type Props = {
  message: ChatMessage;
  isOwn: boolean;
  formatTime: (dateStr: string) => string;
  receiptState: "sent" | "seen" | null;
  seenLabel: string | null;
};

function ReceiptIcon({ state }: { state: "sent" | "seen" }) {
  return state === "seen" ? (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M2.25 8.4 5.4 11.55 10.9 5.7" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M6.2 8.4 9.35 11.55 14.1 6.4" />
    </svg>
  ) : (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M2.5 8.4 5.8 11.55 13.3 4.7" />
    </svg>
  );
}

export function ChatMessageBubble({
  message,
  isOwn,
  formatTime,
  receiptState,
  seenLabel,
}: Props) {
  return (
    <div className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
      {!isOwn ? (
        <Avatar
          name={message.senderName}
          avatarUrl={message.senderAvatar}
          size={8}
        />
      ) : null}
      <div
        className={`flex max-w-xs flex-col gap-1 lg:max-w-md ${isOwn ? "items-end" : "items-start"}`}
      >
        {!isOwn ? (
          <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">
            {message.senderName}
          </span>
        ) : null}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
            isOwn
              ? "rounded-tr-sm bg-v1-gradient text-white"
              : `rounded-tl-sm border border-slate-200/80 bg-white/90 text-slate-900 backdrop-blur-sm dark:border-slate-700/60 dark:text-white ${PREMIUM_DARK_CARD_BG}`
          }`}
        >
          {message.content}
        </div>
        <span className="mx-1 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
          {formatTime(message.createdAt)}
          {receiptState ? <ReceiptIcon state={receiptState} /> : null}
        </span>
        {seenLabel ? (
          <span className="mx-1 text-xs text-slate-400 dark:text-slate-500">
            {seenLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}
