"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef, useCallback } from "react";

export function HomeCtaBanner() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const btnRef = useRef<HTMLAnchorElement>(null);

  const handleBtnMouseMove = useCallback((e: React.MouseEvent) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.05)`;
  }, []);

  const handleBtnMouseLeave = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;
    btn.style.transform = "translate(0, 0) scale(1)";
  }, []);

  return (
    <section ref={sectionRef} className="bg-white py-20 dark:bg-slate-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8"
      >
        <div
          className="relative overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16"
          style={{
            background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
          }}
        >
          {/* Decorative elements */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-3xl"
          />

          <div className="relative z-10">
            <h2 className="font-shantell text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
              Ready to transform your study habits?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-white/75 sm:text-lg">
              Join thousands of students using Study Hub today.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {/* Gradient pill button with magnetic hover */}
              <Link
                ref={btnRef}
                href="/register"
                onMouseMove={handleBtnMouseMove}
                onMouseLeave={handleBtnMouseLeave}
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
                  backgroundSize: "200% 200%",
                  boxShadow: "0 10px 30px rgba(99, 102, 241, 0.4)",
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                </svg>
                Create Free Account
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-8 py-4 text-base font-semibold text-white shadow-[0_10px_30px_rgba(15,23,42,0.18)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/16 hover:shadow-[0_14px_36px_rgba(15,23,42,0.24)]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7.5 12 13l8-5.5" />
                  <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
                </svg>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
