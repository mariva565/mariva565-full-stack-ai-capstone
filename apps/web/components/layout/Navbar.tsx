"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 border-b ${
        isScrolled
          ? "bg-white/70 backdrop-blur-[20px] border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.1)]"
          : "bg-white/70 backdrop-blur-[20px] border-white/30"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group py-1">
          <div className="relative w-[80px] h-[80px] overflow-visible flex-shrink-0">
            <Image
              src="/assets/v1/icons/mascot-logo.png"
              alt="StudyHub Logo"
              width={75}
              height={75}
              className="relative z-10 object-contain animate-mascot-float drop-shadow-[0_2px_8px_rgba(99,102,241,0.2)] group-hover:scale-[1.15] group-hover:rotate-[-8deg] transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:drop-shadow-[0_6px_20px_rgba(99,102,241,0.35)] group-hover:brightness-110"
            />
            {/* Mascot glow on hover */}
            <div
              className="absolute inset-[-8px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms] z-[1] pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(129,140,248,0.15) 40%, transparent 70%)",
                filter: "blur(12px)",
              }}
            />
          </div>
          <span
            className="text-[1.6rem] font-shantell font-bold transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Study Hub
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden lg:flex items-center gap-2">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#about">About</NavLink>
          <NavLink href="/calendar">Calendar</NavLink>
          <NavLink href="/progress">Progress</NavLink>

          <Link
            href="/contact"
            className="ml-3 btn btn-outline-primary rounded-full px-6 py-2 text-sm font-semibold border-2 border-[#8b5cf6]/30 text-[#8b5cf6] hover:bg-[#8b5cf6]/5 hover:-translate-y-1 hover:scale-105 hover:border-[#8b5cf6]/50 hover:shadow-[0_12px_20px_-5px_rgba(99,102,241,0.2)] transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
          >
            Contact
          </Link>

          <Link
            href="/profile"
            className="flex items-center gap-2 btn btn-outline-primary rounded-full px-6 py-2 text-sm font-semibold border-2 border-[#8b5cf6]/30 text-[#8b5cf6] hover:bg-[#8b5cf6]/5 hover:-translate-y-1 hover:scale-105 hover:border-[#8b5cf6]/50 hover:shadow-[0_12px_20px_-5px_rgba(99,102,241,0.2)] transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
          >
            <i className="bi bi-person-fill"></i>
            Profile
          </Link>

          <Link
            href="/dashboard"
            className="btn-gradient-primary !py-2.5 !px-6 text-sm shadow-lg"
          >
            <i className="bi bi-grid-fill"></i>
            Dashboard
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden text-slate-600">
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-slate-500 hover:text-primary-600 font-semibold px-4 py-2 rounded-full hover:bg-primary-50/50 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_12px_20px_-5px_rgba(99,102,241,0.2)] hover:border hover:border-primary-500/20 border border-transparent transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] text-sm"
    >
      {children}
    </Link>
  );
}
