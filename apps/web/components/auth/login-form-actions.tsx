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

      <AuthGoogleSignIn onError={onGoogleError} variant="login" />
    </div>
  );
}
