"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import dynamic from "next/dynamic";
import { useVisibleAnimation } from "../ui/use-visible-animation";

const BohemianParticles = dynamic(
  () => import("./bohemian-particles").then((m) => m.BohemianParticles),
  { ssr: false }
);

export function HowItWorksCta() {
  const { ref, isVisible, hasEntered, shouldAnimate } =
    useVisibleAnimation<HTMLDivElement>({ threshold: 0.2 });

  /* Auth-aware CTA: logged-in users see "Go to Dashboard" */
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => {
        if (r.ok) setIsLoggedIn(true);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="bg-slate-50 px-4 pb-24 pt-4 dark:bg-[#0f172a]">
      <div ref={ref} className="container mx-auto max-w-6xl">
        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 32 } : false}
          animate={hasEntered ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: shouldAnimate ? 0.65 : 0, ease: "easeOut" }}
          className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 px-8 py-16 text-center shadow-[0_20px_60px_rgba(99,102,241,0.3)]"
        >
          {/* Bohemian Particles (Three.js — v1 parity) */}
          <BohemianParticles />

          {/* Decorative circles */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -right-24 -top-24 h-[300px] w-[300px] rounded-full bg-white/10" />
            <div className="absolute -bottom-12 -left-12 h-[200px] w-[200px] rounded-full bg-white/10" />
            <div className="absolute left-[20%] top-1/2 h-[100px] w-[100px] rounded-full bg-white/10" />
          </div>

          <div className="relative z-10">
            {/* Floating rocket icon */}
            <motion.div
              animate={
                isVisible && shouldAnimate
                  ? { y: [0, -10, 0] }
                  : { y: 0 }
              }
              transition={
                isVisible && shouldAnimate
                  ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.25 }
              }
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20"
            >
              {/* bi-rocket-takeoff (Bootstrap Icons — v1 parity) */}
              <svg
                className="h-10 w-10 text-white"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M9.752 6.193c.599.6 1.73.437 2.528-.362s.96-1.932.362-2.531c-.599-.6-1.73-.438-2.528.361-.798.8-.96 1.933-.362 2.532" />
                <path d="M15.811 3.312c-.363 1.534-1.334 3.626-3.64 6.218l-.24 2.408a2.56 2.56 0 0 1-.732 1.526L8.817 15.85a.51.51 0 0 1-.867-.434l.27-1.899c.04-.28-.013-.593-.131-.956a9 9 0 0 0-.249-.657l-.082-.202c-.815-.197-1.578-.662-2.191-1.277-.614-.615-1.079-1.379-1.275-2.195l-.203-.083a10 10 0 0 0-.655-.248c-.363-.119-.675-.172-.955-.132l-1.896.27A.51.51 0 0 1 .15 7.17l2.382-2.386c.41-.41.947-.67 1.524-.734h.006l2.4-.238C9.005 1.55 11.087.582 12.623.208c.89-.217 1.59-.232 2.08-.188.244.023.435.06.57.093q.1.026.16.045c.184.06.279.13.351.295l.029.073a3.5 3.5 0 0 1 .157.721c.055.485.051 1.178-.159 2.065m-4.828 7.475.04-.04-.107 1.081a1.54 1.54 0 0 1-.44.913l-1.298 1.3.054-.38c.072-.506-.034-.993-.172-1.418a9 9 0 0 0-.164-.45c.738-.065 1.462-.38 2.087-1.006M5.205 5c-.625.626-.94 1.351-1.004 2.09a9 9 0 0 0-.45-.164c-.424-.138-.91-.244-1.416-.172l-.38.054 1.3-1.3c.245-.246.566-.401.91-.44l1.08-.107zm9.406-3.961c-.38-.034-.967-.027-1.746.163-1.558.38-3.917 1.496-6.937 4.521-.62.62-.799 1.34-.687 2.051.107.676.483 1.362 1.048 1.928.564.565 1.25.941 1.924 1.049.71.112 1.429-.067 2.048-.688 3.079-3.083 4.192-5.444 4.556-6.987.183-.771.18-1.345.138-1.713a3 3 0 0 0-.045-.283 3 3 0 0 0-.3-.041Z" />
                <path d="M7.009 12.139a7.6 7.6 0 0 1-1.804-1.352A7.6 7.6 0 0 1 3.794 8.86c-1.102.992-1.965 5.054-1.839 5.18.125.126 3.936-.896 5.054-1.902Z" />
              </svg>
            </motion.div>

            <h2 className="font-shantell text-4xl font-extrabold text-white sm:text-5xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-white/85">
              Gather all your study materials in one place. Save time and study smarter.
            </p>

            {/* Auth-aware buttons */}
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="btn-gradient-primary inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold shadow-[0_10px_30px_rgba(99,102,241,0.4)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_15px_40px_rgba(99,102,241,0.5)]"
                >
                  {/* bi-arrow-right-circle */}
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z" />
                  </svg>
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-indigo-600 shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)]"
                >
                  {/* bi-play-fill */}
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                    <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                  </svg>
                  Create Free Account
                </Link>
              )}
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/50 px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:border-white hover:bg-white/15"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z" />
                </svg>
                Have questions?
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
