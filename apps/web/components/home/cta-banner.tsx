"use client";

import Link from "next/link";
import { useScrollReveal } from "./use-scroll-reveal";

export function HomeCtaBanner() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="bg-white py-20 dark:bg-slate-900">
      <div
        ref={ref}
        className={`mx-auto max-w-5xl px-4 transition-all duration-700 sm:px-6 lg:px-8 ${visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-6 scale-[0.97] opacity-0"}`}
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-purple-600 to-cyan-600 bg-[length:200%_200%] px-8 py-16 text-center shadow-2xl shadow-brand-500/25 transition-all duration-[3s] hover:bg-[position:100%_100%] sm:px-16">
          {/* Decorative blobs */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-40 w-[600px] -translate-x-1/2 bg-gradient-to-b from-white/[0.08] to-transparent"
          />

          <h2 className="relative text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            Готов ли си да организираш ученето си?
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-base text-white/70 sm:text-lg">
            Присъедини се безплатно и започни да добавяш курсове, модули и
            материали още днес.
          </p>
          <Link
            href="/register"
            className="group relative mt-8 inline-block overflow-hidden rounded-full bg-white px-8 py-4 text-base font-bold text-brand-700 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            <span className="relative z-10">Създай безплатен акаунт</span>
            <div className="absolute inset-0 -z-0 bg-gradient-to-r from-brand-50 to-cyan-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </Link>
        </div>
      </div>
    </section>
  );
}
