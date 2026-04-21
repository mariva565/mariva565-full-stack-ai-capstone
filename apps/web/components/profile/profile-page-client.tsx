"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

import type { ProfileUser } from "../../lib/profile";
import { buildMobileProfileDeepLink } from "../../lib/profile";
import { ProfileAdminCard } from "./profile-admin-card";
import { ProfileDetailsCard } from "./profile-details-card";
import { ProfileHeroCard } from "./profile-hero-card";
import { ProfilePageHeader } from "./profile-page-header";
import { ProfileQrCard } from "./profile-qr-card";
import { ProfileSecurityCard } from "./profile-security-card";
import { useProfilePageState } from "./use-profile-page-state";
import { Toast } from "../ui/toast";

type ProfilePageClientProps = {
  initialUser: ProfileUser;
};

type ProfilePageState = ReturnType<typeof useProfilePageState>;

export function ProfilePageClient({ initialUser }: ProfilePageClientProps) {
  const profileState = useProfilePageState({ initialUser });

  return (
    <>
      <div className="relative overflow-hidden font-poppins">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-brand-100/80 via-white/40 to-transparent dark:hidden" />
        <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-fuchsia-300/30 blur-3xl dark:hidden" />
        <div className="pointer-events-none absolute -right-20 top-40 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl dark:hidden" />

        <div className="pointer-events-none absolute inset-0 hidden dark:block bg-[linear-gradient(180deg,rgba(2,6,23,0.98)_0%,rgba(2,8,23,1)_100%)]" />
        <div className="pointer-events-none absolute -left-24 top-20 hidden h-80 w-80 rounded-full bg-brand-500/10 blur-3xl dark:block" />
        <div className="pointer-events-none absolute -right-20 top-36 hidden h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl dark:block" />
        <div className="pointer-events-none absolute bottom-[-10rem] left-1/2 hidden h-[22rem] w-[28rem] -translate-x-1/2 rounded-full bg-cyan-500/6 blur-3xl dark:block" />

        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <ProfilePageHeader />
          <ProfileCardsGrid state={profileState} />
        </div>
      </div>

      {profileState.toast ? (
        <Toast
          message={profileState.toast.message}
          tone={profileState.toast.tone}
          onClose={profileState.closeToast}
        />
      ) : null}
    </>
  );
}

function ProfileCardsGrid({ state }: { state: ProfilePageState }) {
  const secondaryGridClassName =
    state.user.role === "admin" ? "lg:grid-cols-2 xl:grid-cols-3" : "lg:grid-cols-2";

  return (
    <div className="mt-8 space-y-6">
      <ProfilePrimaryCards state={state} />
      <div className={`grid gap-6 ${secondaryGridClassName}`}>
        <ProfileSecondaryCards state={state} />
      </div>
    </div>
  );
}

function ProfilePrimaryCards({ state }: { state: ProfilePageState }) {
  const name = state.name.trim() || state.user.name;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <ProfileMotion>
        <ProfileHeroCard
          email={state.user.email}
          name={name}
          role={state.user.role}
          createdAt={state.user.createdAt}
          avatarUrl={state.avatarPreviewUrl}
          hasUnsavedChanges={state.hasProfileChanges}
          avatarBusy={state.uploadingAvatar || state.removingAvatar}
          onClearAvatar={state.handleRemoveAvatar}
        />
      </ProfileMotion>

      <ProfileMotion delay={0.08}>
        <ProfileDetailsCard
          name={state.name}
          email={state.user.email}
          avatarUrl={state.avatarUrl}
          roleLabel={state.roleLabel}
          memberSince={state.memberSince}
          saving={state.savingProfile}
          hasChanges={state.hasProfileChanges}
          onNameChange={state.setName}
          onAvatarUrlChange={state.setAvatarUrl}
          onSubmit={state.handleProfileSubmit}
        />
      </ProfileMotion>
    </div>
  );
}

function ProfileSecondaryCards({ state }: { state: ProfilePageState }) {
  const mobileProductionDeepLink = buildMobileProfileDeepLink(state.user.id);

  return (
    <>
      <ProfileMotion delay={0.16}>
        <ProfileSecurityCard
          currentPassword={state.currentPassword}
          newPassword={state.newPassword}
          confirmPassword={state.confirmPassword}
          saving={state.savingPassword}
          onCurrentPasswordChange={state.setCurrentPassword}
          onNewPasswordChange={state.setNewPassword}
          onConfirmPasswordChange={state.setConfirmPassword}
          onSubmit={state.handlePasswordSubmit}
        />
      </ProfileMotion>

      <ProfileMotion delay={0.24}>
        <ProfileQrCard
          productionDeepLink={mobileProductionDeepLink}
          userId={state.user.id}
        />
      </ProfileMotion>

      {state.user.role === "admin" ? (
        <ProfileMotion delay={0.32}>
          <ProfileAdminCard />
        </ProfileMotion>
      ) : null}
    </>
  );
}

function ProfileMotion({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
