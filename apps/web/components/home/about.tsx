"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, useCallback } from "react";

const BENEFITS = [
  { icon: "glass-gift.png",      title: "Free Forever", sub: "No hidden fees",    delay: 0.4, floatDelay: "0s" },
  { icon: "glass-code.png",      title: "Open Source",  sub: "Community built",   delay: 0.5, floatDelay: "0.5s" },
  { icon: "glass-community.png", title: "Community",    sub: "Driven by you",     delay: 0.6, floatDelay: "1.0s" },
  { icon: "glass-secure.png",    title: "Secure",       sub: "Private by default", delay: 0.7, floatDelay: "1.5s" },
];

function BenefitCard({ icon, title, sub, delay, floatDelay, isInView }: {
  icon: string; title: string; sub: string; delay: number; floatDelay: string; isInView: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const iconImgRef = useRef<HTMLImageElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (overlayRef.current) {
      overlayRef.current.style.transform = `translate3d(${x - 400}px, ${y - 400}px, 0)`;
      overlayRef.current.style.opacity = "1";
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (overlayRef.current) {
      overlayRef.current.style.transform = "translate3d(-400px, -400px, 0)";
      overlayRef.current.style.opacity = "0";
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="group relative flex h-full items-center gap-3 overflow-hidden rounded-2xl p-4"
        style={{
          background: "rgba(255, 255, 255, 0.6)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          isolation: "isolate",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.background = "rgba(255, 255, 255, 0.85)";
          el.style.transform = "translateY(-5px)";
          el.style.boxShadow = "0 15px 35px rgba(99, 102, 241, 0.12)";
          el.style.borderColor = "rgba(99, 102, 241, 0.3)";
          if (iconRef.current) iconRef.current.style.transform = "scale(1.1)";
          if (iconImgRef.current) {
            iconImgRef.current.style.transform = "scale(1.15) rotate(5deg)";
            iconImgRef.current.style.filter = "contrast(1.08) saturate(1.08) drop-shadow(0 8px 12px rgba(99,102,241,0.2))";
          }
        }}
        onMouseOut={(e) => {
          const el = e.currentTarget;
          el.style.background = "rgba(255, 255, 255, 0.6)";
          el.style.transform = "translateY(0)";
          el.style.boxShadow = "none";
          el.style.borderColor = "rgba(255, 255, 255, 0.6)";
          if (iconRef.current) iconRef.current.style.transform = "scale(1)";
          if (iconImgRef.current) {
            iconImgRef.current.style.transform = "scale(1) rotate(0deg)";
            iconImgRef.current.style.filter = "contrast(1.08) saturate(1.08) drop-shadow(0 8px 16px rgba(99,102,241,0.16))";
          }
        }}
      >
        {/* Spotlight overlay */}
        <div
          ref={overlayRef}
          className="pointer-events-none absolute z-0"
          style={{
            width: 800,
            height: 800,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.15), transparent 40%)",
            opacity: 0,
            transition: "transform 120ms linear, opacity 0.3s ease",
            transform: "translate3d(-400px, -400px, 0)",
          }}
        />

        {/* Glass icon box with float animation */}
        <div
          ref={iconRef}
          className="relative z-10 flex shrink-0 items-center justify-center overflow-hidden"
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.92), rgba(237,241,255,0.7) 68%, rgba(219,227,255,0.55))",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.75), 0 10px 22px rgba(99,102,241,0.12)",
            animation: `floatIcon 3s ease-in-out infinite`,
            animationDelay: floatDelay,
            transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <div ref={iconImgRef} style={{
            width: 64, height: 64,
            mixBlendMode: "multiply" as const,
            filter: "contrast(1.08) saturate(1.08) drop-shadow(0 8px 16px rgba(99,102,241,0.16))",
            transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.4s ease",
          }}>
            <Image
              src={`/assets/v1/icons/${icon}`}
              alt={title}
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-sm font-bold text-slate-900 font-handwritten">{title}</p>
          <p className="text-xs text-slate-400">{sub}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function HomeAbout() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative overflow-hidden py-32"
      style={{ background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)" }}
    >
      {/* Blob backgrounds (matching original: purple top-right, pink mid-left) */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: "-20%", right: "-10%", width: 700, height: 700,
          borderRadius: "50%", background: "#8b5cf6", filter: "blur(100px)", opacity: 0.4,
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          top: "10%", left: "-5%", width: 600, height: 600,
          borderRadius: "50%", background: "#8b5cf6", filter: "blur(100px)", opacity: 0.35,
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">

          {/* Left: Mascot glass card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative flex justify-center"
            style={{ perspective: 1000 }}
          >
            {/* Animated glow behind */}
            <div
              className="pointer-events-none absolute"
              style={{
                width: 350, height: 350,
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(129,140,248,0.15) 40%, transparent 70%)",
                opacity: 0.6,
                filter: "blur(12px)",
                animation: "glowPulse 4s infinite",
              }}
            />

            {/* Decorative back layer (tilted, blurred) */}
            <div
              className="pointer-events-none absolute z-0 rounded-[2.5rem] bg-indigo-500/10"
              style={{
                inset: -20,
                transform: "rotate(-6deg) translateZ(-50px)",
                filter: "blur(20px)",
              }}
            />

            {/* Glossy card — tilted -3deg like original */}
            <div
              className="glossy-card group relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-white/50 bg-white/25 p-3 shadow-2xl backdrop-blur-xl"
              style={{
                transform: "rotate(-3deg)",
                transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
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
                style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
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
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                Our Mission
              </span>
            </div>

            {/* Heading with animated underline */}
            <h2 className="mb-6 font-shantell text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Empowering{" "}
              <span className="relative inline-block" style={{
                background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
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
              <br />Worldwide
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

            {/* Benefit cards */}
            <div className="grid grid-cols-2 gap-3">
              {BENEFITS.map((b) => (
                <BenefitCard key={b.title} {...b} isInView={isInView} />
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
