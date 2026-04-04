"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState, type MouseEvent } from "react";

type AboutBenefitCardProps = {
  delay: number;
  floatDelay: number;
  icon: string;
  isInView: boolean;
  sub: string;
  title: string;
};

const SPOTLIGHT_SIZE = 800;
const SPOTLIGHT_OFFSET = SPOTLIGHT_SIZE / 2;

export function AboutBenefitCard({
  delay,
  floatDelay,
  icon,
  isInView,
  sub,
  title,
}: AboutBenefitCardProps) {
  const [hovered, setHovered] = useState(false);
  const [spotlight, setSpotlight] = useState({
    x: -SPOTLIGHT_OFFSET,
    y: -SPOTLIGHT_OFFSET,
  });

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setSpotlight({
      x: event.clientX - rect.left - SPOTLIGHT_OFFSET,
      y: event.clientY - rect.top - SPOTLIGHT_OFFSET,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={handleMouseMove}
        className="group relative flex h-full items-center gap-3 overflow-hidden rounded-2xl border border-white/60 bg-white/60 p-4 shadow-none backdrop-blur-xl transition-all duration-300 [isolation:isolate] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-[5px] hover:border-brand-300/40 hover:bg-white/85 hover:shadow-[0_15px_35px_rgba(99,102,241,0.12)]"
      >
        <motion.div
          animate={{
            opacity: hovered ? 1 : 0,
            x: spotlight.x,
            y: spotlight.y,
          }}
          transition={{
            opacity: { duration: 0.3, ease: "easeOut" },
            x: { duration: 0.12, ease: "linear" },
            y: { duration: 0.12, ease: "linear" },
          }}
          className="pointer-events-none absolute z-0 h-[800px] w-[800px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.15),transparent_40%)]"
        />

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{
            delay: floatDelay,
            duration: 3,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
          }}
          className="relative z-10 shrink-0"
        >
          <div className="feature-icon-transition flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.92),rgba(237,241,255,0.7)_68%,rgba(219,227,255,0.55))] shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_10px_22px_rgba(99,102,241,0.12)] group-hover:scale-110">
            <div className="feature-icon-transition h-16 w-16 mix-blend-multiply [filter:contrast(1.08)_saturate(1.08)_drop-shadow(0_8px_16px_rgba(99,102,241,0.16))] group-hover:scale-[1.15] group-hover:rotate-[5deg] group-hover:[filter:contrast(1.08)_saturate(1.08)_drop-shadow(0_8px_12px_rgba(99,102,241,0.2))]">
              <Image
                src={`/assets/v1/icons/${icon}`}
                alt={title}
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
          </div>
        </motion.div>

        <div className="relative z-10">
          <p className="home-ink-title text-sm">{title}</p>
          <p className="text-xs text-slate-400">{sub}</p>
        </div>
      </div>
    </motion.div>
  );
}
