"use client";

import { V1Hero } from "../components/home/v1-hero";
import { HomeFeatures } from "../components/home/features";
import { HomeStats } from "../components/home/stats";
import { HomeFaq } from "../components/home/faq";
import { HomeCtaBanner } from "../components/home/cta-banner";
import { Navbar } from "../components/layout/Navbar";
import { CursorGlow } from "../components/ui/cursor-glow";
import { ScrollToTop } from "../components/ui/scroll-to-top";
import Link from "next/link";
import { motion } from "framer-motion";

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
            <HomeStats />
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

            <div className="flex items-center gap-6">
              <Link href="/login" className="text-slate-500 hover:text-brand-500 font-semibold transition-colors">
                Login
              </Link>
              <Link href="/register" className="text-slate-500 hover:text-brand-500 font-semibold transition-colors">
                Register
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
