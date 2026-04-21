"use client";

import { FormEvent, useState, useEffect } from "react";

type ShareModalProps = {
  materialId: number;
  materialTitle: string;
  onConfirm: (email: string) => Promise<void>;
  onClose: () => void;
};

type SharedUser = {
  id: number;
  email: string;
  name: string | null;
  sharedAt: string;
};

export function ShareModal({ materialId, materialTitle, onConfirm, onClose }: ShareModalProps) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [loadingShares, setLoadingShares] = useState(true);

  useEffect(() => {
    async function loadShares() {
      try {
        const res = await fetch(`/api/materials/${materialId}/share`);
        if (res.ok) {
          const data = await res.json();
          setSharedUsers(data.shares || []);
        }
      } catch (err) {
        console.error("Failed to load shares", err);
      } finally {
        setLoadingShares(false);
      }
    }
    loadShares();
  }, [materialId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    await onConfirm(email.trim());
    // Refresh shares after successful share
    const res = await fetch(`/api/materials/${materialId}/share`);
    if (res.ok) {
      const data = await res.json();
      setSharedUsers(data.shares || []);
    }
    setEmail("");
    setBusy(false);
  }

  async function handleUnshare(recipientId: number) {
    setSharedUsers((prev) => prev.filter((u) => u.id !== recipientId));
    try {
      await fetch(`/api/materials/${materialId}/share/${recipientId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to unshare", err);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-[1.5rem] border border-white/60 bg-[linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(248,250,252,0.94)_60%,rgba(238,242,255,0.92)_100%)] p-6 shadow-2xl dark:border-slate-700/80 dark:bg-[linear-gradient(160deg,rgba(16,24,48,0.95)_0%,rgba(8,16,38,0.95)_58%,rgba(5,12,28,0.98)_100%)]">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Share Material
        </h2>
        <p className="mt-1 text-sm font-semibold text-brand-600 dark:text-cyan-400 truncate">
          {materialTitle}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div>
            <label
              htmlFor="share-email"
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Share with email
            </label>
            <input
              id="share-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-300/40 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-brand-400"
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              The recipient will be able to view this note in the future "Shared with Me" section.
            </p>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-50/50 px-4 py-2.5 text-sm font-semibold text-amber-600 border border-amber-200/50 shadow-sm transition hover:bg-amber-100/50 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-400/20 dark:hover:bg-amber-500/20"
          >
            <span className="text-lg">✉</span>
            {busy ? "Sharing..." : "Share + Email notification"}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-3">
            Shared with
          </h3>

          <div className="border border-slate-200 dark:border-slate-700 rounded-xl max-h-40 overflow-y-auto mb-5 bg-white/50 dark:bg-slate-800/50">
            {loadingShares ? (
              <p className="px-4 py-3 text-sm text-slate-500">Loading...</p>
            ) : sharedUsers.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">Not shared with anyone yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {sharedUsers.map((user) => (
                  <li key={user.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {user.email}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Shared on {new Date(user.sharedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUnshare(user.id)}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                      <span className="text-[10px]">✕</span>
                      Unshare
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full bg-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 dark:bg-pink-600 dark:hover:bg-pink-500 dark:focus:ring-offset-slate-900"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleSubmit}
              className="flex-1 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:focus:ring-offset-slate-900"
            >
              {busy ? "Sharing..." : "Share"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
