"use client";

import { motion } from "framer-motion";
import { ProfileAdminCard } from "../../components/profile/profile-admin-card";
import { ProfileDetailsCard } from "../../components/profile/profile-details-card";
import { ProfileHeroCard } from "../../components/profile/profile-hero-card";
import { ProfilePageHeader } from "../../components/profile/profile-page-header";
import { ProfileSecurityCard } from "../../components/profile/profile-security-card";
import { useProfilePageState } from "../../components/profile/use-profile-page-state";
import { Spinner } from "../../components/ui/spinner";
import { Toast } from "../../components/ui/toast";

export default function ProfilePage() {
  const {
    user,
    loading,
    savingProfile,
    savingPassword,
    uploadingAvatar,
    removingAvatar,
    toast,
    name,
    avatarUrl,
    currentPassword,
    newPassword,
    confirmPassword,
    avatarPreviewUrl,
    hasProfileChanges,
    roleLabel,
    memberSince,
    setName,
    setAvatarUrl,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    handleAvatarFileChange,
    handleProfileSubmit,
    handlePasswordSubmit,
    handleRemoveAvatar,
    closeToast,
  } = useProfilePageState();

  if (loading) {
    return <Spinner centered label="Loading your profile..." />;
  }

  if (!user) return null;

  return (
    <>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-brand-100/80 via-white/40 to-transparent dark:hidden" />
        <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-fuchsia-300/30 blur-3xl dark:hidden" />
        <div className="pointer-events-none absolute -right-20 top-40 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl dark:hidden" />

        <div className="pointer-events-none absolute inset-0 hidden dark:block bg-[linear-gradient(180deg,rgba(2,6,23,0.98)_0%,rgba(2,8,23,1)_100%)]" />
        <div className="pointer-events-none absolute -left-24 top-20 hidden h-80 w-80 rounded-full bg-brand-500/10 blur-[120px] dark:block" />
        <div className="pointer-events-none absolute -right-20 top-36 hidden h-80 w-80 rounded-full bg-cyan-500/10 blur-[140px] dark:block" />
        <div className="pointer-events-none absolute bottom-[-10rem] left-1/2 hidden h-[22rem] w-[28rem] -translate-x-1/2 rounded-full bg-cyan-500/6 blur-[140px] dark:block" />

        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <ProfilePageHeader />

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <ProfileHeroCard
                email={user.email}
                name={name.trim() || user.name}
                role={user.role}
                createdAt={user.createdAt}
                avatarUrl={avatarPreviewUrl}
                hasUnsavedChanges={hasProfileChanges}
                avatarBusy={uploadingAvatar || removingAvatar}
                onClearAvatar={handleRemoveAvatar}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}
              className="space-y-6"
            >
              <ProfileDetailsCard
                name={name}
                email={user.email}
                avatarUrl={avatarUrl}
                roleLabel={roleLabel}
                memberSince={memberSince}
                saving={savingProfile}
                uploadingAvatar={uploadingAvatar}
                removingAvatar={removingAvatar}
                hasChanges={hasProfileChanges}
                onNameChange={setName}
                onAvatarUrlChange={setAvatarUrl}
                onAvatarUpload={handleAvatarFileChange}
                onRemoveAvatar={handleRemoveAvatar}
                onSubmit={handleProfileSubmit}
              />

              <ProfileSecurityCard
                currentPassword={currentPassword}
                newPassword={newPassword}
                confirmPassword={confirmPassword}
                saving={savingPassword}
                onCurrentPasswordChange={setCurrentPassword}
                onNewPasswordChange={setNewPassword}
                onConfirmPasswordChange={setConfirmPassword}
                onSubmit={handlePasswordSubmit}
              />

              {user.role === "admin" ? <ProfileAdminCard /> : null}
            </motion.div>
          </div>
        </div>
      </div>

      {toast ? <Toast message={toast.message} tone={toast.tone} onClose={closeToast} /> : null}
    </>
  );
}
