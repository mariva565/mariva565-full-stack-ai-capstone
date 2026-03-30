"use client";

import { motion } from "framer-motion";

export function WaveDivider() {
  return (
    <div className="relative w-full overflow-hidden leading-[0] z-20 -mt-1 h-[15vw] min-h-[110px] max-h-[180px] bg-transparent">
      {/* 
        Premium Flowing Waves using layered SVG backgrounds with infinite horizontal scroll.
        This ensures the "flowing" effect the user requested and avoids path-morphing quirks.
      */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Layer 1: Deep Lavender Flow */}
        <motion.div
            initial={{ x: 0 }}
            animate={{ x: "-50%" }}
            transition={{ 
                duration: 20, 
                repeat: Infinity, 
                ease: "linear" 
            }}
            className="absolute top-0 left-0 w-[200%] h-full opacity-40"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 320' preserveAspectRatio='none'%3E%3Cpath fill='%23f3e8ff' d='M0,160C120,80,240,240,360,160C480,80,600,240,720,160L800,160L800,320L0,320Z'/%3E%3C/svg%3E")`,
                backgroundSize: "50% 100%",
                backgroundRepeat: "repeat-x"
            }}
        />

        {/* Layer 2: Soft Purple Flow (Faster) */}
        <motion.div
            initial={{ x: 0 }}
            animate={{ x: "-50%" }}
            transition={{ 
                duration: 15, 
                repeat: Infinity, 
                ease: "linear" 
            }}
            className="absolute top-0 left-0 w-[200%] h-full opacity-60"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/xml' viewBox='0 0 800 320' preserveAspectRatio='none'%3E%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 320' preserveAspectRatio='none'%3E%3Cpath fill='%23faf5ff' d='M0,224C120,160,240,288,360,224C480,160,600,288,720,224L800,224L800,320L0,320Z'/%3E%3C/svg%3E%3C/svg%3E")`,
                backgroundSize: "50% 100%",
                backgroundRepeat: "repeat-x"
            }}
        />

        {/* Layer 3: Solid Bottom (White/Dark) - Static or very slow morph */}
        <div 
            className="absolute bottom-0 left-0 w-full h-full"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 320' preserveAspectRatio='none'%3E%3Cpath fill='white' d='M0,256C120,224,240,288,360,256C480,224,600,288,720,256L800,256L800,320L0,320Z'/%3E%3C/svg%3E")`,
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat"
            }}
        />
        {/* Dark mode version of Layer 3 (via CSS filter or separate div) */}
        <div 
            className="absolute bottom-0 left-0 w-full h-full hidden dark:block"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 320' preserveAspectRatio='none'%3E%3Cpath fill='%230f172a' d='M0,256C120,224,240,288,360,256C480,224,600,288,720,256L800,256L800,320L0,320Z'/%3E%3C/svg%3E")`,
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat"
            }}
        />
      </div>
    </div>
  );
}
