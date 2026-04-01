import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type DashboardActionVariant = "primary" | "secondary" | "danger";
type DashboardActionSize = "sm" | "md";
type DashboardPillTone = "brand" | "cyan" | "neutral" | "rose";
type DashboardPillSize = "xs" | "sm";

type DashboardActionButtonProps = {
  children: ReactNode;
  className?: string;
  size?: DashboardActionSize;
  variant?: DashboardActionVariant;
} & (
  | {
      href: string;
      disabled?: never;
      onClick?: never;
      type?: never;
    }
  | {
      href?: never;
      disabled?: boolean;
      onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
      type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
    }
);

type DashboardPillProps = {
  children: ReactNode;
  className?: string;
  size?: DashboardPillSize;
  tone?: DashboardPillTone;
};

type DashboardPillButtonProps = DashboardPillProps & {
  active?: boolean;
  onClick: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
};

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

const ACTION_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-poppins font-semibold transition will-change-transform";

const ACTION_SIZE_CLASSES: Record<DashboardActionSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
};

const ACTION_VARIANT_CLASSES: Record<DashboardActionVariant, string> = {
  primary:
    "bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] text-white shadow-[0_16px_34px_rgba(99,102,241,0.2)] hover:-translate-y-0.5 hover:shadow-[0_22px_42px_rgba(99,102,241,0.28)] disabled:cursor-not-allowed disabled:opacity-50",
  secondary:
    "border border-white/80 bg-white/92 text-slate-700 shadow-sm backdrop-blur hover:-translate-y-0.5 hover:border-brand-300/70 hover:bg-white hover:text-brand-700 dark:border-cyan-400/15 dark:bg-slate-950/55 dark:text-slate-200 dark:hover:border-cyan-400/30 dark:hover:bg-slate-950 dark:hover:text-cyan-200",
  danger:
    "border border-slate-300 bg-white/92 text-slate-500 shadow-sm hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-950/55 dark:text-slate-300 dark:hover:border-rose-400/30 dark:hover:bg-rose-500/10 dark:hover:text-rose-300",
};

const PILL_SIZE_CLASSES: Record<DashboardPillSize, string> = {
  xs: "px-2.5 py-1 text-[11px]",
  sm: "px-3 py-1.5 text-xs",
};

const PILL_ACTIVE_CLASSES: Record<DashboardPillTone, string> = {
  brand:
    "border-brand-200/80 bg-brand-50/90 text-brand-700 dark:border-brand-400/20 dark:bg-brand-500/10 dark:text-brand-200",
  cyan:
    "border-cyan-200/80 bg-cyan-50/90 text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-500/10 dark:text-cyan-200",
  neutral:
    "border-slate-200/80 bg-slate-100/90 text-slate-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200",
  rose:
    "border-rose-200/80 bg-rose-50/90 text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200",
};

const PILL_IDLE_CLASSES =
  "border-slate-200/80 bg-white/90 text-slate-700 hover:-translate-y-0.5 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950/55 dark:text-slate-200 dark:hover:bg-slate-900/80";

export function DashboardActionButton(props: DashboardActionButtonProps) {
  const {
    children,
    className,
    size = "sm",
    variant = "secondary",
  } = props;

  const resolvedClassName = joinClasses(
    ACTION_BASE,
    ACTION_SIZE_CLASSES[size],
    ACTION_VARIANT_CLASSES[variant],
    className
  );

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={resolvedClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={props.disabled}
      className={resolvedClassName}
    >
      {children}
    </button>
  );
}

export function DashboardPill({
  children,
  className,
  size = "xs",
  tone = "neutral",
}: DashboardPillProps) {
  return (
    <span
      className={joinClasses(
        "inline-flex items-center gap-1 rounded-full border font-poppins font-semibold transition",
        PILL_SIZE_CLASSES[size],
        PILL_ACTIVE_CLASSES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function DashboardPillButton({
  active = false,
  children,
  className,
  onClick,
  size = "sm",
  tone = "brand",
  type = "button",
}: DashboardPillButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={joinClasses(
        "inline-flex items-center gap-1 rounded-full border font-poppins font-semibold transition",
        PILL_SIZE_CLASSES[size],
        active ? PILL_ACTIVE_CLASSES[tone] : PILL_IDLE_CLASSES,
        className
      )}
    >
      {children}
    </button>
  );
}
