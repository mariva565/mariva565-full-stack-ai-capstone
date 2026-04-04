"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRef, useState, type MouseEvent } from "react";

interface GlassCardProps {
  delay?: number;
  description: string;
  icon: string;
  title: string;
}

type TiltState = {
  rotateX: number;
  rotateY: number;
};

const INITIAL_TILT: TiltState = {
  rotateX: 0,
  rotateY: 0,
};

export function GlassCard({
  icon,
  title,
  description,
  delay = 0,
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState<TiltState>(INITIAL_TILT);

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    setTilt({
      rotateX: (mouseY - centerY) / 10,
      rotateY: (centerX - mouseX) / 10,
    });
  }

  function handleMouseLeave() {
    setTilt(INITIAL_TILT);
    setHovered(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="h-full [perspective:1000px]"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
          y: hovered ? -10 : 0,
        }}
        transition={{
          duration: 0.18,
          ease: "easeOut",
        }}
        className={`relative h-full overflow-hidden rounded-2xl border bg-white/70 p-10 backdrop-blur-[20px] [transform-style:preserve-3d] will-change-transform ${
          hovered
            ? "border-transparent shadow-[0_25px_50px_-12px_rgba(99,102,241,0.25)]"
            : "border-white/30 shadow-[0_8px_32px_rgba(31,38,135,0.1)]"
        }`}
      >
        <div
          className={`pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(135deg,#8b5cf6_0%,#ec4899_100%)] transition-opacity duration-500 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          className={`absolute left-0 right-0 top-0 z-20 h-1 origin-left rounded-t-2xl bg-[linear-gradient(90deg,#8b5cf6,#ec4899,#06b6d4)] transition-transform duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] ${
            hovered ? "scale-x-100" : "scale-x-0"
          }`}
        />

        <div
          className={`relative z-10 mb-6 h-[90px] w-[90px] transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] ${
            hovered
              ? "scale-[1.15] rotate-[5deg] [filter:drop-shadow(0_5px_15px_rgba(0,0,0,0.3))]"
              : "[filter:drop-shadow(0_2px_4px_rgba(0,0,0,0.1))]"
          }`}
        >
          <Image
            src={`/assets/v1/icons/${icon}`}
            alt={title}
            width={90}
            height={90}
            className="rounded-3xl"
          />
        </div>

        <div className="relative z-10">
          <h3
            className={`home-ink-title mb-3 text-xl transition-colors duration-500 ${
              hovered
                ? "[background-image:none] !text-white [-webkit-text-fill-color:#ffffff]"
                : ""
            }`}
          >
            {title}
          </h3>
          <p
            className={`leading-relaxed transition-colors duration-500 ${
              hovered ? "text-white/90" : "text-slate-500"
            }`}
          >
            {description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
