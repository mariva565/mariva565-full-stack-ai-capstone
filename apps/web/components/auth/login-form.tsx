"use client";

import { Toast } from "../ui/toast";
import { AuthIconField } from "./auth-icon-field";
import { EmailIcon, LockIcon } from "./auth-icons";
import { LoginFormActions } from "./login-form-actions";
import { LoginFormHeader } from "./login-form-header";
import { useLoginForm } from "./use-login-form";

export function LoginForm() {
  const {
    email,
    password,
    error,
    loading,
    toast,
    setEmail,
    setPassword,
    closeToast,
    handleSubmit,
    handlePlannedFeatureClick,
  } = useLoginForm();

  return (
    <>
      {toast && (
        <Toast message={toast.message} tone={toast.tone} onClose={closeToast} />
      )}

      <LoginFormHeader />

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-3.5">
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

          <AuthIconField
            id="password"
            type="password"
            label="Password"
            value={password}
            autoComplete="current-password"
            placeholder="********"
            icon={<LockIcon />}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button type="submit" disabled={loading} className="auth-btn">
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <LoginFormActions
          onForgotPassword={() => handlePlannedFeatureClick("password-reset")}
          onGoogleSignIn={() => handlePlannedFeatureClick("google")}
        />
      </form>
    </>
  );
}
