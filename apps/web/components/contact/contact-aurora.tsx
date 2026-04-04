"use client";

import { useReducedMotion } from "../ui/use-reduced-motion";

/**
 * Three CSS-only aurora/nebula curtains that slowly drift.
 * Animation is disabled when the user prefers reduced motion.
 */
export function ContactAurora() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Aurora curtain 1 — deep purple (left) */}
      <div
        className={`absolute -left-[20%] -top-[20%] h-[140%] w-[900px] rounded-full opacity-55 [background:radial-gradient(ellipse_at_center,rgba(139,92,246,0.7)_0%,rgba(124,58,237,0.5)_30%,rgba(91,33,182,0.3)_60%,transparent_80%)] [filter:blur(120px)] ${
          reducedMotion ? "" : "aurora-1"
        }`}
      />

      {/* Aurora curtain 2 — teal/cyan (center) */}
      <div
        className={`absolute -top-[15%] left-[25%] h-[130%] w-[800px] rounded-full opacity-50 [background:radial-gradient(ellipse_at_center,rgba(6,182,212,0.65)_0%,rgba(20,184,166,0.45)_35%,rgba(45,212,191,0.25)_60%,transparent_85%)] [filter:blur(120px)] ${
          reducedMotion ? "" : "aurora-2"
        }`}
      />

      {/* Aurora curtain 3 — pink/magenta (right) */}
      <div
        className={`absolute -right-[25%] -top-[18%] h-[135%] w-[850px] rounded-full opacity-50 [background:radial-gradient(ellipse_at_center,rgba(236,72,153,0.65)_0%,rgba(219,39,119,0.45)_30%,rgba(168,85,247,0.3)_55%,transparent_80%)] [filter:blur(120px)] ${
          reducedMotion ? "" : "aurora-3"
        }`}
      />
    </div>
  );
}
