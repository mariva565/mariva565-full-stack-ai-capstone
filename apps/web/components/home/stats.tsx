"use client";

import { useScrollReveal } from "./use-scroll-reveal";

const STATS = [
  { value: "6", label: "DB Tables", sub: "Drizzle ORM" },
  { value: "20+", label: "API Endpoints", sub: "RESTful" },
  { value: "7", label: "Web Screens", sub: "Responsive" },
  { value: "3", label: "Mobile Screens", sub: "Expo" },
];

export function HomeStats() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="relative bg-white py-20 dark:bg-slate-900">
      <div
        ref={ref}
        className={`mx-auto max-w-5xl px-4 transition-all duration-700 sm:px-6 lg:px-8 ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
      >
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-6 text-center transition-all duration-500 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700/50 dark:from-slate-800 dark:to-slate-800/50 ${visible ? `${["stagger-0", "stagger-1", "stagger-2", "stagger-3"][i]}` : ""}`}
            >
              <div className="bg-gradient-to-br from-brand-500 to-cyan-500 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
                {stat.value}
              </div>
              <div className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                {stat.label}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
