import type { FormEvent } from "react";
import { LockIcon } from "../auth/auth-icons";
import { ProfileField } from "./profile-field";
import { ShieldIcon, SparklesIcon } from "./profile-icons";

type ProfileSecurityCardProps = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  saving: boolean;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ProfileSecurityCard({
  currentPassword,
  newPassword,
  confirmPassword,
  saving,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: ProfileSecurityCardProps) {
  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-cyan-400/10 dark:bg-[linear-gradient(160deg,rgba(8,16,38,0.94)_0%,rgba(5,12,28,0.98)_100%)] dark:shadow-[0_28px_90px_rgba(2,12,27,0.72),0_0_42px_rgba(99,102,241,0.05)]">
      <div className="flex flex-col gap-2">
        <span className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
          Security
        </span>
        <h2 className="dashboard-script-title text-2xl">Change password</h2>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          Choose a new password for this account.
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <ProfileField
          id="current-password"
          label="Current password"
          type="password"
          value={currentPassword}
          icon={<LockIcon className="h-4 w-4" />}
          autoComplete="current-password"
          onChange={(event) => onCurrentPasswordChange(event.target.value)}
        />

        <div className="grid gap-4">
          <ProfileField
            id="new-password"
            label="New password"
            type="password"
            value={newPassword}
            icon={<ShieldIcon className="h-4 w-4" />}
            autoComplete="new-password"
            minLength={6}
            onChange={(event) => onNewPasswordChange(event.target.value)}
          />
          <ProfileField
            id="confirm-password"
            label="Confirm password"
            type="password"
            value={confirmPassword}
            icon={<SparklesIcon className="h-4 w-4" />}
            autoComplete="new-password"
            minLength={6}
            onChange={(event) => onConfirmPasswordChange(event.target.value)}
          />
        </div>

        <div className="rounded-[1.4rem] border border-brand-100/80 bg-brand-50/80 p-4 text-sm text-slate-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-slate-200">
          <p className="font-semibold text-slate-900 dark:text-white">Password tips</p>
          <p className="mt-1 leading-6 text-slate-600 dark:text-slate-300">
            Use at least 6 characters. For a stronger password, aim for 10+ characters
            with mixed case, numbers, and a symbol.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-full border border-white/70 bg-white/85 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-slate-950/65 dark:text-slate-100 dark:hover:text-brand-200"
        >
          {saving ? "Updating your password... 🔐" : "Change password"}
        </button>
      </form>
    </section>
  );
}
