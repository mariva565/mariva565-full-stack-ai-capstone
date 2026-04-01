"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { readErrorMessage } from "@/lib/http";
import type { ToastTone } from "../ui/toast";

type PlannedFeature = "google" | "password-reset";

type ToastState = {
  message: string;
  tone: ToastTone;
};

type LoginFormState = {
  email: string;
  password: string;
  error: string;
  loading: boolean;
  toast: ToastState | null;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  closeToast: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  handlePlannedFeatureClick: (feature: PlannedFeature) => void;
};

function buildPlannedFeatureMessage(feature: PlannedFeature): string {
  if (feature === "password-reset") {
    return "Password reset is postponed until the base JWT auth flow is fully stabilized.";
  }

  return "Google sign-in will be added after we wire provider callbacks and account linking on the new backend.";
}

export function useLoginForm(): LoginFormState {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setError(await readErrorMessage(response, "Login failed."));
        return;
      }

      router.replace("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handlePlannedFeatureClick(feature: PlannedFeature) {
    setToast({ tone: "info", message: buildPlannedFeatureMessage(feature) });
  }

  return {
    email,
    password,
    error,
    loading,
    toast,
    setEmail,
    setPassword,
    closeToast: () => setToast(null),
    handleSubmit,
    handlePlannedFeatureClick,
  };
}
