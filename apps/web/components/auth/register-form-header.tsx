import Link from "next/link";

export function RegisterFormHeader() {
  return (
    <div className="mb-5 text-center sm:mb-6">
      <span className="inline-flex rounded-full border border-white/60 bg-white/65 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-pink-700 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/60 dark:text-pink-200">
        Join StudyHub
      </span>

      <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white font-shantell sm:text-3xl">
        Join StudyHub
      </h1>

      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
        Start your learning journey today.
      </p>

      <p className="mt-2.5 text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-pink-600 transition-colors hover:text-pink-700 dark:text-pink-300 dark:hover:text-pink-200"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
