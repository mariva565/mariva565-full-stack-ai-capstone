"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "./chat-message-bubble";

export type ChatOtherUser = {
  id: number;
  name: string;
  avatarUrl: string | null;
};

type Props = {
  otherUser: ChatOtherUser | null;
};

export function ChatHeader({ otherUser }: Props) {
  const router = useRouter();

  return (
    <div className="flex flex-shrink-0 items-center gap-3 border-b border-slate-200/80 px-4 py-3 dark:border-slate-700/60">
      <button
        onClick={() => router.back()}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        aria-label="Back"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {otherUser ? (
        <Avatar name={otherUser.name} avatarUrl={otherUser.avatarUrl} size={8} />
      ) : null}
      <span className="font-shantell font-bold text-slate-900 dark:text-white">
        {otherUser ? otherUser.name : "Chat"}
      </span>
    </div>
  );
}
