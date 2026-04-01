import type { ChangeEventHandler, ReactNode } from "react";

type ProfileFieldProps = {
  id: string;
  label: string;
  type: "email" | "password" | "text" | "url";
  value: string;
  icon: ReactNode;
  placeholder?: string;
  helperText?: string;
  autoComplete?: string;
  minLength?: number;
  readOnly?: boolean;
  required?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

export function ProfileField({
  id,
  label,
  type,
  value,
  icon,
  placeholder,
  helperText,
  autoComplete,
  minLength,
  readOnly = false,
  required = true,
  onChange,
}: ProfileFieldProps) {
  const shellClassName = readOnly
    ? "border-slate-200/80 bg-slate-50/80 dark:border-slate-700/80 dark:bg-slate-900/60"
    : "border-white/70 bg-white/85 shadow-sm focus-within:-translate-y-px focus-within:border-brand-400 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.14)] dark:border-white/10 dark:bg-slate-800/80 dark:focus-within:border-brand-400 dark:focus-within:bg-slate-800 dark:focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.2)]";

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-[0.78rem] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"
      >
        {label}
      </label>

      <div
        className={`flex items-center gap-3 rounded-[1.35rem] border px-4 py-2.5 backdrop-blur-sm transition duration-200 ${shellClassName}`}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 via-fuchsia-50 to-cyan-50 text-brand-700 dark:from-brand-500/20 dark:via-fuchsia-500/10 dark:to-cyan-500/10 dark:text-brand-100">
          {icon}
        </span>

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          autoComplete={autoComplete}
          minLength={minLength}
          required={required}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 read-only:cursor-default dark:text-slate-100 dark:placeholder:text-slate-500"
        />
      </div>

      {helperText ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}
