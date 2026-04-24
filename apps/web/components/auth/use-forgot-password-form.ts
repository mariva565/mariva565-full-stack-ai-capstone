"use client";

import type { FormEvent } from "react";
import { useState } from "react";

type ForgotPasswordState = {
  email: string;
  loading: boolean;
  submitted: boolean;
  networkError: string | null;
  setEmail: (value: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  clearNetworkError: () => void;
};

export function useForgotPasswordForm(): ForgotPasswordState {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setNetworkError(null);

    try {
      await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      // Always show confirmation regardless of what the API returns
      setSubmitted(true);
    } catch {
      setNetworkError("Oops, something went wrong. Check your connection and try again 🛠️");
    } finally {
      setLoading(false);
    }
  }

  return {
    email,
    loading,
    submitted,
    networkError,
    setEmail,
    handleSubmit,
    clearNetworkError: () => setNetworkError(null),
  };
}
