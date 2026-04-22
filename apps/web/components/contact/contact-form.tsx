"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STARBURST_EVENT } from "./contact-constellation";

const CONTACT_ERROR_MESSAGE =
  "We couldn't send your message right now. Please try again in a moment.";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    setSending(true);
    setError(null);
    window.dispatchEvent(new Event(STARBURST_EVENT));

    try {
      await submitContactForm(form);
      setSending(false);
      form.reset();
      setSubmitted(true);
    } catch {
      setSending(false);
      setError(CONTACT_ERROR_MESSAGE);
    }
  };

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-6 pb-8 pt-20">
      <div
        className="w-full max-w-[480px] rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-[20px] sm:p-10"
      >
        <AnimatePresence mode="wait">
          {submitted ? (
            <SuccessMessage key="success" onReset={() => setSubmitted(false)} />
          ) : (
            <FormContent
              key="form"
              error={error}
              sending={sending}
              onSubmit={handleSubmit}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- form ---------- */

function readFormField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function submitContactForm(form: HTMLFormElement): Promise<void> {
  const formData = new FormData(form);
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: readFormField(formData, "name"),
      email: readFormField(formData, "email"),
      message: readFormField(formData, "message"),
    }),
  });

  if (!response.ok) {
    throw new Error("Contact request failed");
  }
}

function FormContent({
  error, sending, onSubmit,
}: {
  error: string | null;
  sending: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="font-shantell text-[2rem] font-bold text-white">
        Contact Us
      </h1>
      <p className="mt-1 text-base text-white/60">
        Send us a signal across the universe
      </p>
      <p className="mt-1 mb-8 text-sm italic text-white/40">
        &ldquo;We&apos;re here to help you reach the stars. Let&apos;s talk.&rdquo;
      </p>

      <FieldGroup label="Your Name" id="name" type="text" placeholder="John Doe" />
      <FieldGroup label="Your Email" id="email" type="email" placeholder="you@example.com" />
      <FieldGroup label="Your Message" id="message" placeholder="Tell us what's on your mind..." textarea />

      {error ? (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-rose-300/25 bg-rose-500/15 px-4 py-3 text-sm font-medium text-rose-100"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={sending}
        className="btn-gradient-primary mt-2 flex w-full items-center justify-center gap-2 !rounded-full !py-4 text-base font-semibold shadow-[0_10px_30px_rgba(99,102,241,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_15px_40px_rgba(99,102,241,0.4)] disabled:pointer-events-none disabled:opacity-80"
      >
        <RocketIcon filled={sending} />
        <span>{sending ? "Launching..." : "Send Signal"}</span>
      </button>
    </motion.form>
  );
}

/* ---------- field ---------- */

function FieldGroup({
  label, id, type = "text", placeholder, textarea,
}: {
  label: string; id: string; type?: string; placeholder: string; textarea?: boolean;
}) {
  const inputClass =
    "w-full rounded-xl border border-white/[0.15] bg-white/[0.08] px-4 py-3.5 text-base text-white placeholder:text-white/[0.35] transition-all duration-300 focus:border-violet-500 focus:bg-white/[0.12] focus:outline-none focus:ring-4 focus:ring-violet-500/20";

  return (
    <div className="mb-5">
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-semibold uppercase tracking-[0.5px] text-white/70"
      >
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          name={id}
          required
          rows={5}
          placeholder={placeholder}
          className={`${inputClass} resize-y`}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          required
          placeholder={placeholder}
          className={inputClass}
        />
      )}
    </div>
  );
}

/* ---------- success ---------- */

function SuccessMessage({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="py-8 text-center"
    >
      <div className="mx-auto mb-4 text-6xl text-emerald-400 animate-pulse">
        <svg className="mx-auto h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white">Signal Received!</h2>
      <p className="mt-2 text-white/60">
        We&apos;ll get back to you across the cosmos.
      </p>
      <button
        onClick={onReset}
        className="mt-6 text-sm font-medium text-violet-300 transition-colors hover:text-violet-200"
      >
        Send another message
      </button>
    </motion.div>
  );
}

/* ---------- icon ---------- */

function RocketIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
      {filled ? (
        <path d="M12.17.438a6.001 6.001 0 0 0-4.816 3.032l-4.551.9A1.5 1.5 0 0 0 1.75 5.894l1.689 1.689-1.073 1.073a.5.5 0 0 0-.118.18l-.824 2.06a.5.5 0 0 0 .644.644l2.06-.824a.5.5 0 0 0 .18-.118L5.38 9.524l1.689 1.689a1.5 1.5 0 0 0 1.523.053l.9-4.551a6.001 6.001 0 0 0 3.032-4.816.498.498 0 0 0-.454-.454zM7.364 9.364L6.636 8.636l.707-.707.728.728-.707.707z" />
      ) : (
        <>
          <path d="M12.17.438a6.001 6.001 0 0 0-4.816 3.032l-4.551.9A1.5 1.5 0 0 0 1.75 5.894l1.689 1.689-1.073 1.073a.5.5 0 0 0-.118.18l-.824 2.06a.5.5 0 0 0 .644.644l2.06-.824a.5.5 0 0 0 .18-.118L5.38 9.524l1.689 1.689a1.5 1.5 0 0 0 1.523.053l.9-4.551a6.001 6.001 0 0 0 3.032-4.816.498.498 0 0 0-.454-.454z" />
          <path d="M5.205 10.787a7.632 7.632 0 0 0 1.804 1.352c-.127.202-.249.367-.366.479a2.607 2.607 0 0 1-2.829.525 2.607 2.607 0 0 1-.525-2.829c.112-.117.277-.239.479-.366a7.632 7.632 0 0 0 1.437 1.839z" />
        </>
      )}
    </svg>
  );
}
