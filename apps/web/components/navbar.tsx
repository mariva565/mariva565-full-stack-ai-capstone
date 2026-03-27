"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type User = {
  name: string;
  role: string;
};

const PUBLIC_PATHS = ["/", "/login", "/register"];

export function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (PUBLIC_PATHS.includes(pathname)) return;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, [pathname]);

  if (PUBLIC_PATHS.includes(pathname)) return null;

  function handleLogout() {
    fetch("/api/auth/logout", { method: "POST" }).then(() => {
      window.location.href = "/login";
    });
  }

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "Profile" },
  ];

  if (user?.role === "admin") {
    links.push({ href: "/admin", label: "Admin" });
  }

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="text-lg font-bold text-brand-500 dark:text-brand-100"
        >
          StudyHub
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname.startsWith(link.href)
                  ? "bg-brand-500/10 text-brand-500 dark:text-brand-100"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="ml-2 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}
