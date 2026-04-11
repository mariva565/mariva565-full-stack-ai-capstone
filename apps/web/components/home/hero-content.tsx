"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function HeroContent() {
  return (
    <div className="flex-1 text-center lg:text-left space-y-8 hero-content">
      {/* Version Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold shadow-xl">
          <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
          v2.0 — Reimagined from Scratch
        </span>
      </motion.div>

      {/* Main Title (white text on dark gradient, matching original) */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-5xl lg:text-7xl font-extrabold font-shantell text-white leading-[1.1] relative z-10 drop-shadow-[2px_2px_10px_rgba(0,0,0,0.3)]"
      >
        Master Your <br />
        <span className="block pb-3 bg-gradient-to-r from-white via-cyan-300 to-white bg-clip-text text-transparent [-webkit-background-clip:text] drop-shadow-xl">Learning</span>
        <span className="block pb-2 bg-gradient-to-r from-white via-cyan-300 to-white bg-clip-text text-transparent [-webkit-background-clip:text] drop-shadow-xl">Journey</span>
      </motion.h1>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="max-w-xl text-lg text-white/60 font-medium leading-relaxed mx-auto lg:mx-0 hero-text drop-shadow-[1px_1px_5px_rgba(0,0,0,0.2)]"
      >
        Study Hub is the ultimate platform for students and educators.
        Organize courses, manage modules, and access your materials anytime, anywhere.
      </motion.p>

      {/* CTA Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start hero-actions"
      >
        <Link
          href="/dashboard"
          className="btn-gradient-primary group"
        >
          <i className="bi bi-journal-bookmark-fill group-hover:rotate-12 transition-transform"></i>
          Open Dashboard
        </Link>

        <Link
          href="/how-it-works"
          className="btn-explore-features"
        >
          <span className="relative z-10">See How It Works</span>
        </Link>
      </motion.div>
    </div>
  );
}
