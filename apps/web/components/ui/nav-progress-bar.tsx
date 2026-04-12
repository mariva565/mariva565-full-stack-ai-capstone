"use client";

/**
 * NavProgressBar — thin animated bar shown at the top of the viewport
 * while the Next.js loading.tsx Suspense boundary is mounted.
 * Mounts on navigation start, unmounts when the new page is ready.
 * No JS timers — pure CSS animation.
 */
export function NavProgressBar() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-[3px] overflow-hidden"
    >
      <div className="nav-progress-fill h-full bg-gradient-to-r from-brand-500 via-violet-500 to-cyan-400" />
    </div>
  );
}
