"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { getProfileInitials } from "@/lib/profile";
import { ThemeToggle } from "./theme/theme-toggle";

type NavbarUser = {
  name: string;
  role: string;
  avatarUrl?: string | null;
};

type NavbarClientProps = {
  initialUser: NavbarUser | null;
};

const PUBLIC_PATHS = ["/", "/login", "/register", "/how-it-works", "/contact"];

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <path d="M15 7.5V5.75A1.75 1.75 0 0 0 13.25 4h-6.5A1.75 1.75 0 0 0 5 5.75v12.5A1.75 1.75 0 0 0 6.75 20h6.5A1.75 1.75 0 0 0 15 18.25V16.5" />
      <path d="M10 12h9" />
      <path d="m16 8 4 4-4 4" />
    </svg>
  );
}

function BrandMark() {
  return (
    <span className="relative flex h-[3.2rem] w-[3.2rem] shrink-0 items-center justify-center overflow-visible">
      <span className="pointer-events-none absolute -inset-[0.08rem] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.18)_0%,rgba(99,102,241,0.14)_34%,rgba(168,85,247,0.08)_54%,rgba(34,211,238,0)_78%)] opacity-90 blur-[19px] transition duration-300 group-hover:opacity-100 group-hover:blur-[22px]" />
      <span className="pointer-events-none absolute left-[0.28rem] top-[0.32rem] h-[1.05rem] w-[1.05rem] rounded-full bg-cyan-300/20 blur-[12px] transition duration-300 group-hover:bg-cyan-200/24" />
      <span className="pointer-events-none absolute right-[0.24rem] bottom-[0.38rem] h-[1.15rem] w-[1.15rem] rounded-full bg-violet-400/16 blur-[13px] transition duration-300 group-hover:bg-violet-300/20" />
      <span className="pointer-events-none absolute inset-[0.62rem] rounded-full bg-cyan-400/10 blur-[16px] transition duration-300 group-hover:bg-cyan-300/12" />
      <Image
        src="/assets/v1/icons/mascot-logo-navbar-filled.png"
        alt="StudyHub mascot"
        width={70}
        height={93}
        className="relative z-10 h-[3.02rem] w-auto object-contain drop-shadow-[0_8px_18px_rgba(15,23,42,0.14)] transition duration-300 group-hover:-translate-y-[1px] group-hover:scale-[1.015] dark:drop-shadow-[0_10px_22px_rgba(6,182,212,0.08)]"
      />
    </span>
  );
}

export function NavbarClient({ initialUser }: NavbarClientProps) {
  const pathname = usePathname();
  const user = initialUser;

  if (PUBLIC_PATHS.includes(pathname)) {
    return null;
  }

  function handleLogout() {
    fetch("/api/auth/logout", { method: "POST" }).then(() => {
      window.location.href = "/login";
    });
  }

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/progress", label: "Progress" },
    { href: "/calendar", label: "Calendar" },
    { href: "/profile", label: "Profile" },
  ];

  if (user?.role === "admin") {
    links.push({ href: "/admin", label: "Admin" });
  }

  const userInitials = getProfileInitials(user?.name ?? "Study Hub");
  const roleLabel = user?.role === "admin" ? "Administrator" : "Student";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-cyan-400/10 dark:bg-[linear-gradient(180deg,rgba(2,8,22,0.94)_0%,rgba(3,11,28,0.88)_100%)]">
      <nav className="font-poppins mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="group inline-flex items-center gap-3">
          <BrandMark />
          <span className="inline-block bg-[linear-gradient(135deg,#8b5cf6,#ec4899)] bg-[length:100%_100%] bg-no-repeat bg-clip-text pb-[0.16em] font-shantell text-[1.6rem] font-bold leading-[1.05] text-transparent [-webkit-text-fill-color:transparent] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-[1.02] dark:bg-[linear-gradient(135deg,#dccbff_0%,#c79dff_48%,#f4b4da_100%)]">
            StudyHub
          </span>
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                pathname.startsWith(link.href)
                  ? "bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] text-white shadow-[0_12px_30px_rgba(99,102,241,0.22)]"
                  : "text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <ThemeToggle />

          <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/85 px-2 py-1.5 shadow-sm transition dark:border-cyan-400/10 dark:bg-slate-950/60">
            <Link
              href="/profile"
              className="group flex min-w-0 items-center gap-3 rounded-full px-1 py-0.5 transition hover:-translate-y-0.5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-500 via-fuchsia-500 to-cyan-400 text-xs font-black text-white shadow-[0_10px_25px_rgba(99,102,241,0.25)]">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  userInitials
                )}
              </span>

              <span className="hidden min-w-0 text-left sm:block">
                <span className="block truncate text-sm font-semibold leading-4 text-slate-800 group-hover:text-brand-700 dark:text-slate-100 dark:group-hover:text-cyan-200">
                  {user?.name ?? "My Profile"}
                </span>
                <span className="mt-0.5 block truncate text-[0.76rem] leading-4 text-slate-500 dark:text-slate-400">
                  {roleLabel}
                </span>
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex h-10 w-14 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-400 transition hover:-translate-y-0.5 hover:bg-rose-100 hover:text-rose-500 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/15 dark:hover:text-rose-200"
              title="Logout"
              aria-label="Logout"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
