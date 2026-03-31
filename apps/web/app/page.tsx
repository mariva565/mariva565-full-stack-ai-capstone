"use client";

import { V1Hero } from "../components/home/v1-hero";
import { HomeFeatures } from "../components/home/features";
import { HomeAbout } from "../components/home/about";
// import { HomeStats } from "../components/home/stats"; // Moved to README for jury, will add back later
import { HomeFaq } from "../components/home/faq";
import { HomeCtaBanner } from "../components/home/cta-banner";
import { Navbar } from "../components/layout/Navbar";
import { CursorGlow } from "../components/ui/cursor-glow";
import { ScrollToTop } from "../components/ui/scroll-to-top";
import Link from "next/link";
import { motion } from "framer-motion";

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-purple-50 flex flex-col p-4 md:p-8 selection:bg-brand-100 selection:text-brand-900 overflow-x-hidden transition-colors duration-500">
      {/* App-Wrapper (Rounded Box Container) */}
      <main className="flex-1 bg-white rounded-[2.5rem] md:rounded-[4rem] shadow-2xl overflow-hidden relative border border-white/60 flex flex-col">
        <CursorGlow />
        <ScrollToTop />
        
        {/* Content Layers with Breathable Padding */}
        <div className="relative z-10 flex flex-col w-full">
          <Navbar />
          <V1Hero />
          
          <div className="bg-white">
            <HomeFeatures />
            <HomeAbout />
            {/* <HomeStats /> */}
            <HomeFaq />
            <HomeCtaBanner />
          </div>
        </div>

        {/* Flat White Footer Inside Wrapper */}
        <footer className="py-12 px-8 border-t border-slate-100 bg-white mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
               <img src="/assets/v1/icons/mascot-logo.png" alt="Logo" className="w-8 h-8 object-contain" />
               <span className="font-shantell font-bold text-slate-800 text-xl">Study Hub</span>
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
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
                <circle cx="4" cy="4" r="2" />
              </SocialLink>
              <span className="ml-2 h-4 w-px bg-slate-200" />
              <Link href="/login" className="text-slate-500 hover:text-brand-500 font-semibold transition-colors text-sm">
                Login
              </Link>
              <Link href="/register" className="text-slate-500 hover:text-brand-500 font-semibold transition-colors text-sm">
                Register
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
