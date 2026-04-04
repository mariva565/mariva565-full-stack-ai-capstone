"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { readErrorMessage } from "@/lib/http";

type AuthGoogleSignInProps = {
  onError: (msg: string) => void;
  variant?: "default" | "login";
};

export function AuthGoogleSignIn({
  onError,
  variant = "default",
}: AuthGoogleSignInProps) {
  const router = useRouter();
  const isLoginVariant = variant === "login";

  async function handleSuccess(credentialResponse: CredentialResponse) {
    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (!response.ok) {
        onError(await readErrorMessage(response, "Google login failed."));
        return;
      }

      router.replace("/dashboard");
    } catch {
      onError("Something went wrong with Google sign-in.");
    }
  }

  return (
    <div
      className={
        isLoginVariant
          ? "rounded-[1.4rem] border border-slate-200/80 bg-white/70 p-2.5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.45)] backdrop-blur-md dark:border-white/10 dark:bg-slate-950/40"
          : "flex w-full justify-center"
      }
    >
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => onError("Google login was cancelled or failed.")}
        theme="outline"
        size="large"
        shape={isLoginVariant ? "rectangular" : "pill"}
        text="signin_with"
        logo_alignment="left"
        containerProps={{
          className: isLoginVariant
            ? "flex w-full justify-center"
            : "flex justify-center",
        }}
      />
    </div>
  );
}
