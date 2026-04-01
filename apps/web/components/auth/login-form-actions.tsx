import { AuthSectionDivider } from "./auth-section-divider";
import { GoogleIcon } from "./auth-icons";
import { AuthSocialButton } from "./auth-social-button";

type LoginFormActionsProps = {
  onForgotPassword: () => void;
  onGoogleSignIn: () => void;
};

export function LoginFormActions({
  onForgotPassword,
  onGoogleSignIn,
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

      <AuthSocialButton
        label="Sign in with Google"
        badge="Soon"
        icon={<GoogleIcon className="h-[18px] w-[18px]" />}
        onClick={onGoogleSignIn}
      />

      <div className="rounded-2xl border border-dashed border-slate-200/80 bg-white/55 px-4 py-2.5 text-[0.72rem] leading-5 text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
        Password reset and Google sign-in stay visible for parity, but we will
        wire them after the base JWT auth flow is fully stable.
      </div>
    </div>
  );
}
