import dynamic from "next/dynamic";
import { Navbar } from "../layout/Navbar";
import { ScrollToTop } from "../ui/scroll-to-top";
import { HowItWorksHero } from "./how-it-works-hero";
import { HowItWorksTimeline } from "./how-it-works-timeline";
import { SiteFooter } from "../site-footer";

// Below-fold sections — lazy loaded
const HowItWorksGallery = dynamic(() => import("./how-it-works-gallery").then(m => m.HowItWorksGallery));
const HowItWorksCta = dynamic(() => import("./how-it-works-cta").then(m => m.HowItWorksCta));

export function HowItWorksPage({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar isAuthenticated={isAuthenticated} />
      <HowItWorksHero />
      <HowItWorksTimeline />
      <HowItWorksGallery />
      <HowItWorksCta />
      <ScrollToTop />

      <SiteFooter />
    </div>
  );
}
