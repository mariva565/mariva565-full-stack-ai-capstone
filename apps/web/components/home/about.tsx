"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { AboutBenefitCard } from "./about-benefit-card";
import { AboutMascotCard } from "./about-mascot-card";

const BENEFITS = [
  {
    delay: 0.4,
    floatDelay: 0,
    icon: "glass-gift.png",
    sub: "No hidden fees",
    title: "Free Forever",
  },
  {
    delay: 0.5,
    floatDelay: 0.5,
    icon: "glass-code.png",
    sub: "Community built",
    title: "Open Source",
  },
  {
    delay: 0.6,
    floatDelay: 1,
    icon: "glass-community.png",
    sub: "Driven by you",
    title: "Community",
  },
  {
    delay: 0.7,
    floatDelay: 1.5,
    icon: "glass-secure.png",
    sub: "Private by default",
    title: "Secure",
  },
] as const;

export function HomeAbout() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative scroll-mt-28 overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] py-32"
    >
      <div className="pointer-events-none absolute -right-[10%] -top-[20%] h-[700px] w-[700px] rounded-full bg-[#8b5cf6]/40 blur-[100px]" />
      <div className="pointer-events-none absolute -left-[5%] top-[10%] h-[600px] w-[600px] rounded-full bg-[#8b5cf6]/35 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <AboutMascotCard isInView={isInView} />

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                Our Mission
              </span>
            </div>

            <h2 className="home-display-title mb-6 text-4xl sm:text-5xl">
              Empowering{" "}
              <span className="relative inline-block bg-[linear-gradient(135deg,#8b5cf6,#ec4899)] bg-clip-text text-transparent">
                Students
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <motion.path
                    d="M0 5 Q 50 10 100 5"
                    className="stroke-brand-500/60"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={isInView ? { pathLength: 1 } : {}}
                    transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
                  />
                </svg>
              </span>{" "}
              <br />
              Worldwide
            </h2>

            <p className="mb-4 text-lg leading-relaxed text-slate-600">
              Study Hub was born from a simple idea: education should be
              accessible, organized, and engaging for everyone.
            </p>
            <p className="mb-10 text-base leading-relaxed text-slate-500">
              We provide a comprehensive platform that adapts to your learning
              style. Whether you&apos;re a visual learner who needs diagrams or a
              structured learner who loves lists, Study Hub has the tools you
              need to succeed.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {BENEFITS.map((benefit) => (
                <AboutBenefitCard
                  key={benefit.title}
                  delay={benefit.delay}
                  floatDelay={benefit.floatDelay}
                  icon={benefit.icon}
                  isInView={isInView}
                  sub={benefit.sub}
                  title={benefit.title}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
