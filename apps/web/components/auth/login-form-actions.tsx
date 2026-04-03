import { AuthSectionDivider } from "./auth-section-divider";
import { AuthGoogleSignIn } from "./auth-google-sign-in";

type LoginFormActionsProps = {
  onForgotPassword: () => void;
  onGoogleError: (error: string) => void;
};

export function LoginFormActions({
  onForgotPassword,
  onGoogleError,
}: LoginFormActionsProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
        >
          Forgot password?
        </button>
      </div>

      <AuthSectionDivider label="OR" />

      <AuthGoogleSignIn onError={onGoogleError} />

      <div className="rounded-2xl border border-dashed border-slate-200/80 bg-white/55 px-4 py-2.5 text-[0.72rem] leading-5 text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
        Password reset stays visible for parity, but we will
        wire it after the base JWT auth flow is fully stable.
      </div>
    </div>
  );
}
