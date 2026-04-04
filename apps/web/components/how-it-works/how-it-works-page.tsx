import { Navbar } from "../layout/Navbar";
import { ScrollToTop } from "../ui/scroll-to-top";
import { HowItWorksCta } from "./how-it-works-cta";
import { HowItWorksGallery } from "./how-it-works-gallery";
import { HowItWorksHero } from "./how-it-works-hero";
import { HowItWorksTimeline } from "./how-it-works-timeline";

export function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <HowItWorksHero />
      <HowItWorksTimeline />
      <HowItWorksGallery />
      <HowItWorksCta />
      <ScrollToTop />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-6 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-[#0f172a] dark:text-slate-400">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 md:flex-row">
          <p>&copy; 2026 Study Hub. Built with care for excellence.</p>
          <div className="flex items-center gap-3">
            <a
              href="/contact"
              className="transition-colors hover:text-indigo-500 dark:hover:text-indigo-300"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
