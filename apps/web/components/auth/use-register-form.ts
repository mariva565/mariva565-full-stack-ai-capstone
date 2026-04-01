"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { readErrorMessage } from "@/lib/http";

type RegisterFormState = {
  name: string;
  email: string;
  password: string;
  error: string;
  loading: boolean;
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
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
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return {
    name,
    email,
    password,
    error,
    loading,
    setName,
    setEmail,
    setPassword,
    handleSubmit,
  };
}
