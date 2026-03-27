import Link from "next/link";

const links = [
  { href: "/register", label: "Register" },
  { href: "/login", label: "Login" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/courses/1", label: "Course Details" },
  { href: "/materials/1", label: "Material View/Edit" },
  { href: "/profile", label: "Profile" },
  { href: "/admin", label: "Admin Panel" }
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-8 px-6 py-12">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">StudyHub v2</p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Phase 0 Skeleton</h1>
        <p className="text-slate-600">Starter routes for all required web screens.</p>
      </div>
      <nav className="grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
