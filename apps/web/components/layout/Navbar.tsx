"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
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
        <button
          className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-white/30 bg-white/80 backdrop-blur-xl px-4 py-4 flex flex-col gap-1"
          >
            <MobileNavLink href="#features" onClick={() => setMenuOpen(false)}>Features</MobileNavLink>
            <MobileNavLink href="#about" onClick={() => setMenuOpen(false)}>About</MobileNavLink>
            <MobileNavLink href="/calendar" onClick={() => setMenuOpen(false)}>Calendar</MobileNavLink>
            <MobileNavLink href="/progress" onClick={() => setMenuOpen(false)}>Progress</MobileNavLink>
            <MobileNavLink href="/contact" onClick={() => setMenuOpen(false)}>Contact</MobileNavLink>
            <div className="mt-2 flex flex-col gap-2">
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="rounded-full border-2 border-[#8b5cf6]/30 px-5 py-2.5 text-center text-sm font-semibold text-[#8b5cf6] transition-colors hover:bg-[#8b5cf6]/5"
              >
                Profile
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="btn-gradient-primary !py-2.5 !px-5 text-sm text-center"
              >
                Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
    >
      {children}
    </Link>
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
