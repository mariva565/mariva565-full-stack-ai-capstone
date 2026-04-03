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
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-2">
            {index > 0 ? <span className="text-slate-300 dark:text-slate-600">/</span> : null}
            {item.href ? (
              <Link
                href={item.href}
                className="truncate text-slate-500 transition hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-100"
              >
                {item.label}
              </Link>
            ) : (
              <span className="truncate text-slate-700 dark:text-slate-200">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
