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
  return (
    <div className="relative flex min-h-[100svh] items-center justify-center overflow-x-hidden px-4 py-4 sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_54%,#fdf2f8_100%)] dark:bg-[linear-gradient(180deg,#0f172a_0%,#1e1b4b_52%,#111827_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-[12%] h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-500/20" />
        <div className="absolute left-[12%] bottom-[12%] h-56 w-56 rounded-full bg-cyan-200/25 blur-3xl dark:bg-cyan-500/15" />
        <div className="absolute -right-16 top-[18%] h-80 w-80 rounded-full bg-fuchsia-200/25 blur-3xl dark:bg-fuchsia-500/15" />
        <div className="absolute right-[10%] bottom-[10%] h-64 w-64 rounded-full bg-violet-200/20 blur-3xl dark:bg-violet-500/15" />
      </div>

      <AuthHeaderControls />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-[440px] rounded-[2.25rem] border border-white/60 bg-white/55 p-6 shadow-[0_20px_50px_-18px_rgba(15,23,42,0.2)] backdrop-blur-[20px] dark:border-white/10 dark:bg-slate-900/55 sm:p-7 lg:p-8"
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
