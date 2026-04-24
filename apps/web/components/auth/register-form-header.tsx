import Link from "next/link";

export function RegisterFormHeader() {
  return (
    <div className="mb-4 text-center sm:mb-5">
      <h1 className="text-[1.95rem] font-bold text-slate-900 dark:text-white font-shantell sm:text-[2.2rem]">
        Join StudyHub
      </h1>

      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
        Start your learning journey today.
      </p>

      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
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
