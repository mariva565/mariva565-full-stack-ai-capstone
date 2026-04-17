"use client";

import { PREMIUM_DARK_INPUT } from "../layout/premium-dark-styles";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  sending: boolean;
};

export function ChatInput({ value, onChange, onSend, sending }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex-shrink-0 border-t border-slate-200/80 px-4 py-3 dark:border-slate-700/60">
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send)"
          rows={1}
          className={`flex-1 resize-none rounded-xl border border-slate-200/80 bg-slate-100/80 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-shadow focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-cyan-400/10 dark:focus:ring-brand-500 ${PREMIUM_DARK_INPUT}`}
          style={{ minHeight: "42px", maxHeight: "120px" }}
        />
        <button
          onClick={onSend}
          disabled={!value.trim() || sending}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-v1-gradient transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Send"
        >
          <svg
            className="h-5 w-5 text-white"
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
  );
}
