"use client";

import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "@/components/ui/use-reduced-motion";

type ServerErrorClientProps = {
  reset: () => void;
};

function BackgroundDecor({ prefersReduced }: { prefersReduced: boolean }) {
  const animationClass = prefersReduced ? "" : "animate-float";
  const delayedAnimationClass = prefersReduced ? "" : "animate-float-delay";

  return (
    <>
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className={`absolute -left-[8%] top-[4%] z-0 h-[420px] w-[420px] rounded-full bg-brand-500/20 blur-[110px] ${animationClass}`} />
      <div className={`absolute bottom-[5%] right-[4%] z-0 h-[520px] w-[520px] rounded-full bg-cyan-400/15 blur-[120px] ${delayedAnimationClass}`} />
      <div className={`absolute left-[45%] top-[18%] z-0 h-[260px] w-[260px] rounded-full bg-pink-400/15 blur-[90px] ${animationClass}`} />
    </>
  );
}

function ErrorIllustration({ prefersReduced }: { prefersReduced: boolean }) {
  const imageAnimationClass = prefersReduced
    ? ""
    : "animate-[float_7s_ease-in-out_infinite]";

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/50 p-3 shadow-[0_30px_60px_-25px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50">
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/10 to-transparent dark:from-white/10 dark:via-transparent dark:to-transparent" />
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" />
      <Image
        src="/assets/images/500-robot.webp"
        alt="StudyHub repair robot diagnosing an unexpected system issue"
        width={1200}
        height={800}
        priority
        unoptimized
        sizes="(min-width: 1280px) 680px, (min-width: 1024px) 52vw, 100vw"
        className={`relative z-10 h-auto w-full rounded-[1.5rem] object-cover ${imageAnimationClass}`}
      />
    </div>
  );
}

function ActionButtons({ reset }: ServerErrorClientProps) {
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
      <button
        type="button"
        onClick={reset}
        className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-brand-500 via-brand-600 to-pink-500 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(236,72,153,0.8)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_45px_-18px_rgba(59,130,246,0.85)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950"
      >
        Try Again
      </button>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-full border border-slate-300/80 bg-white/80 px-7 py-3.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 dark:border-white/15 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-brand-400/60 dark:hover:text-white"
      >
        Back to Home
      </Link>
    </div>
  );
}

export function ServerErrorClient({ reset }: ServerErrorClientProps) {
  const prefersReduced = useReducedMotion();
  const cardAnimationClass = prefersReduced ? "" : "animate-fade-in-up";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6">
      <BackgroundDecor prefersReduced={prefersReduced} />
      <div
        className={`relative z-10 w-full max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/70 border-t-white/90 bg-white/65 p-6 shadow-[0_35px_80px_-30px_rgba(15,23,42,0.45),inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-2xl dark:border-white/10 dark:border-t-white/20 dark:bg-slate-900/60 dark:shadow-[0_40px_90px_-30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-8 lg:p-10 ${cardAnimationClass}`}
      >
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
          <ErrorIllustration prefersReduced={prefersReduced} />
          <div className="text-center lg:text-left">
            <span className="inline-flex rounded-full border border-brand-200/70 bg-brand-50/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-brand-700 dark:border-brand-400/25 dark:bg-brand-500/10 dark:text-brand-200">
              Error 500
            </span>
            <h1 className="font-shantell mt-5 pb-1 text-4xl font-extrabold leading-[1.14] text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-cyan-500 to-pink-500 drop-shadow-sm sm:text-5xl">
              Our repair bot hit a temporary snag
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
              Something went wrong while loading this part of StudyHub. The issue
              may be temporary, so you can try again or head back home while the
              system settles down.
            </p>
            <div className="mt-8">
              <ActionButtons reset={reset} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
