"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Toast } from "../ui/toast";
import { AuthIconField } from "./auth-icon-field";
import { LockIcon } from "./auth-icons";

function useResetPasswordForm(token: string) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [apiError, setApiError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError("");
    setApiError("");

    if (newPassword !== confirmPassword) {
      setFieldError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setFieldError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        setApiError(payload.message ?? "Something went wrong. Please try again.");
        return;
      }

      window.location.href = "/login?reset=success";
    } catch {
      setApiError("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return {
    newPassword,
    confirmPassword,
    loading,
    fieldError,
    apiError,
    setNewPassword,
    setConfirmPassword,
    clearApiError: () => setApiError(""),
    handleSubmit,
  };
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const {
    newPassword,
    confirmPassword,
    loading,
    fieldError,
    apiError,
    setNewPassword,
    setConfirmPassword,
    clearApiError,
    handleSubmit,
  } = useResetPasswordForm(token);

  if (!token) {
    return (
      <div className="py-2 text-center">
        <h2 className="mb-3 text-xl font-bold text-slate-800 dark:text-slate-100">
          Invalid reset link
        </h2>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">
          This reset link is invalid. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="text-sm font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <>
      {apiError && (
        <Toast message={apiError} tone="error" onClose={clearApiError} />
      )}

      <div className="mb-5 text-center sm:mb-6">
        <h1 className="font-shantell inline-block bg-gradient-to-r from-brand-700 via-v1-blue to-v1-cyan bg-clip-text text-2xl font-bold text-transparent drop-shadow-[0_8px_24px_rgba(99,102,241,0.14)] dark:from-white dark:via-brand-100 dark:to-cyan-200 sm:text-3xl">
          New password
        </h1>
        <p className="mt-2.5 text-sm text-slate-500 dark:text-slate-400">
          Choose a new password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fieldError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-900/30 dark:text-red-300">
            {fieldError}
          </div>
        )}

        <div className="space-y-3.5">
          <AuthIconField
            id="new-password"
            type="password"
            label="New password"
            value={newPassword}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            icon={<LockIcon />}
            minLength={6}
            showToggle
            onChange={(event) => setNewPassword(event.target.value)}
          />

          <AuthIconField
            id="confirm-password"
            type="password"
            label="Confirm password"
            value={confirmPassword}
            autoComplete="new-password"
            placeholder="Repeat your new password"
            icon={<LockIcon />}
            minLength={6}
            showToggle
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>

        <button type="submit" disabled={loading} className="auth-btn">
          {loading ? "Updating your password... 🔐" : "Update password"}
        </button>

        <div className="flex justify-center pt-1">
          <Link
            href="/login"
            className="text-sm font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
          >
            &larr; Back to sign in
          </Link>
        </div>
      </form>
    </>
  );
}

import { Suspense } from "react";

export function ResetPasswordForm() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
