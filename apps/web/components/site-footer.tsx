"use client";

import Link from "next/link";

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-all hover:-translate-y-0.5 hover:text-brand-500"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        {children}
      </svg>
    </a>
  );
}

export function SiteFooter() {
  return (
    <footer className="py-12 px-8 border-t border-slate-100 bg-white mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <img
            src="/assets/v1/icons/mascot-logo.png"
            alt="Logo"
            className="w-8 h-8 object-contain"
          />
          <span className="home-ink-title text-xl">Study Hub</span>
        </div>

        <p className="text-slate-400 text-sm font-medium">
          &copy; {new Date().getFullYear()} Study Hub. Built with ❤️ for excellence.
        </p>

        <div className="flex items-center gap-4">
          <SocialLink href="https://facebook.com" label="Facebook">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </SocialLink>
          <SocialLink href="https://x.com" label="X / Twitter">
            <path d="M4 4l16 16M20 4L4 20" strokeLinecap="round" />
          </SocialLink>
          <SocialLink href="https://instagram.com" label="Instagram">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </SocialLink>
          <SocialLink href="https://linkedin.com" label="LinkedIn">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
            <circle cx="4" cy="4" r="2" />
          </SocialLink>
          <span className="ml-2 h-4 w-px bg-slate-200" />
          <Link
            href="/login"
            className="text-slate-500 hover:text-brand-500 font-semibold transition-colors text-sm"
          >
            Login
          </Link>
          <Link
            href="/contact"
            className="text-slate-500 hover:text-brand-500 font-semibold transition-colors text-sm"
          >
            Contact
          </Link>
          <Link
            href="/api-docs"
            className="text-slate-500 hover:text-brand-500 font-semibold transition-colors text-sm"
          >
            API Docs
          </Link>
          <Link
            href="/register"
            className="text-slate-500 hover:text-brand-500 font-semibold transition-colors text-sm"
          >
            Register
          </Link>
        </div>
      </div>
    </footer>
  );
}
