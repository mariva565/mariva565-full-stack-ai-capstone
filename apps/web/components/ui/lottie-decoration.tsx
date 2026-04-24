"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export function LottieDecoration({ src }: { src: string }) {
  return (
    <div className="pointer-events-none fixed right-6 top-[calc(var(--app-navbar-height,0px)+1rem)] z-[90] h-[160px] w-[160px] opacity-80 drop-shadow-[0_0_15px_rgba(99,102,241,0.1)] sm:h-[180px] sm:w-[180px]">
      <DotLottieReact src={src} loop autoplay />
    </div>
  );
}
