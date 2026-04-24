"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { readErrorMessage } from "@/lib/http";
import type { ToastTone } from "../ui/toast";

type ToastState = {
  message: string;
  tone: ToastTone;
};

type RegisterFormState = {
  name: string;
  email: string;
  password: string;
  error: string;
  loading: boolean;
  toast: ToastState | null;
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  closeToast: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  handleGoogleError: (message: string) => void;
};

function normalizeName(rawValue: string): string {
  return rawValue.trim().replace(/\s+/g, " ");
}

export function useRegisterForm(): RegisterFormState {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = normalizeName(name);
    if (normalizedName.length < 2) {
      setError("Full name must be at least 2 characters.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: normalizedName, email, password }),
      });

      if (!response.ok) {
        setError(await readErrorMessage(response, "Registration failed."));
        return;
      }

      setName(normalizedName);

      const confetti = (await import("canvas-confetti")).default;
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.55 } });
      await new Promise<void>((resolve) => setTimeout(resolve, 2200));

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Oops, something went wrong. Try again in a moment 🛠️");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleError(message: string) {
    setToast({ tone: "error", message });
  }

  return {
    name,
    email,
    password,
    error,
    loading,
    toast,
    setName,
    setEmail,
    setPassword,
    closeToast: () => setToast(null),
    handleSubmit,
    handleGoogleError,
  };
}
