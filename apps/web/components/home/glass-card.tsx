"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Tilt } from "../ui/tilt";

interface GlassCardProps {
  icon: string;
  title: string;
  description: string;
  delay?: number;
}

export function GlassCard({ icon, title, description, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="h-full"
    >
      <Tilt maxRotate={12} scale={1.03}>
        <div className="relative group h-full p-8 rounded-3xl border border-white/60 dark:border-white/10 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl shadow-xl transition-all duration-300 hover:shadow-indigo-500/15 overflow-hidden glass-card-hover"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
            e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
          }}
        >
          {/* Spotlight Effect Overlay */}
          <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(800px_circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(99,102,241,0.1),transparent_40%)]" 
          />

          {/* Icon with Glossy Squircle Pod (v1 style) */}
          <div className="relative z-10 mb-8 w-16 h-16 mx-auto">
            {/* Soft Glow behind pod */}
            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-2xl scale-125 opacity-0 group-hover:opacity-100 transition-all duration-500" />
            
            <div className="relative w-full h-full rounded-2xl overflow-hidden glass-icon-box bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.92),rgba(237,241,255,0.7)_68%,rgba(219,227,255,0.55))] shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_10px_22px_rgba(99,102,241,0.12)] border border-white/40 flex items-center justify-center feature-icon-transition">
              <div className="relative w-full h-full p-2.5">
                <Image 
                  src={`/assets/v1/icons/${icon}`} 
                  alt={title} 
                  fill
                  sizes="64px"
                  className="object-contain mix-blend-multiply contrast-[1.08] saturate-[1.08] drop-shadow-[0_8px_16px_rgba(99,102,241,0.16)] group-hover:scale-115 group-hover:rotate-6 transition-all duration-500"
                />
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-handwritten">
              {title}
            </h3>
            
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              {description}
            </p>
          </div>

          {/* Decorative hover gradient corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-tr-3xl -z-10 group-hover:from-indigo-500/10 transition-all" />
        </div>
      </Tilt>
    </motion.div>
  );
}
