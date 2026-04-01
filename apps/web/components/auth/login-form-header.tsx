import Link from "next/link";

export function LoginFormHeader() {
  return (
    <div className="mb-5 text-center sm:mb-6">
      <span className="inline-flex rounded-full border border-white/60 bg-white/65 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-brand-700 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/60 dark:text-brand-100">
        Study smarter
      </span>

      <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white font-shantell sm:text-3xl">
        Welcome Back
      </h1>

      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
        Please enter your details to sign in.
      </p>

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
