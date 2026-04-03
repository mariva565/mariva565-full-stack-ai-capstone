import Link from "next/link";

type WayfindingBreadcrumbItem = {
  label: string;
  href?: string;
};

type WayfindingBreadcrumbsProps = {
  items: WayfindingBreadcrumbItem[];
};

export function WayfindingBreadcrumbs({ items }: WayfindingBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-2">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 ? (
              <svg
                className="h-4 w-4 flex-shrink-0 text-slate-300 dark:text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            ) : null}
            {item.href ? (
              <Link
                href={item.href}
                className="flex items-center rounded-lg border border-transparent px-2.5 py-1.5 text-slate-500 transition hover:bg-white/60 hover:text-brand-600 hover:border-slate-200 hover:shadow-sm dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-brand-300 dark:hover:border-slate-700"
              >
                <span className="truncate max-w-[150px] sm:max-w-xs">{item.label}</span>
              </Link>
            ) : (
              <span className="flex items-center rounded-lg border border-slate-200 bg-white/60 px-3 py-1.5 text-slate-800 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800/80 dark:text-white">
                <span className="truncate max-w-[150px] sm:max-w-xs">{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
