"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Course = { id: number; title: string };

const TYPE_OPTIONS = [
  { value: "discussion", label: "Discussion" },
  { value: "question",   label: "Question" },
  { value: "resource",   label: "Resource" },
  { value: "article",    label: "Article" },
];

export function CreatePostForm() {
  const router = useRouter();
  const [title, setTitle]       = useState("");
  const [content, setContent]   = useState("");
  const [postType, setPostType] = useState("discussion");
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses]   = useState<Course[]>([]);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    fetch("/api/courses").then((r) => r.json()).then((d) => setCourses(d.courses ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, postType, courseId: courseId || null }),
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        const message =
          payload && typeof payload === "object" && "message" in payload
            ? String((payload as { message?: unknown }).message ?? "")
            : "";
        setError(message || "Failed to create post.");
        return;
      }

      const postId =
        payload && typeof payload === "object" && "post" in payload
          ? (payload as { post?: { id?: unknown } }).post?.id
          : undefined;

      if (typeof postId !== "number") {
        setError("Post was created but could not open details.");
        router.push("/community");
        return;
      }

      router.push(`/community/${postId}`);
    } catch {
      setError("Failed to create post.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/community" className="rounded-xl border border-slate-200 bg-white/80 p-2 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60">
          <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <h1 className="font-shantell text-2xl font-black tracking-tight bg-v1-gradient bg-clip-text text-transparent">
          New Post
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

        {/* Course (optional) */}
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
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
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
            placeholder="What's on your mind?"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* Content */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="Write your post here..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white resize-none"
          />
        </div>

        {error && (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">{error}</p>
        )}

        <div className="flex justify-end gap-3 pt-1">
          <Link href="/community" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-v1-gradient px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
          >
            {saving ? "Submitting..." : "Submit Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
