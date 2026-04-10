import type { ThemeMode } from "../../lib/colors";

export type ThemeOption = {
  value: ThemeMode;
  label: string;
};

export type AboutLink = {
  id: string;
  label: string;
  description: string;
  url: string;
};

export type SettingsViewModel = {
  ready: boolean;
  themeMode: ThemeMode;
  hapticsEnabled: boolean;
  appVersionLabel: string;
  themeOptions: ThemeOption[];
  aboutLinks: AboutLink[];
  setThemeMode: (value: ThemeMode) => void;
  setHapticsEnabled: (value: boolean) => void;
  openAboutLink: (url: string) => void;
  openProfileEditor: () => void;
  logout: () => void;
};
