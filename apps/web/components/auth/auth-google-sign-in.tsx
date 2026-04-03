"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { readErrorMessage } from "@/lib/http";

type AuthGoogleSignInProps = {
  onError: (msg: string) => void;
};

export function AuthGoogleSignIn({ onError }: AuthGoogleSignInProps) {
  const router = useRouter();

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
    <div className="flex w-full justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => onError("Google login was cancelled or failed.")}
        theme="outline"
        size="large"
        shape="pill"
        text="continue_with"
      />
    </div>
  );
}
