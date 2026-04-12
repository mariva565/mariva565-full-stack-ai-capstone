"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TYPE_OPTIONS = [
  { value: "discussion", label: "Discussion" },
  { value: "question",   label: "Question" },
  { value: "resource",   label: "Resource" },
  { value: "article",    label: "Article" },
];

export function EditPostForm({ postId }: { postId: number }) {
  const router = useRouter();
  const [title, setTitle]       = useState("");
  const [content, setContent]   = useState("");
  const [postType, setPostType] = useState("discussion");
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses]   = useState<{ id: number; title: string }[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/posts/${postId}`).then((r) => r.json()),
      fetch("/api/courses").then((r) => r.json()),
    ]).then(([postData, coursesData]) => {
      const p = postData.post;
      if (p) {
        setTitle(p.title ?? "");
        setContent(p.content ?? "");
        setPostType(p.postType ?? "discussion");
        setCourseId(p.courseId ? String(p.courseId) : "");
      }
      setCourses(coursesData.courses ?? []);
      setLoading(false);
    });
  }, [postId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setSaving(true);
    setError("");

    const res = await fetch(`/api/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, postType, courseId: courseId || null }),
    });

    if (!res.ok) {
      const d = await res.json();
      setError(d.message ?? "Failed to save.");
      setSaving(false);
      return;
    }

    router.push(`/community/${postId}`);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-80 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center gap-4">
        <Link href={`/community/${postId}`} className="rounded-xl border border-slate-200 bg-white/80 p-2 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60">
          <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <h1 className="font-shantell text-2xl font-black tracking-tight bg-v1-gradient bg-clip-text text-transparent">
          Edit Post
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/60 space-y-5">
        {/* Type */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Post type</label>
          <div className="flex flex-wrap gap-2">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPostType(opt.value)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  postType === opt.value
                    ? "bg-v1-gradient text-white shadow-md"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Course */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Related course <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">— none —</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={255}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* Content */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white resize-none"
          />
        </div>

        {error && (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">{error}</p>
        )}

        <div className="flex justify-end gap-3 pt-1">
          <Link href={`/community/${postId}`} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-v1-gradient px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
