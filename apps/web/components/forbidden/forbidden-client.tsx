"use client";

import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "@/components/ui/use-reduced-motion";

export function ForbiddenClient() {
  const prefersReduced = useReducedMotion();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 font-sans dark:bg-slate-900">
      
      {/* Radial Background Accent */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.08)_0%,transparent_60%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.15)_0%,transparent_60%)]"></div>

      {/* Decorative Blur Elements */}
      <div 
        className={`absolute -left-[10%] -top-[10%] h-[300px] w-[300px] rounded-full bg-brand-500/20 opacity-50 blur-[80px] z-0 ${
          !prefersReduced ? "animate-float" : ""
        }`}
      />
      <div 
        className={`absolute bottom-[5%] right-[5%] h-[400px] w-[400px] rounded-full bg-rose-500/10 opacity-50 blur-[100px] z-0 ${
          !prefersReduced ? "animate-float-delay" : ""
        }`}
      />

      <div className="relative z-10 mx-auto w-[90%] max-w-[600px] text-center">
        {/* Robot Guard Container */}
        <div
          className={`mx-auto mb-8 h-64 w-64 [perspective:1000px] ${!prefersReduced ? "animate-[float_6s_ease-in-out_infinite]" : ""}`}
        >
          <Image 
            src="/assets/v1/robot-403.png" 
            alt="Robot Guard" 
            width={256} 
            height={256} 
            priority
            className={`h-full w-full rounded-full object-cover mix-blend-darken drop-shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:rotate-2 hover:scale-105 dark:mix-blend-normal dark:opacity-90 [mask-image:radial-gradient(circle_closest-side,black_70%,transparent_100%)] [-webkit-mask-image:radial-gradient(circle_closest-side,black_70%,transparent_100%)] ${!prefersReduced ? "animate-[pulseGlow_4s_infinite]" : ""}`}
          />
        </div>
        
        {/* Content Group (Animated) */}
        <div className={!prefersReduced ? "opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]" : ""}>
          <h1 className="mb-0 text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-brand-500 to-pink-500 drop-shadow-sm md:text-8xl">
            403
          </h1>
          <h2 className="mb-4 mt-2 text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Access Restricted
          </h2>
          <p className="mx-auto mb-10 max-w-md text-lg leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
            Sorry! The robot guard says you need <strong className="font-semibold text-brand-600 dark:text-brand-400">administrator privileges</strong> to view this area.
          </p>
          
          <Link 
            href="/" 
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-br from-brand-500 to-brand-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-brand-500/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-brand-500/40 hover:brightness-110 active:translate-y-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="transition-transform duration-300 group-hover:-translate-x-1">
              <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
            </svg>
            <span className="relative z-10 w-full text-center">Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
