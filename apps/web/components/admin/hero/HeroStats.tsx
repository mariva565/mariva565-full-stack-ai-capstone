"use client";

import { motion } from "framer-motion";

const stats = [
  {
    label: "System Status",
    value: "Operational",
    dot: "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]",
  },
  {
    label: "Environment",
    value: "Production",
    dot: "bg-cyan-400",
  },
  {
    label: "Platform",
    value: "StudyHub v2",
    dot: "bg-violet-400",
  },
];

export const HeroStats = () => {
  return (
    <div className="mt-8 flex gap-3 flex-wrap">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + i * 0.1 }}
          className="flex items-center gap-2.5 rounded-xl bg-white/[0.08] px-4 py-2.5 backdrop-blur-sm border border-white/[0.08]"
        >
          <span className={`h-2 w-2 rounded-full ${s.dot}`} />
          <span className="text-[0.7rem] font-bold uppercase tracking-widest text-white/50">
            {s.label}
          </span>
          <span className="text-sm font-bold text-white">{s.value}</span>
        </motion.div>
      ))}
    </div>
  );
};
