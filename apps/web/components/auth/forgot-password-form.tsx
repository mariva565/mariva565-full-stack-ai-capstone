"use client";

import Link from "next/link";
import { Toast } from "../ui/toast";
import { AuthIconField } from "./auth-icon-field";
import { EmailIcon } from "./auth-icons";
import { useForgotPasswordForm } from "./use-forgot-password-form";

export function ForgotPasswordForm() {
  const { email, loading, submitted, networkError, setEmail, handleSubmit, clearNetworkError } =
    useForgotPasswordForm();

  if (submitted) {
    return (
      <div className="py-2 text-center">
        <div className="mb-4 text-4xl" aria-hidden="true">
          &#128231;
        </div>
        <h2 className="mb-3 text-xl font-bold text-slate-800 dark:text-slate-100">
          Check your inbox
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          If an account exists for{" "}
          <strong className="font-semibold text-slate-800 dark:text-slate-200">
            {email}
          </strong>
          , we&apos;ve sent a reset link. It expires in 1 hour.
        </p>
        <Link
          href="/login"
          className="text-sm font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
        >
          &larr; Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      {networkError && (
        <Toast message={networkError} tone="error" onClose={clearNetworkError} />
      )}

      <div className="mb-5 text-center sm:mb-6">
        <h1 className="font-shantell inline-block bg-gradient-to-r from-brand-700 via-v1-blue to-v1-cyan bg-clip-text text-2xl font-bold text-transparent drop-shadow-[0_8px_24px_rgba(99,102,241,0.14)] dark:from-white dark:via-brand-100 dark:to-cyan-200 sm:text-3xl">
          Forgot password
        </h1>
        <p className="mt-2.5 text-sm text-slate-500 dark:text-slate-400">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthIconField
          id="email"
          type="email"
          label="Email"
          value={email}
          autoComplete="email"
          placeholder="student@softuni.bg"
          icon={<EmailIcon />}
          onChange={(event) => setEmail(event.target.value)}
        />

        <button type="submit" disabled={loading} className="auth-btn">
          {loading ? "Sending reset link... 💌" : "Send reset link"}
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
