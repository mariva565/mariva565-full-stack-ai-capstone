"use client";

import { AuthIconField } from "./auth-icon-field";
import { EmailIcon, LockIcon, UserIcon } from "./auth-icons";
import { RegisterFormHeader } from "./register-form-header";
import { useRegisterForm } from "./use-register-form";
import { Toast } from "../ui/toast";
import { AuthSectionDivider } from "./auth-section-divider";
import { AuthGoogleSignIn } from "./auth-google-sign-in";

export function RegisterForm() {
  const {
    name,
    email,
    password,
    error,
    loading,
    toast,
    setName,
    setEmail,
    setPassword,
    closeToast,
    handleSubmit,
    handleGoogleError,
  } = useRegisterForm();

  return (
    <>
      {toast && (
        <Toast message={toast.message} tone={toast.tone} onClose={closeToast} />
      )}

      <RegisterFormHeader />

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-2.5">
          <AuthIconField
            id="name"
            type="text"
            label="Full Name"
            value={name}
            autoComplete="name"
            placeholder="John Doe"
            icon={<UserIcon />}
            onChange={(event) => setName(event.target.value)}
          />

          <AuthIconField
            id="email"
            type="email"
            label="Email"
            value={email}
            autoComplete="email"
            placeholder="student@example.com"
            icon={<EmailIcon />}
            onChange={(event) => setEmail(event.target.value)}
          />

          <div className="space-y-1">
            <AuthIconField
              id="password"
              type="password"
              label="Password"
              value={password}
              autoComplete="new-password"
              minLength={6}
              placeholder="At least 6 characters"
              icon={<LockIcon />}
              onChange={(event) => setPassword(event.target.value)}
            />

            <p className="px-1 text-right text-[0.68rem] leading-3.5 text-slate-500 dark:text-slate-400">
              Minimum 6 characters for the current backend. A longer password is
              still the better choice.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="auth-btn auth-btn-compact auth-btn-register"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <AuthSectionDivider label="OR" compact />

        <AuthGoogleSignIn onError={handleGoogleError} variant="login" compact />
      </form>
    </>
  );
}
