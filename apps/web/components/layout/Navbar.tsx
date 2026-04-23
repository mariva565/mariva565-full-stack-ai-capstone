"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

type NavbarProps = {
  isAuthenticated?: boolean;
};

export function Navbar({ isAuthenticated = false }: NavbarProps) {
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
          ? "border-slate-100 bg-white/95 shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-[20px] dark:border-white/10 dark:bg-slate-950/90 dark:shadow-[0_8px_28px_rgba(2,6,23,0.45)]"
          : "border-transparent bg-white/70 backdrop-blur-[20px] dark:bg-slate-950/60"
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
              priority
              className="relative z-10 object-contain animate-mascot-float drop-shadow-[0_2px_8px_rgba(99,102,241,0.2)] group-hover:scale-[1.15] group-hover:rotate-[-8deg] transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:drop-shadow-[0_6px_20px_rgba(99,102,241,0.35)] group-hover:brightness-110"
            />
            {/* Mascot glow on hover */}
            <div
              className="absolute inset-[-8px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms] z-[1] pointer-events-none bg-[radial-gradient(circle,rgba(99,102,241,0.25)_0%,rgba(129,140,248,0.15)_40%,transparent_70%)] blur-[12px]"
            />
          </div>
          <span
            className="bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] bg-clip-text text-[1.6rem] font-shantell font-bold text-transparent transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 dark:from-[#dccbff] dark:to-[#f4b4da]"
          >
            Study Hub
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden lg:flex items-center gap-2">
          <NavLink href="/#features">Features</NavLink>
          <NavLink href="/#about">About</NavLink>
          <NavLink href="/how-it-works">How It Works</NavLink>
          <NavLink href="/api-docs">API Docs</NavLink>
          <NavLink href="/#faq">FAQ</NavLink>
          <NavLink href="/contact">Contact</NavLink>

          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="btn-gradient-primary ml-3 !py-2.5 !px-6 text-sm shadow-lg"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="ml-3 rounded-full border-2 border-[#8b5cf6]/30 px-6 py-2 text-sm font-semibold text-[#8b5cf6] transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-1 hover:scale-105 hover:border-[#8b5cf6]/50 hover:bg-[#8b5cf6]/5 hover:shadow-[0_12px_20px_-5px_rgba(99,102,241,0.2)] dark:border-white/15 dark:text-[#dccbff] dark:hover:border-[#c4b5fd]/40 dark:hover:bg-white/5"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="btn-gradient-primary !py-2.5 !px-6 text-sm shadow-lg"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 lg:hidden"
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
            className="flex flex-col gap-1 border-t border-white/30 bg-white/80 px-4 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 lg:hidden"
          >
            <MobileNavLink href="/#features" onClick={() => setMenuOpen(false)}>Features</MobileNavLink>
            <MobileNavLink href="/#about" onClick={() => setMenuOpen(false)}>About</MobileNavLink>
            <MobileNavLink href="/how-it-works" onClick={() => setMenuOpen(false)}>How It Works</MobileNavLink>
            <MobileNavLink href="/api-docs" onClick={() => setMenuOpen(false)}>API Docs</MobileNavLink>
            <MobileNavLink href="/#faq" onClick={() => setMenuOpen(false)}>FAQ</MobileNavLink>
            <MobileNavLink href="/contact" onClick={() => setMenuOpen(false)}>Contact</MobileNavLink>
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="mt-2 btn-gradient-primary !py-2.5 !px-5 text-sm text-center"
              >
                Dashboard
              </Link>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full border-2 border-[#8b5cf6]/30 px-5 py-2.5 text-center text-sm font-semibold text-[#8b5cf6] transition-colors hover:bg-[#8b5cf6]/5 dark:border-white/15 dark:text-[#dccbff] dark:hover:bg-white/5"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="btn-gradient-primary !py-2.5 !px-5 text-sm text-center"
                >
                  Register
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  const className =
    "rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-200 dark:hover:bg-white/5 dark:hover:text-cyan-200";

  if (href.startsWith("/#")) {
    return (
      <a href={href} onClick={onClick} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={className}
    >
      {children}
    </Link>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const className =
    "rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-slate-500 transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-1 hover:scale-105 hover:border hover:border-primary-500/20 hover:bg-primary-50/50 hover:text-primary-600 hover:shadow-[0_12px_20px_-5px_rgba(99,102,241,0.2)] dark:text-slate-300 dark:hover:border-cyan-300/20 dark:hover:bg-white/5 dark:hover:text-cyan-200";

  if (href.startsWith("/#")) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={className}
    >
      {children}
    </Link>
  );
}
