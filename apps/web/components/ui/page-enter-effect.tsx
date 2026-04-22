"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * PageEnterEffect — wraps {children} in the root layout.
 * Re-triggers a CSS fade-in every time the pathname changes,
 * WITHOUT remounting children (no nested layout state reset).
 *
 * Technique: clear the animation, flush reflow, restore animation.
 * The `.page-enter-animation` class defines the keyframes in globals.css.
 */
export function PageEnterEffect({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const prevPath = useRef(pathname);

  // After animation ends, clear it so transform:translateY(0) doesn't persist.
  // A live transform on any ancestor breaks position:fixed children (Lottie decorations).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onEnd = () => { el.style.animation = "none"; };
    el.addEventListener("animationend", onEnd);
    return () => el.removeEventListener("animationend", onEnd);
  }, []);

  useEffect(() => {
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;

    const el = ref.current;
    if (!el) return;

    el.style.animation = "none";
    void el.offsetHeight; // flush pending style to force reflow
    el.style.animation = "";
  }, [pathname]);

  return (
    <div ref={ref} className="page-enter-animation">
      {children}
    </div>
  );
}
