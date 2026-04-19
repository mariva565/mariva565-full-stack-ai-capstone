export type UserRole = "user" | "mentor" | "admin";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string | null;
};

export type ApiError = {
  code: string;
  message: string;
};
