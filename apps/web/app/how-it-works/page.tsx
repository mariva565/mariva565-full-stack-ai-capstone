import Image from "next/image";
import Link from "next/link";

import { Navbar } from "../../components/layout/Navbar";
import { ScrollToTop } from "../../components/ui/scroll-to-top";

const PRINCIPLES = [
  "One clear structure",
  "Notes, links, and files together",
  "Easy to reopen later",
];

const STEPS = [
  {
    number: "01",
    title: "Start with one course",
    description:
      "Create a course for a subject, semester, exam prep, or client project. Give it a clear title so the workspace already feels intentional.",
    tags: ["Private workspace", "Fast setup"],
  },
  {
    number: "02",
    title: "Break it into modules",
    description:
      "Split the big topic into weeks, chapters, or themes. That keeps each space smaller, calmer, and easier to scan when you come back later.",
    tags: ["Flexible order", "Less clutter"],
  },
  {
    number: "03",
    title: "Add the right materials",
    description:
      "Save notes, files, and links exactly under the module where they belong. Everything stays close to the topic instead of scattered across tabs.",
    tags: ["Notes", "Links", "Files"],
  },
  {
    number: "04",
    title: "Pick up where you left off",
    description:
      "Reopen from the dashboard, favorites, pinned items, and progress views without hunting through folders again.",
    tags: ["Favorites", "Pinned", "Progress"],
  },
];

const HIGHLIGHTS = [
  {
    title: "Built for real study flow",
    description:
      "The structure stays the same from dashboard to course to material, so the app feels predictable instead of noisy.",
  },
  {
    title: "Made for mixed material types",
    description:
      "A quick note, a shared drive file, and a useful link can live side by side inside the same learning path.",
  },
  {
    title: "Calmer than a folder maze",
    description:
      "You always know whether something belongs at course level, module level, or inside a single material detail page.",
  },
];

