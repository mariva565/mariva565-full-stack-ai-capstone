import dynamic from "next/dynamic";
import { V1Hero } from "../components/home/v1-hero";
import { Navbar } from "../components/layout/Navbar";
import { CursorGlow } from "../components/ui/cursor-glow";
import { ScrollToTop } from "../components/ui/scroll-to-top";
import { getRequestUserOrNull } from "../lib/server-auth";
import { ForceLightMode } from "../components/landing/force-light-mode";
import { SiteFooter } from "../components/site-footer";

// Below-fold sections — loaded lazily so initial JS bundle stays small
const HomeFeatures = dynamic(() => import("../components/home/features").then(m => m.HomeFeatures));
const HomeAbout = dynamic(() => import("../components/home/about").then(m => m.HomeAbout));
const HomeFaq = dynamic(() => import("../components/home/faq").then(m => m.HomeFaq));
const HomeCtaBanner = dynamic(() => import("../components/home/cta-banner").then(m => m.HomeCtaBanner));

export default async function HomePage() {
  const user = await getRequestUserOrNull();

  return (
    <div className="min-h-screen bg-purple-50 flex flex-col p-4 md:p-8 selection:bg-brand-100 selection:text-brand-900 overflow-x-hidden transition-colors duration-500">
      <ScrollToTop />
      <ForceLightMode />
      {/* App-Wrapper (Rounded Box Container) */}
      <main className="flex-1 bg-white rounded-[2.5rem] md:rounded-[4rem] shadow-2xl overflow-x-hidden relative border border-white/60 flex flex-col">
        <CursorGlow />

        {/* Content Layers with Breathable Padding */}
        <div className="relative z-10 flex flex-col w-full">
          <Navbar isAuthenticated={Boolean(user)} />
          <V1Hero />

          <div className="bg-white">
            <HomeFeatures />
            <HomeAbout />
            {/* <HomeStats /> */}
            <HomeFaq />
            <HomeCtaBanner />
          </div>
        </div>

        <SiteFooter />
      </main>
    </div>
  );
}
