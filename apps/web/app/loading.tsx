import { NavProgressBar } from "../components/ui/nav-progress-bar";

/**
 * Root loading state (Next.js Suspense boundary).
 * Shown during server-side navigation — replaces the full-screen spinner
 * with a thin progress bar + blank content area so layout stays stable.
 */
export default function GlobalLoading() {
  return (
    <>
      <NavProgressBar />
      <div className="min-h-[60vh]" aria-busy="true" aria-label="Loading page…" />
    </>
  );
}
