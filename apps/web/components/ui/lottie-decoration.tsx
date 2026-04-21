"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export function LottieDecoration({ src }: { src: string }) {
  return (
    <div className="pointer-events-none fixed bottom-6 left-6 z-[90] h-[180px] w-[180px] opacity-80 drop-shadow-[0_0_15px_rgba(99,102,241,0.1)]">
      <DotLottieReact src={src} loop autoplay />
    </div>
  );
}
