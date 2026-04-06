"use client";

import { motion } from "framer-motion";

export const HeroMascot = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none select-none"
    >
      <img
        src="/assets/v1/icons/logo.png"
        alt=""
        className="h-36 w-36 object-contain opacity-[0.06]"
      />
    </motion.div>
  );
};
