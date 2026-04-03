"use client";

import { useReducedMotion } from "../ui/use-reduced-motion";

/**
 * Three CSS-only aurora/nebula curtains that slowly drift.
 * Animation is disabled when the user prefers reduced motion.
 */
export function ContactAurora() {
  const reducedMotion = useReducedMotion();
  const animStyle = reducedMotion ? "none" : undefined;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Aurora curtain 1 — deep purple (left) */}
      <div
        className="absolute"
        style={{
          width: 900,
          height: "140%",
          top: "-20%",
          left: "-20%",
          background:
            "radial-gradient(ellipse at center, rgba(139,92,246,0.7) 0%, rgba(124,58,237,0.5) 30%, rgba(91,33,182,0.3) 60%, transparent 80%)",
          filter: "blur(120px)",
          opacity: 0.55,
          animation: animStyle ?? "aurora-drift-1 60s ease-in-out infinite",
        }}
      />

      {/* Aurora curtain 2 — teal/cyan (center) */}
      <div
        className="absolute"
        style={{
          width: 800,
          height: "130%",
          top: "-15%",
          left: "25%",
          background:
            "radial-gradient(ellipse at center, rgba(6,182,212,0.65) 0%, rgba(20,184,166,0.45) 35%, rgba(45,212,191,0.25) 60%, transparent 85%)",
          filter: "blur(120px)",
          opacity: 0.5,
          animation: animStyle ?? "aurora-drift-2 70s ease-in-out infinite",
          animationDelay: "-20s",
        }}
      />

      {/* Aurora curtain 3 — pink/magenta (right) */}
      <div
        className="absolute"
        style={{
          width: 850,
          height: "135%",
          top: "-18%",
          right: "-25%",
          background:
            "radial-gradient(ellipse at center, rgba(236,72,153,0.65) 0%, rgba(219,39,119,0.45) 30%, rgba(168,85,247,0.3) 55%, transparent 80%)",
          filter: "blur(120px)",
          opacity: 0.5,
          animation: animStyle ?? "aurora-drift-3 65s ease-in-out infinite",
          animationDelay: "-35s",
        }}
      />
    </div>
  );
}
