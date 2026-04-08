export const COLORS = {
  brandPrimary: "#4d33c4",
  brandDeep: "#2e1d7a",
  brandAccent: "#7c5ce7",

  canvas: "#f8f6ff",
  surface: "#ffffff",
  borderSubtle: "#f1edff",
  borderMuted: "#e2e8f0",

  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
  textOnBrand: "#ffffff",

  danger: "#dc2626",
  dangerSoft: "#fff1f2",
  dangerBorder: "#fda4af",
  dangerText: "#be123c",

  violetSoft: "#f0ecff",
  violetBorder: "#c4b5fd",
  violetText: "#5b21b6",
} as const;

export const GRADIENTS = {
  hero: [COLORS.brandDeep, COLORS.brandPrimary] as const,
  heroStrong: [COLORS.brandDeep, COLORS.brandPrimary, COLORS.brandAccent] as const,
  primaryAction: [COLORS.brandPrimary, COLORS.brandAccent] as const,
} as const;

