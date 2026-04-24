import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { apiDocsHighlights, apiDocsSections, type ApiDocMethod } from "./api-docs-content";

const methodTone: Record<ApiDocMethod, string> = {
  GET: "bg-cyan-500/12 text-cyan-700 ring-cyan-500/20 dark:bg-cyan-400/12 dark:text-cyan-200 dark:ring-cyan-400/20",
  POST: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/20 dark:bg-emerald-400/12 dark:text-emerald-200 dark:ring-emerald-400/20",
  PUT: "bg-amber-500/12 text-amber-700 ring-amber-500/20 dark:bg-amber-400/12 dark:text-amber-200 dark:ring-amber-400/20",
  PATCH: "bg-violet-500/12 text-violet-700 ring-violet-500/20 dark:bg-violet-400/12 dark:text-violet-200 dark:ring-violet-400/20",
  DELETE: "bg-rose-500/12 text-rose-700 ring-rose-500/20 dark:bg-rose-400/12 dark:text-rose-200 dark:ring-rose-400/20",
};

function MethodBadge({ method }: { method: ApiDocMethod }) {
  return (
    <span
      className={`inline-flex min-w-16 justify-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ring-1 ${methodTone[method]}`}
    >
      {method}
    </span>
  );
}

function ExampleBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-950 px-4 py-3 text-xs leading-6 text-slate-100 dark:border-slate-800">
        <code>{value}</code>
      </pre>
    </div>
  );
}

export function ApiDocsPage({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_32%,#ffffff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#071120_42%,#020617_100%)]">
      <Navbar isAuthenticated={isAuthenticated} />

      <main className="overflow-x-hidden">
        <section className="border-b border-slate-200/70 bg-white/70 px-4 py-14 backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/40 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl space-y-5 sm:space-y-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-cyan-300 sm:text-sm">
                  StudyHub REST API
                </p>
                <h1 className="home-display-title text-[2.35rem] sm:text-5xl">
                  API Docs
                </h1>
                <p className="text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8">
                  A public reference for the main StudyHub endpoints used by the Next.js web app,
                  the Expo mobile app, and backend lesson demos. This page mirrors the repo-level
                  contract in <code>docs/api-contract.md</code> and focuses on the flows most useful
                  during defense and manual testing.
                </p>
              </div>

              <div className="flex justify-start lg:justify-end">
                <ThemeToggle />
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 xl:grid-cols-3">
              {apiDocsHighlights.map((item) => (
                <div
                  key={item.label}
                  className="h-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-4 shadow-sm dark:border-white/10 dark:bg-slate-900/70 sm:px-5 sm:py-5"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-3 break-words text-base font-semibold text-slate-900 dark:text-white">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {item.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {apiDocsSections.map((section) => (
          <section
            key={section.title}
            className="border-b border-slate-200/70 px-4 py-12 dark:border-white/10 sm:px-6 sm:py-16"
          >
            <div className="mx-auto max-w-6xl">
              <div className="max-w-2xl space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600 dark:text-cyan-300 sm:text-sm">
                  {section.eyebrow}
                </p>
                <h2 className="home-ink-title text-[1.9rem] sm:text-3xl">
                  {section.title}
                </h2>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                  {section.description}
                </p>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {section.endpoints.map((endpoint) => (
                  <article
                    key={`${endpoint.method}-${endpoint.path}`}
                    className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm dark:border-white/10 dark:bg-slate-900/70 sm:px-5 sm:py-5"
                  >
                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                      <MethodBadge method={endpoint.method} />
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                        {endpoint.auth}
                      </span>
                    </div>

                    <p className="mt-4 break-all font-mono text-xs font-semibold text-slate-900 dark:text-white sm:text-sm">
                      {endpoint.path}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {endpoint.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {endpoint.statusCodes.map((status) => (
                        <span
                          key={status}
                          className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {status}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6 space-y-4">
                      {endpoint.requestExample ? (
                        <ExampleBlock label="Request Example" value={endpoint.requestExample} />
                      ) : null}
                      <ExampleBlock label="Response Example" value={endpoint.responseExample} />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ))}

        <section className="px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto flex max-w-6xl flex-col gap-5 rounded-2xl border border-slate-200 bg-white/90 px-4 py-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70 sm:px-6 sm:py-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-cyan-300 sm:text-sm">
                Manual Testing
              </p>
              <p className="text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                Use the repository contract doc together with the Postman collection in
                <code> docs/StudyHub.postman_collection.json</code> for a live backend demo.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(99,102,241,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(99,102,241,0.28)] sm:w-auto"
              >
                Back Home
              </Link>
              <Link
                href="/contact"
                className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-400 hover:text-brand-600 dark:border-white/15 dark:text-slate-200 dark:hover:border-cyan-300 dark:hover:text-cyan-200 sm:w-auto"
              >
                Contact
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
