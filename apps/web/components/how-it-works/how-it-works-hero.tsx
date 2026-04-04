"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { useVisibleAnimation } from "../ui/use-visible-animation";
import { Hero3dScene } from "./hero-3d-scene";

function HeroStars() {
  const [stars, setStars] = useState<
    Array<{ id: number; left: number; top: number; size: number; op: number; dur: number }>
  >([]);

  useEffect(() => {
    setStars(
      [...Array(40)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2.5 + 1.5,
        op: Math.random() * 0.5 + 0.2,
        dur: Math.random() * 3 + 2,
      }))
    );
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.op,
            animation: `pulse ${s.dur}s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
          }}
        />
      ))}
    </div>
  );
}

export function HowItWorksHero() {
  const { ref, shouldAnimate, hasEntered } =
    useVisibleAnimation<HTMLElement>({ mode: "once", threshold: 0.15 });

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[60vh] flex-col justify-center overflow-clip px-4 py-24 lg:py-32"
      style={{
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(139, 92, 246, 0.9) 50%, rgba(6, 182, 212, 0.85) 100%)",
        backgroundColor: "#0f172a"
      }}
    >
      {/* Full-width background stars */}
      <HeroStars />

      <div className="container relative z-10 mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
        {/* Left — content */}
        <motion.div
          initial={shouldAnimate ? { opacity: 0, x: -40 } : false}
          animate={hasEntered ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center lg:text-left"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-5 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur-sm">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13a.5.5 0 0 1 0 1 .5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1 0-1 .5.5 0 0 1 0-1 .5.5 0 0 1-.46-.302l-.761-1.77a1.964 1.964 0 0 0-.453-.618A5.984 5.984 0 0 1 2 6zm6-5a5 5 0 0 0-3.479 8.592c.263.254.514.564.676.941L5.83 12h4.342l.632-1.467c.162-.377.413-.687.676-.941A5 5 0 0 0 8 1z" />
            </svg>
            Лесно като 1-2-3-4
          </span>

          <h1 className="mb-6 font-shantell text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-[3.5rem] [text-shadow:0_2px_4px_rgba(0,0,0,0.2)]">
            Как работи <br className="hidden max-md:block" />
            <span className="inline-block whitespace-nowrap bg-gradient-to-br from-white from-10% to-indigo-200 to-100% bg-clip-text pb-1 pr-2 text-transparent drop-shadow-[0_0_8px_rgba(199,210,254,0.6)] [-webkit-text-fill-color:transparent]">
              Study Hub
            </span>
            <span className="-ml-2">?</span>
          </h1>

          <p className="mx-auto max-w-xl text-lg font-medium leading-relaxed text-white/85 lg:mx-0 lg:text-xl [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]">
            От хаос до организирано учене само в 4 прости стъпки. Нека ти покажем как да трансформираш своето образователно пътешествие.
          </p>
        </motion.div>

        {/* Right — Three.js holographic mascot */}
        <motion.div
          initial={shouldAnimate ? { opacity: 0, scale: 0.85 } : false}
          animate={hasEntered ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
        >
          <Hero3dScene />
        </motion.div>
      </div>
    </section>
  );
}
