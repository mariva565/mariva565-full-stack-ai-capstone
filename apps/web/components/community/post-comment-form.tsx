"use client";

type Props = {
  value: string;
  submitting: boolean;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function PostCommentForm({ value, submitting, onChange, onSubmit }: Props) {
  return (
    <form onSubmit={onSubmit} className="mb-6 flex gap-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        placeholder="Write a comment..."
        className="flex-1 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white resize-none"
      />
      <button
        type="submit"
        disabled={submitting || !value.trim()}
        className="self-end rounded-xl bg-v1-gradient px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 disabled:opacity-50"
      >
        {submitting ? "..." : "Post"}
      </button>
    </form>
  );
}
