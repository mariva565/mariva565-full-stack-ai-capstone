type ScreenPlaceholderProps = {
  title: string;
  description: string;
};

export function ScreenPlaceholder({ title, description }: ScreenPlaceholderProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-start justify-center gap-4 px-6 py-12">
      <p className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
        StudyHub v2
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
      <p className="max-w-prose text-base text-slate-600">{description}</p>
    </main>
  );
}
