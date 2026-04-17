"use client";

import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "@/components/ui/use-reduced-motion";

export function NotFoundClient() {
  const prefersReduced = useReducedMotion();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 font-sans dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      
      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Background Blobs for Premium Glassmorphism */}
      <div 
        className={`absolute -left-[5%] top-[5%] h-[500px] w-[500px] rounded-full bg-brand-500/25 opacity-70 blur-[100px] z-0 ${
          !prefersReduced ? "animate-float" : ""
        }`}
      />
      <div 
        className={`absolute bottom-[10%] right-[5%] h-[600px] w-[600px] rounded-full bg-pink-500/20 opacity-70 blur-[120px] z-0 ${
          !prefersReduced ? "animate-float-delay" : ""
        }`}
      />
      <div 
        className={`absolute left-[40%] top-[30%] h-[300px] w-[300px] rounded-full bg-cyan-400/20 opacity-60 blur-[80px] z-0 ${
          !prefersReduced ? "animate-[float_8s_ease-in-out_infinite]" : ""
        }`}
      />

      {/* Floating Sparkles / Decorative Elements */}
      <div className={`absolute top-[20%] left-[25%] text-brand-400/60 dark:text-brand-400/40 ${!prefersReduced ? "animate-pulse" : ""}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><path d="M3 12h18"/></svg>
      </div>
      <div className={`absolute bottom-[30%] right-[25%] text-pink-400/60 dark:text-pink-400/40 ${!prefersReduced ? "animate-[pulseGlow_4s_ease-in-out_infinite]" : ""}`}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><path d="M3 12h18"/></svg>
      </div>

      {/* Content Card */}
      <div 
        className={`relative z-10 mx-auto w-[92%] max-w-[640px] overflow-hidden rounded-[2.5rem] border border-white/60 border-t-white/90 bg-white/70 p-12 text-center shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-2xl dark:border-white/10 dark:border-t-white/20 dark:bg-slate-800/60 dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] sm:p-16 ${
          !prefersReduced ? "animate-fade-in-up" : ""
        }`}
      >
        <div className="relative mx-auto mb-8 h-56 w-56">
          {/* Spotlight Effect Behind Mascot */}
          <div className="absolute left-1/2 top-1/2 -z-10 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/20 blur-[50px] dark:bg-brand-500/30"></div>

          <div
            className={`flex h-full w-full items-center justify-center ${!prefersReduced ? "animate-[float_4s_ease-in-out_infinite]" : ""}`}
          >
            <Image
              src="/assets/images/404-robot.png"
              alt="Premium Lost Robot Mascot"
              width={260}
              height={260}
              className="max-w-none mix-blend-darken dark:mix-blend-normal dark:opacity-90 [mask-image:radial-gradient(circle_closest-side,black_65%,transparent_100%)] [-webkit-mask-image:radial-gradient(circle_closest-side,black_65%,transparent_100%)]"
              priority
            />
          </div>
        </div>
        
        <h1 className="font-shantell mb-4 text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-brand-600 to-pink-500 drop-shadow-sm">
          Oops! Page Not Found
        </h1>
        
        <p className="mx-auto mb-10 max-w-md text-lg leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
          The page you're looking for seems to have drifted into another dimension. 
          Our robots are actively scanning the sector!
        </p>
        
        {/* Glowing Button Wrapper */}
        <div className="relative mx-auto inline-flex group">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-brand-500 to-pink-500 opacity-40 blur transition duration-500 group-hover:opacity-75"></div>
          
          <Link 
            href="/" 
            className="relative flex items-center justify-center gap-2 rounded-full bg-slate-900 px-8 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95 dark:bg-white dark:text-slate-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="transition-transform duration-300 group-hover:-translate-x-1">
              <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
