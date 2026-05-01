"use client";

import { AuthIconField } from "./auth-icon-field";
import { EmailIcon, LockIcon, UserIcon } from "./auth-icons";
import { RegisterFormHeader } from "./register-form-header";
import { useRegisterForm } from "./use-register-form";
import { Toast } from "../ui/toast";
import { AuthSectionDivider } from "./auth-section-divider";
import { AuthGoogleSignIn } from "./auth-google-sign-in";
import { PASSWORD_POLICY_MESSAGE } from "../../lib/password-validation";

export function RegisterForm() {
  const {
    name,
    email,
    password,
    error,
    loading,
    success,
    toast,
    setName,
    setEmail,
    setPassword,
    closeToast,
    handleSubmit,
    handleGoogleError,
  } = useRegisterForm();

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
        <img
          src="/assets/v1/ziksi-celebration.png"
          alt="Ziksi celebrating"
          width={140}
          height={140}
          className="h-36 w-36 animate-bounce object-contain drop-shadow-[0_12px_28px_rgba(99,102,241,0.3)]"
        />
        <div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            Welcome aboard, {name.split(" ")[0]}! 🎉
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Taking you to your dashboard...
          </p>
        </div>
      </div>
    );
  }

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
              minLength={8}
              placeholder="Use a strong password"
              icon={<LockIcon />}
              showToggle
              onChange={(event) => setPassword(event.target.value)}
            />

            <p className="px-1 text-right text-[0.68rem] leading-4 text-slate-500 dark:text-slate-400">
              {PASSWORD_POLICY_MESSAGE}
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
