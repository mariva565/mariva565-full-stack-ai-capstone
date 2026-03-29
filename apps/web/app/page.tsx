import { HomeHero } from "../components/home/hero";
import { HomeFeatures } from "../components/home/features";
import { HomeStats } from "../components/home/stats";
import { HomeFaq } from "../components/home/faq";
import { HomeCtaBanner } from "../components/home/cta-banner";
import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <HomeHero />
      <HomeFeatures />
      <HomeStats />
      <HomeFaq />
      <HomeCtaBanner />

      <footer className="border-t border-slate-200 bg-white py-8 dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} StudyHub. Capstone Project.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-slate-400 transition-colors hover:text-brand-500">
              Вход
            </Link>
            <Link href="/register" className="text-sm text-slate-400 transition-colors hover:text-brand-500">
              Регистрация
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
