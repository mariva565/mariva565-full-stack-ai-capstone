"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

type LottieLoaderProps = {
  src?: string;
  className?: string;
  autoplay?: boolean;
  loop?: boolean;
  ariaLabel?: string;
};

export function LottieLoader({
  src = "/lottie/loading.lottie",
  className,
  autoplay = true,
  loop = true,
  ariaLabel = "Loading animation",
}: LottieLoaderProps) {
  return <DotLottieReact src={src} autoplay={autoplay} loop={loop} className={className} aria-label={ariaLabel} />;
}
