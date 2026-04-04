import Link from "next/link";

export function LoginFormHeader() {
  return (
    <div className="mb-5 text-center sm:mb-6">
      <h1 className="font-shantell inline-block bg-gradient-to-r from-brand-700 via-v1-blue to-v1-cyan bg-clip-text text-2xl font-bold text-transparent drop-shadow-[0_8px_24px_rgba(99,102,241,0.14)] dark:from-white dark:via-brand-100 dark:to-cyan-200 sm:text-3xl">
        Welcome Back
      </h1>

      <p className="mt-2.5 text-sm text-slate-500 dark:text-slate-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-indigo-600 transition-colors hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}
