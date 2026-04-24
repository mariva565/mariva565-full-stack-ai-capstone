"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { AuthHeaderControls } from "./auth-header-controls";
import { AuthCardMascot, AuthFloatingMascot } from "./auth-mascot";

interface AuthLayoutProps {
  children: ReactNode;
  variant?: "login" | "register";
}

export function AuthLayout({ children, variant = "login" }: AuthLayoutProps) {
  const isRegister = variant === "register";

  return (
    <div
      className={`relative flex min-h-[100svh] items-center justify-center overflow-x-hidden px-4 ${
        isRegister ? "py-1.5 sm:py-2" : "py-2 sm:py-3"
      } sm:px-6`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-[440px] bg-[linear-gradient(180deg,rgba(224,231,255,0.92)_0%,rgba(255,255,255,0.55)_55%,rgba(255,255,255,0)_100%)] dark:hidden" />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-fuchsia-200/45 blur-3xl dark:hidden" />
        <div className="absolute -right-16 top-16 h-80 w-80 rounded-full bg-cyan-200/55 blur-3xl dark:hidden" />
        <div className="absolute left-[12%] bottom-[12%] h-56 w-56 rounded-full bg-indigo-200/25 blur-3xl dark:hidden" />
        <div className="absolute right-[10%] bottom-[10%] h-64 w-64 rounded-full bg-violet-200/20 blur-3xl dark:hidden" />

        <div className="absolute inset-0 hidden bg-[linear-gradient(180deg,rgba(2,6,23,0.98)_0%,rgba(2,8,23,1)_100%)] dark:block" />
        <div className="absolute -left-28 top-24 hidden h-80 w-80 rounded-full bg-brand-500/10 blur-3xl dark:block" />
        <div className="absolute -right-24 top-12 hidden h-[26rem] w-[26rem] rounded-full bg-cyan-500/10 blur-3xl dark:block" />
        <div className="absolute inset-x-10 top-4 hidden h-px bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent dark:block" />
      </div>

      <AuthHeaderControls />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`relative w-full overflow-y-auto border border-white/60 bg-white/55 shadow-[0_20px_50px_-18px_rgba(15,23,42,0.2)] backdrop-blur-[20px] dark:border-white/10 dark:bg-slate-900/55 ${
          isRegister
            ? "max-w-[420px] rounded-[2rem] p-5 sm:p-7"
            : "max-w-[440px] rounded-[2.25rem] p-6 sm:p-7 lg:p-8"
        }`}
      >
        <AuthCardMascot variant={variant} />

        <div className="relative z-10">{children}</div>
      </motion.div>

      <div className="hidden lg:block">
        <AuthFloatingMascot variant={variant} placement="desktop" />
      </div>
    </div>
  );
}
