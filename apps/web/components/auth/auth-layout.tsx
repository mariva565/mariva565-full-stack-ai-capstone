"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  variant?: "login" | "register";
}

export function AuthLayout({ children, variant = "login" }: AuthLayoutProps) {
  const isRegister = variant === "register";
  const glowColor = isRegister
    ? "rgba(236, 72, 153, 0.15)"
    : "rgba(99, 102, 241, 0.15)";
  const glowHover = isRegister
    ? "0 15px 35px rgba(236, 72, 153, 0.25)"
    : "0 15px 35px rgba(99, 102, 241, 0.25)";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Animated mesh gradient background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 30%, rgba(99, 102, 241, 0.25), transparent),
            radial-gradient(ellipse 70% 50% at 80% 70%, rgba(165, 180, 252, 0.2), transparent),
            linear-gradient(180deg, #f8fafc 0%, #eef2ff 50%, #f5f3ff 100%)
          `,
          backgroundSize: "200% 200%",
          animation: "meshGradient 20s ease infinite",
        }}
      />

      {/* Dark mode background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 hidden dark:block"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 30%, rgba(49, 46, 129, 0.4), transparent),
            radial-gradient(ellipse 70% 50% at 80% 70%, rgba(30, 27, 75, 0.3), transparent),
            linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)
          `,
          backgroundSize: "200% 200%",
          animation: "meshGradient 20s ease infinite",
        }}
      />

      {/* Glassmorphism auth card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-[480px] rounded-[2.5rem] p-8 sm:p-10"
        style={{
          background: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Dark mode card override */}
        <div
          className="pointer-events-none absolute inset-0 hidden rounded-[2.5rem] dark:block"
          style={{
            background: "rgba(15, 23, 42, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        />

        {/* Mascot logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative z-10 mx-auto mb-6 flex justify-center"
        >
          <div
            className="group relative overflow-hidden rounded-3xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
            style={{
              width: 130,
              height: 130,
              border: "4px solid rgba(255, 255, 255, 0.8)",
              boxShadow: `0 15px 35px ${glowColor}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = glowHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `0 15px 35px ${glowColor}`;
            }}
          >
            <Image
              src="/assets/v1/mascot-transparent-background.png"
              alt="StudyHub Mascot"
              width={130}
              height={130}
              className="object-cover"
              priority
            />
          </div>
        </motion.div>

        {/* Form content */}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>

      {/* Floating mascot bottom-right (desktop only) */}
      <div className="pointer-events-none fixed bottom-5 right-5 z-50 hidden lg:block">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="relative"
        >
          {/* Speech bubble */}
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -15 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{
              duration: 0.7,
              delay: 1.2,
              type: "spring",
              stiffness: 150,
            }}
            className="absolute -top-[75px] right-[100px] z-10 max-w-[220px] min-w-[160px] rounded-[50px_50px_50px_10px] px-7 py-4 text-center"
            style={{
              background: "linear-gradient(135deg, #fef3c7, #fce7f3, #e0e7ff)",
              border: "3px solid #6366f1",
              boxShadow: "5px 5px 0px #ec4899, inset 0 2px 4px rgba(255,255,255,0.6)",
              animation: "wiggle 3s ease-in-out infinite",
            }}
          >
            <p
              className="font-shantell text-lg font-extrabold leading-snug"
              style={{
                background: "linear-gradient(135deg, #6366f1, #ec4899)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Здравей! 👋
              <br />
              Приятно учене!
            </p>
            <span className="absolute -top-2 right-4 animate-bounce text-lg">✨</span>
          </motion.div>

          {/* Floating mascot image */}
          <div
            className="overflow-hidden rounded-3xl"
            style={{
              width: 130,
              height: 130,
              border: "3px solid rgba(255, 255, 255, 0.3)",
              backdropFilter: "blur(12px)",
              boxShadow: `0 0 30px ${glowColor}, 0 10px 30px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.4)`,
              animation: "authFloat 3s ease-in-out infinite",
            }}
          >
            <Image
              src="/assets/v1/mascot-transparent-background.png"
              alt="StudyHub Mascot"
              width={130}
              height={130}
              className="object-cover"
            />
          </div>

          {/* Glow under mascot */}
          <div
            className="absolute -bottom-3 left-1/2 -z-10 h-8 w-24 -translate-x-1/2 rounded-full"
            style={{
              background: "radial-gradient(ellipse, rgba(6, 182, 212, 0.6), transparent 70%)",
              animation: "authPulse 2s ease-in-out infinite",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
