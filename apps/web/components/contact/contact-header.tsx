"use client";

import Link from "next/link";

export function ContactHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-[100] flex items-center justify-between px-6 py-4">
      <Link
        href="/"
        className="flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-violet-300"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back to Home</span>
      </Link>
    </header>
  );
}
