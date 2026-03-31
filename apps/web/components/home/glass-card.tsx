"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRef, useCallback, useState } from "react";

interface GlassCardProps {
  icon: string;
  title: string;
  description: string;
  delay?: number;
}

export function GlassCard({ icon, title, description, delay = 0 }: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

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
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
  }, []);

  const handleMouseEnter = useCallback(() => setHovered(true), []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";
    setHovered(false);
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
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative h-full rounded-2xl overflow-hidden"
        style={{
          padding: "2.5rem",
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: hovered
            ? "0 25px 50px -12px rgba(99, 102, 241, 0.25)"
            : "0 8px 32px rgba(31, 38, 135, 0.1)",
          borderColor: hovered ? "transparent" : "rgba(255, 255, 255, 0.3)",
          transition: "transform 0.1s ease-out, box-shadow 0.3s ease, border-color 0.3s ease",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {/* Gradient overlay — opacity 0 → 1 on hover (the key effect!) */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        />

        {/* Top gradient accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl z-20"
          style={{
            background: "linear-gradient(90deg, #8b5cf6, #ec4899, #06b6d4)",
            transform: hovered ? "scaleX(1)" : "scaleX(0)",
            transformOrigin: "left",
            transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />

        {/* Icon — scale(1.15) rotate(5deg) + heavy drop-shadow on hover */}
        <div
          className="relative z-10 mb-6"
          style={{
            width: 90,
            height: 90,
            transform: hovered ? "scale(1.15) rotate(5deg)" : "scale(1) rotate(0deg)",
            filter: hovered
              ? "drop-shadow(0 5px 15px rgba(0, 0, 0, 0.3))"
              : "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
            transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.4s ease",
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

        {/* Text — turns white on hover */}
        <div className="relative z-10">
          <h3
            className="text-xl font-bold mb-3"
            style={{
              color: hovered ? "#ffffff" : "#1e293b",
              transition: "color 0.4s ease",
            }}
          >
            {title}
          </h3>
          <p
            className="leading-relaxed"
            style={{
              color: hovered ? "rgba(255,255,255,0.9)" : "#64748b",
              transition: "color 0.4s ease",
            }}
          >
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
