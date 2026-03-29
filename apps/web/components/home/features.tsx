"use client";

import { useScrollReveal } from "./use-scroll-reveal";

const FEATURES = [
  {
    title: "Курсове и модули",
    description:
      "Организирай знанията йерархично: курс → модул → материали. Всяка тема на точното място.",
    gradient: "from-brand-500 to-purple-500",
    glow: "group-hover:shadow-brand-500/20",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    title: "Всякакви материали",
    description:
      "Бележки, файлове и връзки — всичко с цветни иконки и типов badge, за да ги различаваш веднага.",
    gradient: "from-cyan-400 to-blue-500",
    glow: "group-hover:shadow-cyan-500/20",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
  {
    title: "Тагове и търсене",
    description:
      "Добавяй тагове към материали и ги филтрирай с едно кликване. Намери всичко мигновено.",
    gradient: "from-amber-400 to-orange-500",
    glow: "group-hover:shadow-amber-500/20",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
      </svg>
    ),
  },
  {
    title: "Любими",
    description:
      "Закачай важните материали в Favorites, за да имаш бърз достъп до тях от dashboard-а.",
    gradient: "from-rose-400 to-pink-500",
    glow: "group-hover:shadow-rose-500/20",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      </svg>
    ),
  },
  {
    title: "Защитен профил",
    description:
      "Всичко е зад защитен профил с JWT. Само ти виждаш своите материали.",
    gradient: "from-emerald-400 to-green-500",
    glow: "group-hover:shadow-emerald-500/20",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    title: "Мобилно приложение",
    description:
      "Достъп до курсовете от телефона с React Native + Expo. Същият backend, навсякъде.",
    gradient: "from-violet-400 to-indigo-500",
    glow: "group-hover:shadow-violet-500/20",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
  },
];

const STAGGER_CLASSES = ["stagger-0", "stagger-1", "stagger-2", "stagger-3", "stagger-4", "stagger-5"];

function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const { ref, visible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl border border-white/60 bg-white/70 p-7 backdrop-blur-sm transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl dark:border-white/[0.06] dark:bg-white/[0.04] dark:backdrop-blur-md ${feature.glow} ${visible ? `translate-y-0 opacity-100 ${STAGGER_CLASSES[index]}` : "translate-y-8 opacity-0"}`}
    >
      {/* Glow border on hover */}
      <div className={`pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-20`} />

      <div className="relative">
        <div className={`mb-5 inline-flex rounded-xl bg-gradient-to-br ${feature.gradient} p-3 text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
          {feature.icon}
        </div>
        <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
          {feature.title}
        </h3>
        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {feature.description}
        </p>
      </div>
    </div>
  );
}

export function HomeFeatures() {
  const { ref: headingRef, visible: headingVisible } = useScrollReveal();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-indigo-50/50 py-28 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Decorative blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-brand-500/[0.06] blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-cyan-500/[0.06] blur-[120px]" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          ref={headingRef}
          className={`mb-16 text-center transition-all duration-700 ${headingVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <span className="mb-4 inline-block text-sm font-bold uppercase tracking-[0.2em] text-brand-500">
            Функции
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
            Всичко, от което се нуждаеш
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-500 dark:text-slate-400 sm:text-lg">
            Мощни инструменти, за да учиш по-организирано и ефективно.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
