"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Magnetic } from "../ui/magnetic";

export function HomeHero() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-[#0f0a2e]">
      {/* Layered gradient background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.35),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_60%,rgba(6,182,212,0.18),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_20%_80%,rgba(139,92,246,0.2),transparent)]" />
      </div>

      {/* Animated floating orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float absolute -left-32 top-20 h-72 w-72 rounded-full bg-brand-600/20 blur-[100px]" />
        <div className="animate-float-delay absolute -right-24 top-1/3 h-56 w-56 rounded-full bg-cyan-500/15 blur-[80px]" />
        <div className="animate-pulse-glow absolute bottom-32 left-1/2 h-40 w-[500px] -translate-x-1/2 rounded-full bg-purple-500/10 blur-[60px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        aria-hidden="true"
        className="hero-grid-pattern pointer-events-none absolute inset-0 opacity-[0.03]"
      />

      {/* Sticky nav */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0f0a2e]/80 shadow-lg shadow-black/20 backdrop-blur-xl" : ""}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-cyan-400 text-sm font-black">
              S
            </span>
            Study<span className="bg-gradient-to-r from-brand-300 to-cyan-400 bg-clip-text text-transparent">Hub</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-white/70 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:text-white"
            >
              Вход
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-gradient-to-r from-brand-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-brand-500/40"
            >
              Регистрация
            </Link>
          </div>
        </div>
      </header>

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 pb-40 pt-20 text-center sm:px-6 sm:pt-28 lg:px-8 lg:pt-36">
        <span className="animate-fade-in-up mb-8 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-200/80 backdrop-blur-md">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
          Безплатно · Личен · Организиран
        </span>

        <h1 className="animate-fade-in-up text-[2.5rem] font-extrabold leading-[1.08] tracking-tight text-white [animation-delay:150ms] sm:text-6xl lg:text-7xl">
          Твоят личен
          <br />
          <span className="bg-gradient-to-r from-brand-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent [-webkit-background-clip:text]">
            учебен бележник
          </span>
        </h1>

        <p className="animate-fade-in-up mt-7 max-w-2xl text-base leading-relaxed text-indigo-200/50 [animation-delay:300ms] sm:text-lg lg:text-xl">
          Събери курсове, модули и материали на едно място. Добавяй бележки,
          файлове и връзки — всичко с тагове и бързо търсене.
        </p>

        <div className="animate-fade-in-up mt-12 flex flex-col items-center gap-4 [animation-delay:450ms] sm:flex-row">
          <Magnetic strength={0.2}>
            <Link
              href="/register"
              className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-brand-500 via-purple-500 to-cyan-500 bg-[length:200%_200%] px-9 py-4 text-base font-bold text-white shadow-2xl shadow-brand-500/30 transition-all duration-500 hover:bg-[position:100%_100%] hover:-translate-y-1 hover:shadow-brand-400/40 sm:w-auto"
            >
              <span className="relative z-10">Започни безплатно</span>
              <div className="absolute inset-0 -z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </Link>
          </Magnetic>
          
          <Magnetic strength={0.15}>
            <Link
              href="/login"
              className="w-full rounded-full border-2 border-white/10 bg-white/[0.03] px-9 py-4 text-base font-semibold text-white/80 backdrop-blur-md transition-all duration-300 hover:border-white/25 hover:bg-white/[0.08] hover:text-white hover:-translate-y-1 sm:w-auto"
            >
              Влез в профила си
            </Link>
          </Magnetic>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 200" preserveAspectRatio="none" className="block h-20 w-full sm:h-28 lg:h-36">
          <path fill="rgb(248 250 252)" fillOpacity="0.3" d="M0,128L48,122.7C96,117,192,107,288,112C384,117,480,139,576,144C672,149,768,139,864,122.7C960,107,1056,85,1152,90.7C1248,96,1344,128,1392,144L1440,160L1440,200L0,200Z" />
          <path fill="rgb(248 250 252)" fillOpacity="0.6" d="M0,160L48,154.7C96,149,192,139,288,144C384,149,480,171,576,176C672,181,768,171,864,154.7C960,139,1056,117,1152,122.7C1248,128,1344,160,1392,176L1440,192L1440,200L0,200Z" />
          <path className="fill-slate-50 dark:fill-slate-900" d="M0,176L48,170.7C96,165,192,155,288,160C384,165,480,187,576,192C672,197,768,187,864,176C960,165,1056,155,1152,160C1248,165,1344,187,1392,197.3L1440,200L1440,200L0,200Z" />
        </svg>
      </div>
    </section>
  );
}