function StepCard({
  number,
  title,
  description,
  tags,
}: {
  number: string;
  title: string;
  description: string;
  tags: string[];
}) {
  return (
    <article className="group flex h-full flex-col rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(99,102,241,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_28px_80px_rgba(99,102,241,0.14)] dark:border-white/10 dark:bg-slate-900/75 dark:hover:border-indigo-400/40">
      <div className="flex items-center justify-between gap-4">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 text-sm font-bold tracking-[0.2em] text-white shadow-[0_16px_36px_rgba(99,102,241,0.28)]">
          {number}
        </span>
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
          Simple step
        </span>
      </div>

      <h2 className="mt-6 text-2xl text-slate-900 dark:text-white">
        <span className="home-ink-title">{title}</span>
      </h2>
      <p className="mt-4 flex-1 text-base leading-7 text-slate-600 dark:text-slate-300">
        {description}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:border-indigo-400/20 dark:bg-indigo-500/10 dark:text-indigo-200"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

function HighlightCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-[1.8rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55">
      <h2 className="text-2xl text-slate-900 dark:text-white">
        <span className="home-ink-title">{title}</span>
      </h2>
      <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </article>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-purple-50 p-4 transition-colors duration-500 dark:bg-slate-950 md:p-8">
      <main className="relative flex min-h-screen flex-col overflow-hidden rounded-[2.5rem] border border-white/60 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950 md:rounded-[4rem]">
        <ScrollToTop />

        <div className="relative z-10 flex w-full flex-col">
          <Navbar />

          <section className="relative overflow-hidden px-6 pb-20 pt-16 sm:px-8 lg:px-12">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.14),transparent_28%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.16),transparent_28%)]" />
            <div className="relative grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="max-w-2xl">
                <span className="inline-flex items-center rounded-full border border-indigo-200/80 bg-white/85 px-5 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-indigo-600 shadow-[0_10px_30px_rgba(99,102,241,0.08)] dark:border-indigo-400/20 dark:bg-slate-900/80 dark:text-indigo-200">
                  Public walkthrough
                </span>

                <h1 className="mt-6 text-5xl leading-[1.04] text-slate-900 dark:text-white sm:text-6xl">
                  See how{" "}
                  <span className="home-display-title">Study Hub</span>
                  {" "}turns study chaos into a calmer flow.
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                  Start with one course, split it into modules, save your notes
                  and resources where they belong, and reopen everything
                  without digging through folders again.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link href="/register" className="btn-gradient-primary">
                    Start Organizing
                  </Link>
                  <Link
                    href="/#features"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 px-7 py-3 text-sm font-semibold text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600 dark:border-white/10 dark:bg-slate-900/75 dark:text-slate-200 dark:hover:border-indigo-400/40 dark:hover:text-indigo-200"
                  >
                    Back to Home Features
                  </Link>
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  {PRINCIPLES.map((principle) => (
                    <div
                      key={principle}
                      className="rounded-[1.5rem] border border-white/70 bg-white/75 px-4 py-4 text-sm font-semibold text-slate-600 shadow-[0_14px_32px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200"
                    >
                      {principle}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="absolute h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.22),transparent_68%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(34,211,238,0.2),transparent_68%)]" />
                <div className="relative w-full max-w-[32rem] overflow-hidden rounded-[2.8rem] border border-white/70 bg-white/80 p-6 shadow-[0_30px_90px_rgba(99,102,241,0.14)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75">
                  <div className="absolute inset-x-6 top-5 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent dark:via-indigo-400/40" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.8),transparent_50%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_50%)]" />
                  <Image
                    src="/assets/v1/about-mascot.png"
                    alt="Study Hub mascot"
                    width={640}
                    height={640}
                    priority
                    className="relative z-10 mx-auto h-auto w-full max-w-[22rem] object-contain drop-shadow-[0_22px_50px_rgba(99,102,241,0.16)]"
                  />
                  <div className="relative z-10 mt-4 rounded-[2rem] border border-white/70 bg-white/85 p-5 dark:border-white/10 dark:bg-slate-950/65">
                    <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                      The goal is not just to save materials, but to keep them
                      in a structure that still makes sense a week later.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="px-6 pb-8 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-sm font-bold uppercase tracking-[0.24em] text-indigo-500">
                1-2-3-4 flow
              </span>
              <h2 className="mt-4 text-4xl text-slate-900 dark:text-white sm:text-5xl">
                <span className="home-display-title">
                  Four steps, one mental model
                </span>
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-500 dark:text-slate-400">
                The page structure follows the same idea everywhere, so each
                next action feels obvious instead of hidden.
              </p>
            </div>

            <div className="mt-12 grid gap-6 xl:grid-cols-4">
              {STEPS.map((step) => (
                <StepCard key={step.number} {...step} />
              ))}
            </div>
          </section>

          <section className="px-6 pb-20 sm:px-8 lg:px-12">
            <div className="rounded-[2.8rem] border border-white/70 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-8 shadow-[0_24px_72px_rgba(99,102,241,0.08)] dark:border-white/10 dark:from-slate-900 dark:via-slate-950 dark:to-cyan-950/20">
              <div className="max-w-2xl">
                <span className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300">
                  Why it feels better
                </span>
                <h2 className="mt-4 text-4xl text-slate-900 dark:text-white sm:text-5xl">
                  <span className="home-display-title">
                    Less hunting, more actual studying
                  </span>
                </h2>
              </div>

              <div className="mt-10 grid gap-6 lg:grid-cols-3">
                {HIGHLIGHTS.map((highlight) => (
                  <HighlightCard key={highlight.title} {...highlight} />
                ))}
              </div>
            </div>
          </section>

          <section className="px-6 pb-16 sm:px-8 lg:px-12">
            <div className="rounded-[2.8rem] bg-slate-950 px-8 py-10 text-white shadow-[0_24px_80px_rgba(15,23,42,0.26)] dark:bg-slate-900">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <span className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-300">
                    Ready to try it
                  </span>
                  <h2 className="mt-4 text-4xl text-white sm:text-5xl">
                    Organize your next subject with a structure that lasts.
                  </h2>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link href="/login" className="btn-explore-features">
                    Open Login
                  </Link>
                  <Link href="/register" className="btn-gradient-primary">
                    Create Account
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
