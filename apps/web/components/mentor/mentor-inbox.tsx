"use client";

import { useState } from "react";
import Link from "next/link";
import { PageBackgroundShell } from "../layout/page-background-shell";
import {
  PREMIUM_DARK_BUTTON,
  PREMIUM_DARK_CARD_BG,
} from "../layout/premium-dark-styles";

type Question = {
  id: number;
  title: string;
  content: string;
  status: string;
  questionStatus: string | null;
  courseId: number | null;
  courseTitle: string | null;
  authorName: string | null;
  authorAvatarUrl: string | null;
  createdAt: string;
  likeCount: number;
  commentCount: number;
};

const Q_STATUS_LABELS: Record<string, string> = {
  open: "Open",
  answered: "Answered",
  closed: "Closed",
};

const Q_STATUS_COLORS: Record<string, string> = {
  open:     "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
  answered: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
  closed:   "bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600",
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

export function MentorInbox({ initialQuestions }: { initialQuestions: Question[] }) {
  const [allQuestions, setAllQuestions] = useState<Question[]>(initialQuestions);
  const [filter, setFilter]             = useState("");
  const [updating, setUpdating]         = useState<number | null>(null);

  async function setStatus(questionId: number, questionStatus: string) {
    setUpdating(questionId);
    await fetch(`/api/posts/${questionId}/answer-status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionStatus }),
    });
    setAllQuestions((prev) =>
      prev.map((q) => q.id === questionId ? { ...q, questionStatus } : q)
    );
    setUpdating(null);
  }

  // Counts always from the full dataset — don't change when filter is active
  const counts = {
    open:     allQuestions.filter((q) => q.questionStatus === "open").length,
    answered: allQuestions.filter((q) => q.questionStatus === "answered").length,
    closed:   allQuestions.filter((q) => q.questionStatus === "closed").length,
  };

  // Client-side filtering for display
  const questions = filter ? allQuestions.filter((q) => q.questionStatus === filter) : allQuestions;

  return (
    <PageBackgroundShell contentClassName="max-w-4xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-shantell text-3xl font-black tracking-tight bg-v1-gradient bg-clip-text text-transparent">
          Mentor Inbox
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Questions from your courses
        </p>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {(["open", "answered", "closed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(filter === s ? "" : s)}
            className={`rounded-xl border p-3 text-center transition ${
              filter === s
                ? Q_STATUS_COLORS[s]
                : `border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700/60 ${PREMIUM_DARK_CARD_BG}`
            }`}
          >
            <p className="text-2xl font-black text-slate-800 dark:text-white">{counts[s]}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize">{s}</p>
          </button>
        ))}
      </div>

      {/* List */}
      {questions.length === 0 ? (
        <div className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 py-20 dark:border-slate-700/80 ${PREMIUM_DARK_CARD_BG}`}>
          <svg className="h-10 w-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
          <p className="text-slate-500 dark:text-slate-400">
            {filter ? `No ${filter} questions` : "No questions yet"}
          </p>
          {filter && (
            <button onClick={() => setFilter("")} className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
              Show all
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <div
              key={q.id}
              className={`rounded-2xl border bg-white/80 p-5 shadow-sm backdrop-blur-sm transition ${PREMIUM_DARK_CARD_BG} ${
                q.questionStatus === "open"
                  ? "border-amber-200 dark:border-amber-800/60"
                  : "border-slate-200/80 dark:border-slate-700/60"
              } ${updating === q.id ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{q.authorName}</span>
                    <span>·</span>
                    <span>{timeAgo(q.createdAt)}</span>
                    {q.courseTitle && (
                      <>
                        <span>·</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800/80">{q.courseTitle}</span>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <Link href={`/community/${q.id}`} className="mt-1 block">
                    <h3 className="font-shantell text-base font-bold text-slate-800 hover:text-brand-600 dark:text-slate-100 dark:hover:text-brand-400 line-clamp-2 transition">
                      {q.title}
                    </h3>
                  </Link>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{q.content}</p>

                  {/* Stats */}
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                    <span>♥ {q.likeCount}</span>
                    <span>💬 {q.commentCount}</span>
                  </div>
                </div>

                {/* Status control */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${Q_STATUS_COLORS[q.questionStatus ?? "open"] ?? ""}`}>
                    {Q_STATUS_LABELS[q.questionStatus ?? "open"] ?? q.questionStatus}
                  </span>

                  <div className="flex gap-1.5">
                    {q.questionStatus !== "answered" && (
                      <button
                        disabled={updating === q.id}
                        onClick={() => setStatus(q.id, "answered")}
                        className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-900/20 dark:text-emerald-400"
                      >
                        Mark answered
                      </button>
                    )}
                    {q.questionStatus !== "closed" && (
                      <button
                        disabled={updating === q.id}
                        onClick={() => setStatus(q.id, "closed")}
                        className={`rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-200 disabled:opacity-50 dark:border dark:border-slate-700/60 ${PREMIUM_DARK_BUTTON}`}
                      >
                        Close
                      </button>
                    )}
                    {q.questionStatus !== "open" && (
                      <button
                        disabled={updating === q.id}
                        onClick={() => setStatus(q.id, "open")}
                        className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600 transition hover:bg-amber-100 disabled:opacity-50 dark:bg-amber-900/20 dark:text-amber-400"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageBackgroundShell>
  );
}
