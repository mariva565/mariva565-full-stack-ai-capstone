import type { ChangeEventHandler, ReactNode } from "react";

type AuthIconFieldProps = {
  id: string;
  label: string;
  type: "email" | "password" | "text";
  value: string;
  placeholder: string;
  icon: ReactNode;
  onChange: ChangeEventHandler<HTMLInputElement>;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
};

export function AuthIconField({
  id,
  label,
  type,
  value,
  placeholder,
  icon,
  onChange,
  autoComplete,
  minLength,
  required = true,
}: AuthIconFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-[0.78rem] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"
      >
        {label}
      </label>

      <div className="flex items-center gap-3 rounded-[1.35rem] border border-white/60 bg-white/80 px-4 py-2.5 shadow-sm backdrop-blur-sm transition duration-200 focus-within:-translate-y-px focus-within:border-brand-400 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.15)] dark:border-white/10 dark:bg-slate-800/80 dark:focus-within:border-brand-400 dark:focus-within:bg-slate-800 dark:focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.2)]">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 via-fuchsia-50 to-cyan-50 text-brand-700 dark:from-brand-500/20 dark:via-fuchsia-500/10 dark:to-cyan-500/10 dark:text-brand-100">
          {icon}
        </span>

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          minLength={minLength}
          required={required}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
      </div>
    </div>
  );
}
