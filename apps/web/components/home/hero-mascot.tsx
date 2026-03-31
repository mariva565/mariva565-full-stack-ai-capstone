"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function HeroMascot() {
  return (
    <div className="flex-1 relative flex items-center justify-center mt-8 lg:mt-0">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mascot-container relative w-[120px] h-[120px] sm:w-[200px] sm:h-[200px] md:w-[300px] md:h-[300px] lg:w-[400px] lg:h-[400px] xl:w-[500px] xl:h-[500px] mx-auto"
      >
        {/* Radial Glow behind the mascot (v1 light) */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] blur-[40px] -z-10 animate-glowPulse" 
          style={{ background: "var(--primary-glow)" }}
        />
        
        <div className="relative z-10 w-full h-full floating-img animate-floatRotate">
          <Image
            src="/assets/v1/mascot-transparent-background.png"
            alt="StudyHub Mascot"
            fill
            sizes="(max-width: 640px) 120px, (max-width: 768px) 200px, (max-width: 1024px) 300px, 500px"
            className="object-contain drop-shadow-[0_10px_30px_rgba(30,41,59,0.15)] drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            priority
          />
        </div>
      </motion.div>
    </div>
  );
}
