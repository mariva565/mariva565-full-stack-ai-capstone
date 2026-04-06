"use client";

import { useScrollReveal } from "./use-scroll-reveal";

const FEATURES = [
  {
    title: "Course Management",
    description: "Create and organize multiple courses with ease. Keep track of your progress and upcoming modules.",
    icon: "courses.png",
    delay: 0.1
  },
  {
    title: "Module Organiser",
    description: "Break down your courses into manageable modules. Stay focused on one topic at a time.",
    icon: "modules.png",
    delay: 0.2
  },
  {
    title: "Resource Manager",
    description: "Upload and categorize learning materials. Access links, files, and notes in one place.",
    icon: "security.png",
    delay: 0.3
  },
];

import { GlassCard } from "./glass-card";

export function HomeFeatures() {
  return (
    <section
      id="features"
      className="relative scroll-mt-28 overflow-hidden py-32 transition-colors duration-500"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 30%, #eef2ff 100%)" }}
    >
      {/* Decorative blur blobs (matching original) */}
      <div className="absolute -top-[100px] -right-[100px] w-[400px] h-[400px] rounded-full blur-[80px] opacity-60 pointer-events-none bg-[radial-gradient(circle,rgba(99,102,241,0.15),transparent)]" />
      <div className="absolute -bottom-[100px] -left-[100px] w-[500px] h-[500px] rounded-full blur-[80px] opacity-60 pointer-events-none bg-[radial-gradient(circle,rgba(6,182,212,0.15),transparent)]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20 text-center">
          <span className="mb-5 block text-sm font-bold uppercase tracking-[0.2em] text-indigo-500">
            Features
          </span>
          <h2 className="home-display-title mx-auto block max-w-5xl text-4xl sm:text-5xl lg:text-6xl">
            Everything you need to succeed
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-500">
            Our platform provides powerful tools to keep your educational life organized and efficient.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <GlassCard 
              key={f.title} 
              icon={f.icon} 
              title={f.title} 
              description={f.description} 
              delay={f.delay}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
