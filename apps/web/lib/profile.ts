export type ProfileUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  createdAt: string;
};

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_MAX_MB = 2;
export const AVATAR_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;
export const AVATAR_FILE_ACCEPT = AVATAR_ALLOWED_MIME_TYPES.join(",");
const MOBILE_PROFILE_SCHEME = "studyhubv2://profile";

type PasswordFields = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function formatRoleLabel(role: string): string {
  if (!role) return "Member";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function formatMemberSince(createdAt: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(createdAt));
}

export function getProfileInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function normalizeAvatarUrl(value: string | null | undefined): string | null {
  const trimmedValue = value?.trim() ?? "";
  if (!trimmedValue) return null;

  try {
    const url = new URL(trimmedValue);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export function getProfileStatus(hasAvatar: boolean, hasUnsavedChanges: boolean): {
  label: string;
  description: string;
} {
  if (hasUnsavedChanges) {
    return {
      label: "Draft changes",
      description: "Save your edits to sync them across the workspace.",
    };
  }

  if (hasAvatar) {
    return {
      label: "Profile polished",
      description: "Your account card already feels complete and recognizable.",
    };
  }

  return {
      label: "Photo missing",
      description: "Use an image URL for your avatar, or leave it blank to keep your initials.",
    };
}

export function validatePasswordChange(fields: PasswordFields): string | null {
  if (!fields.currentPassword || !fields.newPassword || !fields.confirmPassword) {
    return "Fill in all password fields first.";
  }

  if (fields.newPassword !== fields.confirmPassword) {
    return "New password and confirmation do not match.";
  }

  if (fields.newPassword.length < 6) {
    return "New password must be at least 6 characters.";
  }

  if (fields.currentPassword === fields.newPassword) {
    return "Choose a new password different from the current one.";
  }

  return null;
}

export function buildMobileProfileDeepLink(userId: number): string {
  return `${MOBILE_PROFILE_SCHEME}/${userId}`;
}

export function buildMobileProfileQrImageUrl(deepLink: string): string {
  const encodedData = encodeURIComponent(deepLink);
  return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&format=png&data=${encodedData}`;
}
