"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { readErrorMessage } from "@/lib/http";
import {
  AVATAR_MAX_MB,
  type ProfileUser,
  formatMemberSince,
  formatRoleLabel,
  normalizeAvatarUrl,
  validatePasswordChange,
} from "@/lib/profile";
import type { ToastTone } from "../ui/toast";

type ToastState = {
  tone: ToastTone;
  message: string;
};

type UseProfilePageStateParams = {
  initialUser: ProfileUser;
};

export function useProfilePageState({ initialUser }: UseProfilePageStateParams) {
  const router = useRouter();
  const [user, setUser] = useState<ProfileUser>(initialUser);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [name, setName] = useState(initialUser.name);
  const [avatarUrl, setAvatarUrl] = useState(initialUser.avatarUrl ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const normalizedAvatarUrl = normalizeAvatarUrl(avatarUrl);

    if (!trimmedName) {
      setToast({ tone: "error", message: "Display name is required." });
      return;
    }

    if (avatarUrl.trim() && !normalizedAvatarUrl) {
      setToast({
        tone: "error",
        message: "Avatar URL must be a valid http(s) image link.",
      });
      return;
    }

    setSavingProfile(true);
    const response = await fetch("/api/auth/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmedName, avatarUrl: normalizedAvatarUrl }),
    });
    setSavingProfile(false);

    if (response.status === 401) {
      router.replace("/login");
      return;
    }

    if (!response.ok) {
      setToast({
        tone: "error",
        message: await readErrorMessage(response, "Could not save profile changes."),
      });
      return;
    }

    const payload = (await response.json()) as { user: ProfileUser };
    setUser(payload.user);
    setName(payload.user.name);
    setAvatarUrl(payload.user.avatarUrl ?? "");
    setToast({ tone: "success", message: "Profile updated." });
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationMessage = validatePasswordChange({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (validationMessage) {
      setToast({ tone: "error", message: validationMessage });
      return;
    }

    setSavingPassword(true);
    const response = await fetch("/api/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setSavingPassword(false);

    if (response.status === 401) {
      router.replace("/login");
      return;
    }

    if (!response.ok) {
      setToast({
        tone: "error",
        message: await readErrorMessage(response, "Could not update password."),
      });
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setToast({ tone: "success", message: "Password updated." });
  }

  async function handleAvatarFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/auth/avatar", {
        method: "POST",
        body: formData,
      });

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        setToast({
          tone: "error",
          message: await readErrorMessage(
            response,
            `Could not upload avatar. Use JPG, PNG, WebP, or GIF up to ${AVATAR_MAX_MB} MB.`
          ),
        });
        return;
      }

      const payload = (await response.json()) as { user: ProfileUser };
      setUser(payload.user);
      setAvatarUrl(payload.user.avatarUrl ?? "");
      setToast({ tone: "success", message: "Avatar uploaded." });
    } catch {
      setToast({
        tone: "error",
        message: "Could not upload avatar right now. Please try again.",
      });
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleRemoveAvatar() {
    const hasAnyAvatar = Boolean(user?.avatarUrl) || Boolean(avatarUrl.trim());
    if (!hasAnyAvatar) {
      setAvatarUrl("");
      return;
    }

    setRemovingAvatar(true);

    try {
      const response = await fetch("/api/auth/avatar", {
        method: "DELETE",
      });

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        setToast({
          tone: "error",
          message: await readErrorMessage(response, "Could not remove avatar."),
        });
        return;
      }

      const payload = (await response.json()) as { user: ProfileUser };
      setUser(payload.user);
      setAvatarUrl("");
      setToast({ tone: "success", message: "Avatar removed." });
    } catch {
      setToast({
        tone: "error",
        message: "Could not remove avatar right now. Please try again.",
      });
    } finally {
      setRemovingAvatar(false);
    }
  }

  const avatarPreviewUrl = useMemo(() => normalizeAvatarUrl(avatarUrl), [avatarUrl]);

  const hasProfileChanges = useMemo(() => {
    if (!user) return false;

    return (
      name.trim() !== user.name ||
      avatarUrl.trim() !== (user.avatarUrl ?? "").trim()
    );
  }, [avatarUrl, name, user]);

  return {
    user,
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
    roleLabel: user ? formatRoleLabel(user.role) : "",
    memberSince: user ? formatMemberSince(user.createdAt) : "",
    setName,
    setAvatarUrl,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    handleProfileSubmit,
    handlePasswordSubmit,
    handleRemoveAvatar,
    closeToast: () => setToast(null),
  };
}
