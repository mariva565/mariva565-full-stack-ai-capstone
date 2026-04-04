"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import { useVisibleAnimation } from "../ui/use-visible-animation";
import { TIMELINE_STEPS, type TimelineStep } from "./content";

/* ── Individual timeline card ────────────────────────── */

function TimelineCard({
  step,
  index,
  isActive,
}: {
  step: TimelineStep;
  index: number;
  isActive: boolean;
}) {
  const isSuccess = step.variant === "success";
  const iconName = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40, y: 15 }}
      animate={
        isActive
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, x: index % 2 === 0 ? -40 : 40, y: 15 }
      }
      transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }} // AOS ease-out-cubic equivalent
      className={`group relative z-[1] mb-16 flex items-start last:mb-0 ${
        index % 2 === 0
          ? "flex-row pr-[calc(50%+40px)] lg:pr-[calc(50%+40px)]"
          : "flex-row-reverse pl-[calc(50%+40px)] lg:pl-[calc(50%+40px)]"
      } max-lg:!flex-row max-lg:!pl-20 max-lg:!pr-0`}
    >
      {/* Marker */}
      <div
        className={`absolute left-1/2 z-[2] flex h-[60px] w-[60px] -translate-x-1/2 items-center justify-center rounded-full shadow-[0_10px_30px_rgba(99,102,241,0.4)] transition-all duration-500 max-lg:!left-[30px] ${
          isSuccess
            ? "bg-gradient-to-br from-emerald-500 to-cyan-500"
            : "bg-gradient-to-br from-indigo-500 to-purple-500"
        } ${isActive ? "scale-[1.15] shadow-[0_15px_40px_rgba(99,102,241,0.6)]" : ""}`}
      >
        {step.number === "trophy" ? (
          <TrophySvg />
        ) : (
          <span className="font-shantell text-2xl font-extrabold text-white">
            {step.number}
          </span>
        )}
        {/* Pulse ring */}
        <span
          className={`absolute inset-[-10px] animate-pulse-ring rounded-full border-2 transition-opacity ${
            isSuccess ? "border-emerald-400/30" : "border-indigo-400/30"
          } ${isActive ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      {/* Card */}
      <div
        className={`relative flex-1 overflow-hidden rounded-3xl border bg-white/90 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.05)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(99,102,241,0.15)] dark:bg-slate-800/90 dark:border-white/10 ${
          isSuccess
            ? "border-emerald-200/40 bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-800 dark:to-emerald-900/20"
            : "border-indigo-100/40"
        }`}
      >
        {/* Top gradient bar */}
        <div
          className={`absolute left-0 top-0 h-1 w-full origin-left bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 transition-transform duration-500 ${
            isActive ? "scale-x-100" : "scale-x-0"
          }`}
        />

        <div
          className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-[5deg] ${
            isSuccess
              ? "bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 group-hover:from-emerald-500 group-hover:to-cyan-500"
              : "bg-gradient-to-br from-indigo-500/10 to-purple-500/10 group-hover:from-indigo-500 group-hover:to-purple-500"
          }`}
        >
          <StepIcon
            name={iconName}
            isSuccess={isSuccess}
          />
        </div>

        <h3 className="mb-3 font-shantell text-2xl font-bold text-slate-800 dark:text-white">
          {step.title}
        </h3>
        <p className="mb-5 leading-relaxed text-slate-500 dark:text-white/70">
          {step.description}
        </p>

        {/* Feature tags */}
        <div className="flex flex-wrap gap-2">
          {step.tags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5 ${
                isSuccess
                  ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-400/20 dark:text-emerald-300 dark:hover:bg-emerald-400/30"
                  : "bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 dark:bg-indigo-400/20 dark:text-indigo-300 dark:hover:bg-indigo-400/30"
              }`}
            >
              {isSuccess ? <StarSvg /> : <CheckSvg />}
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main timeline section ───────────────────────────── */

export function HowItWorksTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const { ref: observerRef, isVisible, shouldAnimate } =
    useVisibleAnimation<HTMLDivElement>({ threshold: 0.08 });

  /* Scroll progress */
  const [progress, setProgress] = useState(0);

  const updateProgress = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const winH = window.innerHeight;
    const p = Math.min(
      1,
      Math.max(0, (winH - rect.top) / (rect.height + winH - 200))
    );
    setProgress(p);
  }, []);

  useEffect(() => {
    if (!shouldAnimate || !isVisible) return;
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener("scroll", updateProgress);
  }, [shouldAnimate, isVisible, updateProgress]);

  /* Per-item activation via IntersectionObserver */
  const [activeItems, setActiveItems] = useState<Set<number>>(new Set());
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!shouldAnimate) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(
            (entry.target as HTMLElement).dataset.timelineIndex
          );
          if (entry.isIntersecting) {
            setActiveItems((prev) => new Set(prev).add(idx));
          }
        });
      },
      { threshold: 0.5, rootMargin: "0px 0px -20% 0px" }
    );

    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [shouldAnimate]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-gradient-to-b from-white to-slate-50 py-24 dark:from-slate-900 dark:to-[#0f172a]"
    >
      {/* Progress line */}
      <div className="absolute bottom-24 left-1/2 top-24 w-1 -translate-x-1/2 rounded bg-indigo-500/10 max-lg:!left-[30px]">
        <div
          className="w-full rounded bg-gradient-to-b from-indigo-500 via-purple-500 to-cyan-500 shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-[height] duration-[110ms] ease-linear"
          style={{ height: `${progress * 100}%` }}
        />
      </div>

      <div ref={observerRef} className="container relative mx-auto max-w-5xl px-4">
        {TIMELINE_STEPS.map((step, index) => (
          <div
            key={step.number}
            ref={(el) => { itemRefs.current[index] = el; }}
            data-timeline-index={index}
          >
            <TimelineCard
              step={step}
              index={index}
              isActive={activeItems.has(index)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Inline SVG icons ────────────────────────────────── */

function CheckSvg() {
  return (
    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 16 16">
      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
    </svg>
  );
}

function StarSvg() {
  return (
    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 16 16">
      <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
    </svg>
  );
}

function TrophySvg() {
  return (
    <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 16 16">
      <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5c0 .538-.012 1.05-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33.076 33.076 0 0 1 2.5.5zm.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.398-.588-2.797-.72-3.935zm10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.138-.388 2.537-.72 3.935z" />
    </svg>
  );
}

function StepIcon({ name, isSuccess }: { name: string; isSuccess: boolean }) {
  const cls = `h-7 w-7 transition-colors duration-300 ${
    isSuccess ? "text-emerald-500" : "text-indigo-500"
  } group-hover:text-white`;

  switch (name) {
    case "journal-plus":
      return (
        <svg className={cls} fill="currentColor" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M8 5.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V10a.5.5 0 0 1-1 0V8.5H6a.5.5 0 0 1 0-1h1.5V6a.5.5 0 0 1 .5-.5z"/>
          <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2z"/>
          <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1z"/>
        </svg>
      );
    case "collection":
      return (
        <svg className={cls} fill="currentColor" viewBox="0 0 16 16">
          <path d="M2.5 3.5a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-11zm2-2a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zM0 13a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 13V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 0 6v7z" />
        </svg>
      );
    case "cloud-arrow-up":
      return (
        <svg className={cls} fill="currentColor" viewBox="0 0 16 16">
          <path d="M7.646 5.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708l2-2z" />
          <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383z" />
        </svg>
      );
    case "mortarboard":
      return (
        <svg className={cls} fill="currentColor" viewBox="0 0 16 16">
          <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917l-7.5-3.5z" />
          <path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466 4.176 9.032z" />
        </svg>
      );
    default:
      return null;
  }
}
