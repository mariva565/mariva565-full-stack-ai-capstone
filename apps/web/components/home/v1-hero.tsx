"use client";

import dynamic from "next/dynamic";
import { WaveDivider } from "./wave-divider";
import { HeroContent } from "./hero-content";
import { HeroMascot } from "./hero-mascot";

const Hero3D = dynamic(() => import("./hero-3d").then((m) => m.Hero3D), {
  ssr: false,
});

export function V1Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center pt-8 pb-48 overflow-hidden hero-section">
      {/* 3D Background Layer */}
      <Hero3D />

      {/* Purple Gradient Overlay (matches original) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(99,102,241,0.75)] via-[rgba(168,85,247,0.6)] to-[rgba(6,182,212,0.5)] pointer-events-none z-[1]" />

      {/* Decorative Blobs (hidden when 3D is active, matching original) */}
      <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-[#8b5cf6] blur-[100px] rounded-full opacity-40 z-[1] pointer-events-none hidden" />
      <div className="absolute top-[30%] left-[-10%] w-[500px] h-[500px] bg-[#06b6d4] blur-[100px] rounded-full opacity-40 z-[1] pointer-events-none hidden" />

      <div className="container mx-auto px-6 z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          <HeroContent />
          <HeroMascot />
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-[-1px] left-0 w-full z-20">
        <WaveDivider />
      </div>
    </section>
  );
}
