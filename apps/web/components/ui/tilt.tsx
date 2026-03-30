"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

interface TiltProps {
  children: React.ReactNode;
  maxRotate?: number;
  scale?: number;
}

export function Tilt({ children, maxRotate = 15, scale = 1.05 }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0.5); // 0 to 1
  const y = useMotionValue(0.5); // 0 to 1

  const rotateX = useTransform(y, [0, 1], [maxRotate, -maxRotate]);
  const rotateY = useTransform(x, [0, 1], [-maxRotate, maxRotate]);

  const springConfig = { damping: 20, stiffness: 300, mass: 0.1 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);
  const springScale = useSpring(1, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    
    x.set((clientX - left) / width);
    y.set((clientY - top) / height);
    springScale.set(scale);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
    springScale.set(1);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        scale: springScale,
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}
