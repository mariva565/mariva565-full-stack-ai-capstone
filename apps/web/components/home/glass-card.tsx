"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRef, useCallback } from "react";

interface GlassCardProps {
  icon: string;
  title: string;
  description: string;
  delay?: number;
}

export function GlassCard({ icon, title, description, delay = 0 }: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const rotateX = (mouseY - centerY) / 10;
    const rotateY = (centerX - mouseX) / 10;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="h-full"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="feature-card group relative h-full p-10 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-lg hover:shadow-2xl hover:border-indigo-200"
        style={{
          transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Top gradient accent bar — scaleX(0) → scaleX(1) on hover */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-indigo-500 via-pink-500 to-cyan-500 origin-left scale-x-0 group-hover:scale-x-100 z-20"
          style={{ transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        />

        {/* Gradient overlay on hover (matching original ::before) */}
        <div
          className="absolute inset-0 z-0 opacity-0 group-hover:opacity-[0.07] pointer-events-none"
          style={{
            background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
            transition: "opacity 0.4s ease",
          }}
        />

        {/* Icon — 90×90, scale(1.15) rotate(5deg) + drop-shadow on hover */}
        <div
          className="feature-icon-hover relative z-10 mb-6 w-[90px] h-[90px] group-hover:scale-[1.15] group-hover:rotate-[5deg]"
          style={{
            transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.4s ease",
            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.1))",
          }}
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
          <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
          <p className="text-slate-500 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
