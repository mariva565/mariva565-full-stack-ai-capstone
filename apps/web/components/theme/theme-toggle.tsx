"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "../auth/auth-icons";
import {
  applyTheme,
  getPreferredTheme,
  hasStoredTheme,
  persistTheme,
  type ThemeMode,
} from "./theme-utils";

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const nextTheme = getPreferredTheme();
    applyTheme(nextTheme);
    setMode(nextTheme);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function handleChange(event: MediaQueryListEvent) {
      if (hasStoredTheme()) {
        return;
      }

      const nextTheme = event.matches ? "dark" : "light";
      applyTheme(nextTheme);
      setMode(nextTheme);
    }

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  function handleToggle() {
    const nextTheme = mode === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    persistTheme(nextTheme);
    setMode(nextTheme);
  }

  const nextModeLabel = mode === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={`Switch to ${nextModeLabel} mode`}
      title={`Switch to ${nextModeLabel} mode`}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/60 text-slate-600 shadow-[0_10px_25px_rgba(15,23,42,0.08)] backdrop-blur-md transition hover:-translate-y-0.5 hover:text-indigo-600 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:text-indigo-300"
    >
      {mode === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
