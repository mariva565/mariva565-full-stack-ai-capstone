export const COLORS = {
  brandPrimary: "#4d33c4",
  brandDeep: "#2e1d7a",
  brandAccent: "#7c5ce7",

  canvas: "#f8f6ff",
  surface: "#ffffff",
  surfaceSoft: "#f8fafc",
  surfaceMuted: "#f1f5f9",
  surfaceHighlight: "#faf9ff",
  borderSubtle: "#f1edff",
  borderMuted: "#e2e8f0",

  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  textTertiary: "#475569",
  textStrong: "#334155",
  textMuted: "#94a3b8",
  textOnBrand: "#ffffff",
  textOnDangerSoft: "#ffe4e6",

  danger: "#dc2626",
  dangerAccent: "#ef4444",
  dangerSoft: "#fff1f2",
  dangerSoftAlt: "#fef2f2",
  dangerBorder: "#fda4af",
  dangerBorderSoft: "#fecaca",
  dangerText: "#be123c",

  successSoft: "#dcfce7",
  successBorder: "#86efac",
  infoSoft: "#eff6ff",
  infoBorder: "#bfdbfe",

  link: "#0ea5e9",
  linkSoft: "#e0f2fe",
  warning: "#f59e0b",
  warningSoft: "#fef3c7",

  violetSoft: "#f0ecff",
  violetBorder: "#c4b5fd",
  violetText: "#5b21b6",
  lavenderSoft: "#ede9fe",

  shadow: "#000",
} as const;

export const GRADIENTS = {
  hero: [COLORS.brandDeep, COLORS.brandPrimary] as const,
  heroStrong: [COLORS.brandDeep, COLORS.brandPrimary, COLORS.brandAccent] as const,
  authHero: [COLORS.brandDeep, "#3f29a7", COLORS.brandPrimary] as const,
  primaryAction: [COLORS.brandPrimary, COLORS.brandAccent] as const,
} as const;
