import type { FormEvent } from "react";
import { EmailIcon, UserIcon } from "../auth/auth-icons";
import { ProfileField } from "./profile-field";
import { CalendarIcon, LinkIcon, ShieldIcon } from "./profile-icons";

type ProfileDetailsCardProps = {
  name: string;
  email: string;
  avatarUrl: string;
  roleLabel: string;
  memberSince: string;
  saving: boolean;
  hasChanges: boolean;
  onNameChange: (value: string) => void;
  onAvatarUrlChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ProfileDetailsCard({
  name,
  email,
  avatarUrl,
  roleLabel,
  memberSince,
  saving,
  hasChanges,
  onNameChange,
  onAvatarUrlChange,
  onSubmit,
}: ProfileDetailsCardProps) {
  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-cyan-400/10 dark:bg-[linear-gradient(160deg,rgba(8,16,38,0.94)_0%,rgba(5,12,28,0.98)_100%)] dark:shadow-[0_28px_90px_rgba(2,12,27,0.72),0_0_42px_rgba(6,182,212,0.05)]">
      <div className="flex flex-col gap-2">
        <span className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
          Profile details
        </span>
        <h2 className="dashboard-script-title text-2xl">Personal info</h2>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          Keep the basics recognizable. Email stays read-only on this screen.
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <ProfileField
          id="profile-email"
          label="Email"
          type="email"
          value={email}
          readOnly
          required={false}
          icon={<EmailIcon className="h-4 w-4" />}
          helperText="Email cannot be edited from this screen."
        />

        <ProfileField
          id="profile-name"
          label="Display name"
          type="text"
          value={name}
          icon={<UserIcon className="h-4 w-4" />}
          placeholder="Your name"
          autoComplete="name"
          onChange={(event) => onNameChange(event.target.value)}
        />

        <ProfileField
          id="profile-avatar"
          label="Avatar image URL"
          type="url"
          value={avatarUrl}
          icon={<LinkIcon className="h-4 w-4" />}
          placeholder="https://example.com/avatar.jpg"
          autoComplete="url"
          required={false}
          onChange={(event) => onAvatarUrlChange(event.target.value)}
          helperText="Use an external https:// image for now."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <ProfileField
            id="profile-role"
            label="Role"
            type="text"
            value={roleLabel}
            readOnly
            required={false}
            icon={<ShieldIcon className="h-4 w-4" />}
          />
          <ProfileField
            id="profile-member-since"
            label="Member since"
            type="text"
            value={memberSince}
            readOnly
            required={false}
            icon={<CalendarIcon className="h-4 w-4" />}
          />
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {hasChanges ? "You have unsaved profile edits." : "Profile details are up to date."}
          </p>

          <button
            type="submit"
            disabled={saving || !hasChanges}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand-500 via-fuchsia-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(99,102,241,0.25)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </section>
  );
}
