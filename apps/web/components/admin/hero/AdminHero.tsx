"use client";

import { motion } from "framer-motion";
import { HeroMesh } from "./HeroMesh";

import { HeroStats } from "./HeroStats";

export const AdminHero = () => {
  const today = new Date().toLocaleDateString("bg-BG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-v1-gradient p-8 md:p-10 text-white shadow-2xl border border-white/10">
      <HeroMesh />
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Date badge */}
          <span className="inline-block mb-4 rounded-full bg-white/[0.06] border border-white/[0.08] px-3.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white/50">
            {today}
          </span>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight font-shantell leading-tight text-white drop-shadow-md">
            Command Center
          </h1>

          <p className="mt-3 max-w-lg text-[0.95rem] text-white/50 font-medium leading-relaxed">
            Manage users, courses and materials from one place.
          </p>
        </motion.div>

        <HeroStats />
      </div>

      {/* Bottom edge accent */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-v1-blue/0 via-v1-cyan/20 to-v1-blue/0" />
    </section>
  );
};
