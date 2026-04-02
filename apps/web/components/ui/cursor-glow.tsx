"use client";

import { useEffect, useRef } from "react";

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let rafId: number | null = null;
    let targetX = -500;
    let targetY = -500;
    let currentX = -500;
    let currentY = -500;
    let lastMoveAt = 0;

    const stopAnimation = () => {
      if (rafId === null) return;
      cancelAnimationFrame(rafId);
      rafId = null;
    };

    const animate = (now: number) => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      glow.style.transform = `translate(${currentX}px, ${currentY}px)`;

      const settled = Math.abs(targetX - currentX) < 0.5 && Math.abs(targetY - currentY) < 0.5;
      const idle = now - lastMoveAt > 120;
      if (document.hidden || (settled && idle)) {
        rafId = null;
        return;
      }

      rafId = requestAnimationFrame(animate);
    };

    const ensureAnimation = () => {
      if (rafId !== null || document.hidden) return;
      rafId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX - 250;
      targetY = e.clientY - 250;
      lastMoveAt = performance.now();
      glow.style.opacity = "1";
      ensureAnimation();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        glow.style.opacity = "0";
        stopAnimation();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopAnimation();
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{
        width: 500,
        height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.1) 30%, transparent 70%)",
        filter: "blur(20px)",
        mixBlendMode: "normal",
        opacity: 0,
        transition: "opacity 0.3s ease",
      }}
    />
  );
}
