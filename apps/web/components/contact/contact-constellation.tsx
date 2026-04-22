"use client";

import { useEffect, useRef, useCallback } from "react";
import { useReducedMotion } from "../ui/use-reduced-motion";

interface Star {
  x: number;
  y: number;
  z: number;
  radius: number;
  alpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  vx: number;
  vy: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

const STAR_COUNT_DESKTOP = 48;
const STAR_COUNT_MOBILE = 24;
const LINE_DISTANCE = 110;
const LINE_DISTANCE_SQ = LINE_DISTANCE * LINE_DISTANCE;
const FPS_CAP = 30;
const MAX_DPR = 1.5;
const BURST_DURATION = 90; // frames (~3s at 30fps)
const BURST_DRAG = 0.92;

function createStars(count: number, w: number, h: number): Star[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    z: Math.random() * 0.5 + 0.5,
    radius: Math.random() * 1.8 + 0.6,
    alpha: Math.random() * 0.5 + 0.5,
    twinkleSpeed: Math.random() * 0.02 + 0.005,
    twinkleOffset: Math.random() * Math.PI * 2,
    vx: 0,
    vy: 0,
  }));
}

function spawnShootingStar(w: number, h: number): ShootingStar {
  const angle = Math.random() * 0.4 + 0.3;
  const speed = Math.random() * 4 + 3;
  return {
    x: Math.random() * w * 0.8,
    y: -10,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 0,
    maxLife: 60 + Math.random() * 40,
  };
}

/** Custom event name: dispatched by contact-form on submit */
export const STARBURST_EVENT = "contact:starburst";

export function ContactConstellation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();
  const rafRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const shootingRef = useRef<ShootingStar[]>([]);
  const frameRef = useRef(0);
  const lastTimeRef = useRef(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const burstRef = useRef(0); // remaining burst frames (0 = inactive)

  const draw = useCallback(
    (now: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const interval = 1000 / FPS_CAP;
      if (now - lastTimeRef.current < interval) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }
      lastTimeRef.current = now;

      const w = canvas.width;
      const h = canvas.height;
      const frame = frameRef.current++;
      const stars = starsRef.current;
      const bursting = burstRef.current > 0;

      ctx.clearRect(0, 0, w, h);

      // --- Move stars during burst ---
      if (bursting) {
        burstRef.current--;
        for (const star of stars) {
          star.x += star.vx;
          star.y += star.vy;
          star.vx *= BURST_DRAG;
          star.vy *= BURST_DRAG;
        }
      }

      // --- Constellation lines ---
      ctx.lineWidth = 0.4;
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < LINE_DISTANCE_SQ) {
            const dist = Math.sqrt(distSq);
            const lineAlpha = (1 - dist / LINE_DISTANCE) * 0.15;
            ctx.strokeStyle = `rgba(139,92,246,${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.stroke();
          }
        }
      }

      // --- Draw & twinkle stars ---
      const sizeMultiplier = bursting ? 3 : 1;
      for (const star of stars) {
        const twinkle = Math.sin(frame * star.twinkleSpeed + star.twinkleOffset);
        const alpha = star.alpha * (0.6 + twinkle * 0.4);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * star.z * sizeMultiplier, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,210,255,${alpha})`;
        ctx.fill();
      }

      // --- Cursor glow ---
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      if (mx > 0 && my > 0) {
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, 100);
        grad.addColorStop(0, "rgba(139,92,246,0.08)");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(mx - 100, my - 100, 200, 200);
      }

      // --- Shooting stars ---
      if (Math.random() < 0.008 && shootingRef.current.length < 3) {
        shootingRef.current.push(spawnShootingStar(w, h));
      }
      shootingRef.current = shootingRef.current.filter((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.life++;
        const progress = s.life / s.maxLife;
        const alpha = progress < 0.1 ? progress * 10 : 1 - progress;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 6, s.y - s.vy * 6);
        ctx.strokeStyle = `rgba(200,210,255,${alpha * 0.6})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        return s.life < s.maxLife;
      });

      rafRef.current = requestAnimationFrame(draw);
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion) return;

    const resize = () => {
      const prevW = canvas.width;
      const prevH = canvas.height;
      const dpr = Math.min(window.devicePixelRatio, MAX_DPR);
      const newW = window.innerWidth * dpr;
      const newH = window.innerHeight * dpr;
      canvas.width = newW;
      canvas.height = newH;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);

      const count = window.innerWidth < 768 ? STAR_COUNT_MOBILE : STAR_COUNT_DESKTOP;
      if (starsRef.current.length === 0 || prevW === 0 || prevH === 0) {
        starsRef.current = createStars(count, window.innerWidth, window.innerHeight);
      } else {
        // Rescale existing stars to new dimensions instead of recreating
        const scaleX = window.innerWidth / (prevW / dpr);
        const scaleY = window.innerHeight / (prevH / dpr);
        for (const star of starsRef.current) {
          star.x *= scaleX;
          star.y *= scaleY;
        }
        // Adjust count if needed (e.g. mobile <-> desktop breakpoint)
        if (count > starsRef.current.length) {
          const extra = createStars(count - starsRef.current.length, window.innerWidth, window.innerHeight);
          starsRef.current.push(...extra);
        } else if (count < starsRef.current.length) {
          starsRef.current.length = count;
        }
      }
    };

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    const handleBurst = () => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      for (const star of starsRef.current) {
        const angle = Math.atan2(star.y - cy, star.x - cx);
        const speed = 15 + Math.random() * 20;
        star.vx = Math.cos(angle) * speed;
        star.vy = Math.sin(angle) * speed;
      }
      burstRef.current = BURST_DURATION;
    };

    resize();
    rafRef.current = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouse);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener(STARBURST_EVENT, handleBurst);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener(STARBURST_EVENT, handleBurst);
    };
  }, [reducedMotion, draw]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[1]"
    />
  );
}
