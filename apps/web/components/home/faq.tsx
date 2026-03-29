"use client";

import { useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
  iconColor: string;
  icon: React.ReactNode;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Безплатен ли е StudyHub?",
    answer:
      "Да, напълно безплатен. Регистрирай се с имейл и парола и веднага можеш да добавяш курсове и материали.",
    iconColor: "bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
      </svg>
    ),
  },
  {
    question: "Какви видове материали мога да добавям?",
    answer:
      "Три вида: Бележка (текст), Файл (линк към файл/облак) и Връзка (URL към ресурс). Всеки тип се визуализира с различна иконка и цвят.",
    iconColor: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
  {
    question: "Могат ли другите да виждат моите курсове?",
    answer:
      "Не — всеки потребител вижда само собствените си курсове и материали. Целият достъп е защитен с JWT автентикация.",
    iconColor: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    question: "Има ли мобилно приложение?",
    answer:
      "Да. Мобилното приложение (React Native + Expo) поддържа преглед на курсове, модули и материали, като се свързва към същия backend.",
    iconColor: "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
  },
  {
    question: "Как да организирам материалите си?",
    answer:
      "Създай Курс → добави Модул → добави Материали към модула. Използвай тагове за по-бързо търсене и Favorites за бърз достъп.",
    iconColor: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
      </svg>
    ),
  },
];

function FaqAccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-4 px-6 py-5 text-left"
        aria-expanded={open ? "true" : "false"}
      >
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.iconColor}`}>
          {item.icon}
        </span>
        <span className="flex-1 text-base font-semibold text-slate-900 dark:text-white">
          {item.question}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <p className="px-6 pb-5 pl-20 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export function HomeFaq() {
  return (
    <section className="bg-slate-50 py-24 dark:bg-slate-800/50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <span className="mb-4 inline-block text-sm font-bold uppercase tracking-widest text-brand-500">
            Подкрепа
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Често задавани въпроси
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-slate-500 dark:text-slate-400">
            Всичко, което трябва да знаеш за StudyHub.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => (
            <FaqAccordionItem key={item.question} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
