"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { readErrorMessage } from "@/lib/http";
import { motion } from "framer-motion";
import { useState } from "react";
import { GoogleIcon } from "./auth-icons";

type AuthGoogleSignInProps = {
  onError: (msg: string) => void;
  variant?: "default" | "login";
  compact?: boolean;
};

export function AuthGoogleSignIn({
  onError,
  variant = "default",
  compact = false,
}: AuthGoogleSignInProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isLoginVariant = variant === "login";

  async function handleSuccess(token: string, type: "id_token" | "access_token" = "id_token") {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, type }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "Google login failed."));
      }

      router.replace("/dashboard");
    } catch (err: any) {
      onError(err.message || "Something went wrong with Google sign-in.");
      setIsLoading(false);
    }
  }

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => handleSuccess(tokenResponse.access_token, "access_token"),
    onError: () => onError("Google login was cancelled or failed."),
  });

  return (
    <motion.button
      type="button"
      onClick={() => login()}
      disabled={isLoading}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.015, y: -1 }}
      whileTap={{ scale: 0.985 }}
      className={
        isLoginVariant
          ? `group relative flex w-full items-center justify-center overflow-hidden rounded-[1.25rem] border border-white/40 bg-white/40 text-sm font-bold text-slate-700 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-primary-400/50 hover:bg-white/60 hover:text-primary-700 hover:shadow-primary-500/20 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-primary-400/30 dark:hover:bg-white/10 dark:hover:text-primary-300 ${
              compact ? "gap-2.5 p-2.5" : "gap-3 p-3"
            }`
          : "group flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold transition-all duration-300 hover:border-primary-200 hover:bg-slate-50 hover:text-primary-600 hover:shadow-md dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-primary-500/30 dark:hover:bg-slate-800 dark:hover:text-primary-300"
      }
    >
      {/* Premium Shine Effect */}
      {isLoginVariant && (
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:animate-[shineSwipe_2s_infinite] group-hover:opacity-100" />
      )}

      <div className={`relative flex items-center ${compact ? "gap-2.5" : "gap-3"}`}>
        {isLoading ? (
          <div className={`${compact ? "h-[18px] w-[18px]" : "h-5 w-5"} animate-spin rounded-full border-2 border-primary-500 border-t-transparent`} />
        ) : (
          <GoogleIcon className={`${compact ? "h-[18px] w-[18px]" : "h-5 w-5"} transition-transform duration-300 group-hover:scale-110`} />
        )}
        <span className={`font-shantell tracking-tight ${compact ? "text-[0.97rem]" : ""}`}>
          {isLoading ? "Signing in..." : "Continue with Google"}
        </span>
      </div>

      {isLoginVariant && (
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_120%,rgba(139,92,246,0.15),transparent)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      )}
    </motion.button>
  );
}
