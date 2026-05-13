"use client";

import { useState, useEffect } from "react";
import { dispatchAdminDataChanged } from "./admin-refresh";
import { readErrorMessage } from "../../lib/http";
import { getPasswordStrength, isStrongPassword, PASSWORD_POLICY_MESSAGE } from "../../lib/password-validation";
import { PREMIUM_DARK_INPUT, PREMIUM_DARK_MODAL_BG } from "../layout/premium-dark-styles";

type UserData = {
  id: number;
  email: string;
  name: string;
  role: string;
};

type UserModalProps = {
  isOpen: boolean;
  user: UserData | null;   // null = create mode
  onClose: () => void;
  onSaved: () => void;
};

const STRENGTH_COLORS = { weak: "bg-red-500", fair: "bg-amber-500", strong: "bg-emerald-500" };
const STRENGTH_WIDTHS = { weak: "w-1/3", fair: "w-2/3", strong: "w-full" };

export function UserModal({ isOpen, user, onClose, onSaved }: UserModalProps) {
  const isEdit = user !== null;
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("user");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setName(user.name);
      setRole(user.role);
    } else {
      setEmail("");
      setName("");
      setRole("user");
    }
    setPassword("");
    setShowPassword(false);
    setError("");
  }, [user, isOpen]);

  if (!isOpen) return null;

  const strength = password ? getPasswordStrength(password) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isEdit && !isStrongPassword(password)) {
      setError(PASSWORD_POLICY_MESSAGE);
      return;
    }
    if (isEdit && password && !isStrongPassword(password)) {
      setError(PASSWORD_POLICY_MESSAGE);
      return;
    }

    const body: Record<string, unknown> = { email: email.trim(), name: name.trim(), role };
    if (password) body.password = password;

    setBusy(true);
    const url = isEdit ? `/api/admin/users/${user!.id}` : "/api/admin/users";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);

    if (res.ok) {
      dispatchAdminDataChanged();
      onSaved();
      onClose();
    } else {
      setError(await readErrorMessage(res, `Failed to ${isEdit ? "update" : "create"} user.`));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-cyan-400/10 ${PREMIUM_DARK_MODAL_BG}`}
      >
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {isEdit ? "Edit User" : "Create User"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-cyan-400/10 ${PREMIUM_DARK_INPUT}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-cyan-400/10 ${PREMIUM_DARK_INPUT}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Password {isEdit && <span className="font-normal text-slate-400">(leave blank to keep current)</span>}
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                required={!isEdit}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-cyan-400/10 ${PREMIUM_DARK_INPUT}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7.5a11.72 11.72 0 013.168-4.477M6.343 6.343A9.97 9.97 0 0112 5c5 0 9.27 3.11 11 7.5a11.72 11.72 0 01-4.168 4.477M6.343 6.343L3 3m3.343 3.343l2.829 2.829M17.657 17.657L21 21m-3.343-3.343l-2.829-2.829M9.88 9.88a3 3 0 104.24 4.24" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {strength && (
              <div className="mt-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className={`h-full rounded-full transition-all duration-300 ${STRENGTH_COLORS[strength]} ${STRENGTH_WIDTHS[strength]}`} />
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 capitalize">{strength} password</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={`mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-cyan-400/10 ${PREMIUM_DARK_INPUT}`}
            >
              <option value="user">User</option>
              <option value="mentor">Mentor</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
            >
              {busy ? "Saving..." : isEdit ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
