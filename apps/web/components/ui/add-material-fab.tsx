"use client";

import { useEffect, useState } from "react";

type AddMaterialFabProps = {
  active: boolean;
  onClick: () => void;
};

/**
 * Floating action button for adding a material.
 * Appears once the user scrolls past the header (~300px),
 * so it never duplicates the visible header button.
 * Clicking while closed also scrolls back to the top so the
 * create form is immediately in view.
 */
export function AddMaterialFab({ active, onClick }: AddMaterialFabProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  function handleClick() {
    onClick();
    if (!active) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <button
      type="button"
      aria-label={active ? "Close create form" : "Add material"}
      onClick={handleClick}
      className={`fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-400/50 ${
        active
          ? "bg-slate-800 text-white dark:bg-slate-700"
          : "bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] text-white shadow-[0_16px_40px_rgba(99,102,241,0.4)]"
      }`}
    >
      <span
        className="text-2xl font-light leading-none transition-transform duration-300"
        style={{ transform: active ? "rotate(45deg)" : "rotate(0deg)" }}
      >
        +
      </span>
    </button>
  );
}
