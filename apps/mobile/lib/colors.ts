import * as SecureStore from "expo-secure-store";
import { Appearance } from "react-native";

export type ThemeMode = "system" | "light" | "dark";
type ResolvedTheme = "light" | "dark";

export const THEME_MODE_KEY = "studyhub_theme_mode_v1";

const LIGHT_COLORS = {
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

const DARK_COLORS = {
  brandPrimary: "#7c5ce7",
  brandDeep: "#181038",
  brandAccent: "#a78bfa",

  canvas: "#090d1a",
  surface: "#12192c",
  surfaceSoft: "#18213a",
  surfaceMuted: "#1a2437",
  surfaceHighlight: "#202d4a",
  borderSubtle: "#273552",
  borderMuted: "#344362",

  textPrimary: "#e7edff",
  textSecondary: "#acb7d3",
  textTertiary: "#98a4c3",
  textStrong: "#d6dff7",
  textMuted: "#8090b4",
  textOnBrand: "#ffffff",
  textOnDangerSoft: "#fee2e2",

  danger: "#f87171",
  dangerAccent: "#fb7185",
  dangerSoft: "#3b1c25",
  dangerSoftAlt: "#43202a",
  dangerBorder: "#b64a62",
  dangerBorderSoft: "#7b394d",
  dangerText: "#fecdd3",

  successSoft: "#193528",
  successBorder: "#3d8a61",
  infoSoft: "#1a3047",
  infoBorder: "#3f6f93",

  link: "#7dd3fc",
  linkSoft: "#17364a",
  warning: "#fbbf24",
  warningSoft: "#3b3114",

  violetSoft: "#292442",
  violetBorder: "#5e53a3",
  violetText: "#c9bcff",
  lavenderSoft: "#292442",

  shadow: "#000",
} as const;

export type AppColors = {
  [Key in keyof typeof LIGHT_COLORS]: string;
};

function isThemeMode(value: unknown): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

function getSystemTheme(): ResolvedTheme {
  return Appearance.getColorScheme() === "dark" ? "dark" : "light";
}

export function resolveThemeMode(mode: ThemeMode, systemTheme = getSystemTheme()): ResolvedTheme {
  if (mode === "system") {
    return systemTheme;
  }
  return mode;
}

export function getStoredThemeModeSync(): ThemeMode {
  try {
    const raw = SecureStore.getItem(THEME_MODE_KEY);
    return isThemeMode(raw) ? raw : "system";
  } catch {
    return "system";
  }
}

export function setStoredThemeModeSync(mode: ThemeMode): void {
  try {
    SecureStore.setItem(THEME_MODE_KEY, mode);
  } catch {
    // Ignore storage write failures and keep runtime fallback behavior.
  }
}

function getColorsForResolvedTheme(theme: ResolvedTheme): AppColors {
  return theme === "dark" ? DARK_COLORS : LIGHT_COLORS;
}

export function getColorsForThemeMode(mode: ThemeMode, systemTheme = getSystemTheme()): AppColors {
  return getColorsForResolvedTheme(resolveThemeMode(mode, systemTheme));
}

function buildGradients(colors: AppColors) {
  return {
    hero: [colors.brandDeep, colors.brandPrimary] as const,
    heroStrong: [colors.brandDeep, colors.brandPrimary, colors.brandAccent] as const,
    authHero: [colors.brandDeep, "#3f29a7", colors.brandPrimary] as const,
    primaryAction: [colors.brandPrimary, colors.brandAccent] as const,
  } as const;
}

const INITIAL_THEME_MODE = getStoredThemeModeSync();
const INITIAL_COLORS = getColorsForThemeMode(INITIAL_THEME_MODE);

export const COLORS = INITIAL_COLORS;
export const GRADIENTS = buildGradients(COLORS);
