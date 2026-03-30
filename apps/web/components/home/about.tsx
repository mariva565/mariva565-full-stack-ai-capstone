"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const BENEFITS = [
  { icon: "glass-gift.png",      title: "Free Forever", sub: "No hidden fees",    delay: 0.4 },
  { icon: "glass-code.png",      title: "Open Source",  sub: "Community built",   delay: 0.5 },
  { icon: "glass-community.png", title: "Community",    sub: "Driven by you",     delay: 0.6 },
  { icon: "glass-secure.png",    title: "Secure",       sub: "Private by default", delay: 0.7 },
];

export function HomeAbout() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-32 dark:from-slate-900 dark:to-slate-800"
    >
      {/* Blob backgrounds */}
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-20 h-80 w-80 rounded-full bg-purple-300/20 blur-3xl" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">

          {/* Left: Mascot glass card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative flex justify-center"
          >
            {/* Ambient glow */}
            <div className="pointer-events-none absolute inset-8 rounded-[2rem] bg-indigo-400/20 blur-3xl" />

            {/* Glossy card */}
            <div
              className="group relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-white/50 bg-white/25 p-3 shadow-2xl backdrop-blur-xl"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                e.currentTarget.style.setProperty("--shine-x", `${x}%`);
                e.currentTarget.style.setProperty("--shine-y", `${y}%`);
              }}
            >
              {/* Mouse-shine overlay */}
              <div className="pointer-events-none absolute inset-0 z-20 rounded-[2rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_var(--shine-x,50%)_var(--shine-y,50%),rgba(255,255,255,0.28),transparent_60%)]" />

              <Image
                src="/assets/v1/about-mascot.png"
                alt="Study Hub Mascot"
                width={550}
                height={450}
                className="relative z-10 w-full rounded-[1.5rem] object-cover"
                priority={false}
              />
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          >
            {/* Badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 dark:bg-indigo-900/40">
              <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
                Our Mission
              </span>
            </div>

            {/* Heading with animated underline */}
            <h2 className="mb-6 font-shantell text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Empowering{" "}
              <span className="relative inline-block text-indigo-600 dark:text-indigo-400">
                Students
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <motion.path
                    d="M0 5 Q 50 10 100 5"
                    stroke="rgba(99,102,241,0.55)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={isInView ? { pathLength: 1 } : {}}
                    transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
                  />
                </svg>
              </span>{" "}
              Worldwide
            </h2>

            <p className="mb-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              Study Hub was born from a simple idea: education should be
              accessible, organized, and engaging for everyone.
            </p>
            <p className="mb-10 text-base leading-relaxed text-slate-500 dark:text-slate-400">
              We provide a comprehensive platform that adapts to your learning
              style. Whether you&apos;re a visual learner who needs diagrams or a
              structured learner who loves lists, Study Hub has the tools you
              need to succeed.
            </p>

            {/* Benefit cards */}
            <div className="grid grid-cols-2 gap-3">
              {BENEFITS.map((b) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: b.delay }}
                  className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/60"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-white to-indigo-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_12px_rgba(99,102,241,0.1)] dark:from-slate-700 dark:to-slate-700">
                    <Image
                      src={`/assets/v1/icons/${b.icon}`}
                      alt={b.title}
                      width={28}
                      height={28}
                      className="object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-110 dark:mix-blend-normal"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white font-handwritten">
                      {b.title}
                    </p>
                    <p className="text-xs text-slate-400">{b.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
