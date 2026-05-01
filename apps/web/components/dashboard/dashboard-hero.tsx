import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "../auth/auth-icons";
import { DashboardActionButton } from "./dashboard-controls";

type DashboardHeroProps = {
  courseCount: number;
  moduleCount: number;
  materialCount: number;
  pinnedCount: number;
  showCreateForm: boolean;
  userName: string;
  onToggleCreateForm: () => void;
};

type StatCardProps = {
  label: string;
  value: number;
};

type HeroActionsProps = {
  showCreateForm: boolean;
  onToggleCreateForm: () => void;
};

function useCountUp(target: number, duration = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let startTime: number | null = null;
    let rafId: number;

    function step(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) rafId = requestAnimationFrame(step);
    }

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return count;
}

function StatCard({ label, value }: StatCardProps) {
  const displayValue = useCountUp(value);

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="rounded-[1.4rem] border border-white/90 bg-white/92 px-4 py-3 shadow-[0_18px_45px_rgba(99,102,241,0.09)] backdrop-blur dark:border-white/10 dark:bg-[radial-gradient(circle_at_82%_16%,rgba(226,232,240,0.12)_0%,rgba(148,163,184,0.07)_18%,rgba(15,23,42,0)_42%),linear-gradient(160deg,rgba(15,24,48,0.9)_0%,rgba(8,16,38,0.9)_58%,rgba(5,12,28,0.94)_100%)] dark:shadow-[0_18px_45px_rgba(6,182,212,0.12)]"
    >
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-cyan-100/70">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black bg-gradient-to-br from-brand-500 to-cyan-500 bg-clip-text text-transparent">{displayValue}</p>
    </motion.div>
  );
}

const STUDY_QUOTES = [
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Gandhi" },
  { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
  { text: "Education is the passport to the future.", author: "Malcolm X" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "A little progress each day adds up to big results.", author: "Satya Nani" },
  { text: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.", author: "Brian Herbert" },
  { text: "Study while others are sleeping; work while others are loafing.", author: "William A. Ward" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown" },
  { text: "Stay focused, go after your dreams and keep moving toward your goals.", author: "LL Cool J" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Genius is one percent inspiration and ninety-nine percent perspiration.", author: "Thomas Edison" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "Continuous improvement is better than delayed perfection.", author: "Mark Twain" },
  { text: "The mind is not a vessel to be filled but a fire to be kindled.", author: "Plutarch" },
  { text: "Knowledge is power. Information is liberating.", author: "Kofi Annan" },
  { text: "Take the first step in faith. You don't have to see the whole staircase.", author: "Martin Luther King Jr." },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
] as const;

function useDailyQuote() {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  return STUDY_QUOTES[dayOfYear % STUDY_QUOTES.length]!;
}

function useGreeting(firstName: string): string {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const h = new Date().getHours();
    const name = firstName.split(" ")[0] ?? firstName;
    if (h >= 5 && h < 12) setGreeting(`Good morning, ${name}! ☀️`);
    else if (h < 18) setGreeting(`Good afternoon, ${name}! 🌤️`);
    else setGreeting(`Good evening, ${name}! 🌙`);
  }, [firstName]);

  return greeting;
}

function HeroHeading({ greeting }: { greeting: string }) {
  const quote = useDailyQuote();

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] shadow-[0_18px_35px_rgba(99,102,241,0.25)] transition duration-300 hover:-translate-y-0.5 hover:rotate-[-5deg] hover:scale-[1.03] dark:shadow-[0_20px_40px_rgba(6,182,212,0.2)]">
          <div className="flex items-end gap-1">
            <span className="h-5 w-1.5 rounded-full bg-white/95" />
            <span className="h-7 w-1.5 rounded-full bg-white/80" />
            <span className="h-4 w-1.5 rounded-full bg-white/70" />
          </div>
        </div>

        <div>
          <h1 className="dashboard-script-title text-4xl sm:text-5xl">
            Dashboard
          </h1>
          {greeting && (
            <p className="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">
              {greeting}
            </p>
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="mt-4 flex items-center gap-3"
      >
        <img
          src="/assets/v1/ziksi-explaining-2.png"
          alt="Ziksi mascot"
          width={64}
          height={64}
          className="hidden sm:block h-16 w-16 flex-shrink-0 object-contain drop-shadow-md"
          aria-hidden="true"
        />
        <blockquote className="border-l-2 border-brand-400/50 pl-3 dark:border-cyan-400/40">
          <p className="text-[0.8rem] italic leading-relaxed text-slate-500 dark:text-slate-400">
            &ldquo;{quote.text}&rdquo;
          </p>
          <footer className="mt-0.5 text-[0.7rem] font-semibold tracking-wide text-brand-500/70 dark:text-cyan-400/60">
            — {quote.author}
          </footer>
        </blockquote>
      </motion.div>
    </div>
  );
}

function HeroActions({ showCreateForm, onToggleCreateForm }: HeroActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <DashboardActionButton
        href="/"
        size="md"
        variant="secondary"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        <span>Back to Home</span>
      </DashboardActionButton>

      <DashboardActionButton
        onClick={onToggleCreateForm}
        size="md"
        variant="primary"
      >
        {showCreateForm ? "Close form" : "+ Create Course"}
      </DashboardActionButton>

      <DashboardActionButton
        href="/dashboard/material-finder"
        size="md"
        variant="secondary"
      >
        Material Finder
      </DashboardActionButton>
    </div>
  );
}

export function DashboardHero({
  courseCount,
  moduleCount,
  materialCount,
  pinnedCount,
  showCreateForm,
  userName,
  onToggleCreateForm,
}: DashboardHeroProps) {
  const greeting = useGreeting(userName);

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(238,242,255,0.9)_52%,rgba(236,254,255,0.9)_100%)] p-6 shadow-[0_28px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-cyan-400/12 dark:bg-[radial-gradient(circle_at_28%_30%,rgba(168,85,247,0.2)_0%,rgba(124,58,237,0.12)_20%,rgba(15,23,42,0)_46%),radial-gradient(circle_at_82%_16%,rgba(226,232,240,0.18)_0%,rgba(148,163,184,0.11)_18%,rgba(15,23,42,0)_42%),linear-gradient(160deg,rgba(15,24,48,0.98)_0%,rgba(8,16,38,0.96)_58%,rgba(5,12,28,0.98)_100%)] dark:shadow-[0_30px_90px_rgba(2,12,27,0.72),0_0_42px_rgba(6,182,212,0.06)]">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/80 to-transparent dark:via-cyan-300/80" />
      <div className="pointer-events-none absolute -left-12 top-8 h-56 w-56 rounded-full bg-brand-200/55 blur-3xl dark:bg-brand-500/16" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-cyan-200/60 blur-3xl dark:bg-cyan-500/10" />
      <div className="pointer-events-none absolute -right-6 top-[-1.25rem] hidden h-44 w-44 rounded-full bg-white/14 blur-3xl dark:block" />
      <div className="pointer-events-none absolute left-[11rem] top-[4.5rem] hidden h-36 w-36 rounded-full bg-brand-500/10 blur-3xl dark:block" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <HeroHeading greeting={greeting} />
        <HeroActions
          showCreateForm={showCreateForm}
          onToggleCreateForm={onToggleCreateForm}
        />
      </div>

      <div className="relative mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Courses" value={courseCount} />
        <StatCard label="Modules" value={moduleCount} />
        <StatCard label="Materials" value={materialCount} />
        <StatCard label="Pinned" value={pinnedCount} />
      </div>
    </section>
  );
}
