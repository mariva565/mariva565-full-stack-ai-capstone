"use client";

import { useScrollReveal } from "./use-scroll-reveal";

const FEATURES = [
  {
    title: "Courses & Modules",
    description: "Organize your knowledge hierarchically: Course → Module → Materials. Every topic exactly where it belongs.",
    icon: "courses.png",
    delay: 0.1
  },
  {
    title: "Universal Resources",
    description: "Notes, files, and links — all with colorful icons and type badges for instant recognition.",
    icon: "glass-code.png",
    delay: 0.2
  },
  {
    title: "Tags & Smart Search",
    description: "Add tags to your materials and filter them with a single click. Find everything instantly.",
    icon: "glass-community.png", 
    delay: 0.3
  },
  {
    title: "Favorites",
    description: "Pin your most important materials to Favorites for quick access directly from your dashboard.",
    icon: "glass-gift.png",
    delay: 0.4
  },
  {
    title: "Secure Profile",
    description: "Everything is protected by JWT authentication. Only you can see and manage your materials.",
    icon: "glass-secure.png",
    delay: 0.5
  },
  {
    title: "Mobile Ready",
    description: "Access your courses on the go with our React Native mobile app. Same backend, everywhere.",
    icon: "modules.png",
    delay: 0.6
  },
];

import { GlassCard } from "./glass-card";

export function HomeFeatures() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-[#0f172a] py-32 transition-colors duration-500">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20 text-center">
          <span className="mb-4 inline-block text-sm font-bold uppercase tracking-[0.2em] text-indigo-500">
            Features
          </span>
          <h2 className="font-shantell text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            Everything you need to succeed
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-500 dark:text-slate-400">
            Powerful tools to make your learning process more organized and efficient.
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
