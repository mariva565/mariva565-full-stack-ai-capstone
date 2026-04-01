export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "studyhub-theme";

export function readStoredTheme(win: Window = window): ThemeMode | null {
  try {
    const storedTheme = win.localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === "dark" || storedTheme === "light"
      ? storedTheme
      : null;
  } catch {
    return null;
  }
}

export function hasStoredTheme(win: Window = window): boolean {
  return readStoredTheme(win) !== null;
}

export function getPreferredTheme(win: Window = window): ThemeMode {
  const storedTheme = readStoredTheme(win);
  if (storedTheme) {
    return storedTheme;
  }

  return win.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(mode: ThemeMode, doc: Document = document): void {
  const root = doc.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.dataset.theme = mode;
  root.style.colorScheme = mode;
}

export function persistTheme(mode: ThemeMode, win: Window = window): void {
  try {
    win.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Ignore storage write failures and keep the active theme applied.
  }
}

export const themeInitScript = `(() => {
  try {
    const key = "${THEME_STORAGE_KEY}";
    const storedTheme = window.localStorage.getItem(key);
    const mode =
      storedTheme === "dark" || storedTheme === "light"
        ? storedTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    root.dataset.theme = mode;
    root.style.colorScheme = mode;
  } catch {
    document.documentElement.classList.remove("dark");
    document.documentElement.dataset.theme = "light";
    document.documentElement.style.colorScheme = "light";
  }
})();`;
