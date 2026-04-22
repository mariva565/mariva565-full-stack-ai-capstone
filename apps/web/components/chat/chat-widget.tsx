"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  SendIcon,
  CloseIcon,
  ThinkingDots,
  CopyButton,
  formatMessage,
} from "./chat-widget-helpers";

type ChatMessage = {
  role: "user" | "model";
  text: string;
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  function handleToggle() {
    setIsOpen((o) => !o);
    setIsReacting(true);
    setTimeout(() => setIsReacting(false), 500);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = { role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        parts: m.text,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || `Error ${res.status}`);
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "model", text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text:
            err instanceof Error && err.message.includes("Authentication")
              ? "Please sign in to use the AI assistant."
              : "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  let fabState = "chat-fab--idle";
  if (isReacting) fabState = "chat-fab--reacting";
  else if (isLoading) fabState = "chat-fab--thinking";
  else if (isOpen) fabState = "chat-fab--open";

  return (
    <>
      {/* FAB button */}
      <button
        type="button"
        onClick={handleToggle}
        title="Ask AI Assistant"
        className={`chat-fab group fixed bottom-6 right-6 z-[1000] ${fabState}`}
      >
        <span className="chat-fab__aura" />
        <Image
          src="/assets/v1/AI-icon-1.png"
          alt="AI Assistant"
          width={80}
          height={80}
          className="chat-fab__avatar"
          priority
        />
      </button>

      {/* Chat window */}
      <div
        className={`fixed bottom-24 right-6 z-[999] flex flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.2)] backdrop-blur-xl transition-all duration-300 dark:border-slate-700 dark:bg-slate-900/95 sm:bottom-28 ${
          isOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        } h-[min(520px,72vh)] w-[min(400px,calc(100vw-3rem))]`}
      >
        {/* Header */}
        <div className="relative flex items-center gap-3 overflow-hidden bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] px-4 py-3">
          <div className={`relative shrink-0 ${isLoading ? "chat-header-avatar--thinking" : ""}`}>
            <Image
              src="/assets/v1/AI-icon-3.png"
              alt="StudyHub Mentor"
              width={54}
              height={36}
              className="rounded-xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white">StudyHub Mentor</h3>
            <p className="text-[0.65rem] text-white/70">
              {isLoading ? "Thinking..." : "AI-powered study assistant"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/20 hover:text-white"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Image
                src="/assets/v1/AI-icon-3.png"
                alt="AI"
                width={72}
                height={48}
                className="animate-[gentleFloat_4s_ease-in-out_infinite] drop-shadow-[0_8px_16px_rgba(99,102,241,0.2)]"
              />
              <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                How can I help you today?
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Ask me anything about coding!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "model" ? (
                    <Image
                      src="/assets/v1/AI-icon-3.png"
                      alt=""
                      width={30}
                      height={20}
                      className="mb-1 shrink-0 rounded-lg"
                    />
                  ) : null}
                  <div className="relative max-w-[80%]">
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "rounded-br-md bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] text-white"
                          : "rounded-bl-md border border-slate-200/80 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      }`}
                      dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                    />
                    {msg.role === "model" ? <CopyButton text={msg.text} /> : null}
                  </div>
                </div>
              ))}
              {isLoading ? (
                <div className="flex items-end gap-2">
                  <Image
                    src="/assets/v1/AI-icon-3.png"
                    alt=""
                    width={30}
                    height={20}
                    className="mb-1 shrink-0 animate-[thinkingBob_0.9s_ease-in-out_infinite] rounded-lg"
                  />
                  <div className="rounded-2xl rounded-bl-md border border-slate-200/80 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                    <ThinkingDots />
                  </div>
                </div>
              ) : null}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-200/80 px-4 py-3 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask a question..."
              suppressHydrationWarning
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-500/20"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
