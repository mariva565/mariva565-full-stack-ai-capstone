"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./use-reduced-motion";

interface UseVisibleAnimationOptions {
  /** IntersectionObserver threshold (0–1). Default 0.15 */
  threshold?: number;
  /** IntersectionObserver rootMargin. Default "0px" */
  rootMargin?: string;
  /**
   * "continuous" — tracks enter AND exit (for pausing animations).
   * "once" — fires once and stays true (for entrance reveals).
   * Default "continuous".
   */
  mode?: "continuous" | "once";
}

/**
 * IntersectionObserver hook that is animation-lifecycle-aware:
 *
 * - `isVisible`  — true while the element is in the viewport
 * - `hasEntered` — true after the first intersection (never resets)
 * - `shouldAnimate` — false when the user prefers reduced motion
 *
 * Use `isVisible` to pause/resume ongoing animations.
 * Use `hasEntered` for one-shot entrance transitions.
 */
export function useVisibleAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseVisibleAnimationOptions = {}
) {
  const { threshold = 0.15, rootMargin = "0px", mode = "continuous" } = options;

  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const shouldAnimate = !useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const entering = entry.isIntersecting;

        if (mode === "once") {
          if (entering) {
            setIsVisible(true);
            setHasEntered(true);
            observer.unobserve(el);
          }
        } else {
          setIsVisible(entering);
          if (entering && !hasEntered) setHasEntered(true);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
    // hasEntered is intentionally excluded — we only read it inside the callback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold, rootMargin, mode]);

  return { ref, isVisible, hasEntered, shouldAnimate };
}
