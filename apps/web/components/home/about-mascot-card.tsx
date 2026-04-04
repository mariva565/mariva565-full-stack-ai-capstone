"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState, type MouseEvent } from "react";

type AboutMascotCardProps = {
  isInView: boolean;
};

const SHINE_SIZE = 288;
const SHINE_OFFSET = SHINE_SIZE / 2;

export function AboutMascotCard({ isInView }: AboutMascotCardProps) {
  const [hovered, setHovered] = useState(false);
  const [shinePosition, setShinePosition] = useState({
    x: 0,
    y: 0,
  });

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setShinePosition({
      x: event.clientX - rect.left - SHINE_OFFSET,
      y: event.clientY - rect.top - SHINE_OFFSET,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative flex justify-center [perspective:1000px]"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.25)_0%,rgba(129,140,248,0.15)_40%,transparent_70%)] opacity-60 blur-xl [animation:glowPulse_4s_infinite]" />

      <div className="pointer-events-none absolute inset-[-20px] z-0 rounded-[2.5rem] bg-indigo-500/10 blur-[20px] [transform:rotate(-6deg)_translateZ(-50px)]" />

      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={handleMouseMove}
        className="glossy-card group relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-white/50 bg-white/25 p-3 shadow-2xl backdrop-blur-xl transition-transform duration-500 [transform:rotate(-3deg)] [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]"
      >
        <motion.div
          animate={{
            opacity: hovered ? 1 : 0,
            x: shinePosition.x,
            y: shinePosition.y,
          }}
          transition={{
            opacity: { duration: 0.35, ease: "easeOut" },
            x: { duration: 0.16, ease: "linear" },
            y: { duration: 0.16, ease: "linear" },
          }}
          className="pointer-events-none absolute z-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.28)_0%,transparent_65%)] blur-xl"
        />

        <Image
          src="/assets/v1/about-mascot.png"
          alt="Study Hub Mascot"
          width={550}
          height={450}
          className="relative z-10 w-full rounded-[1.5rem] object-cover shadow-[0_20px_40px_rgba(0,0,0,0.1)]"
        />
      </div>
    </motion.div>
  );
}
