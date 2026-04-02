import type { ComponentPropsWithoutRef } from "react";

type ActionIconProps = ComponentPropsWithoutRef<"svg"> & {
  filled?: boolean;
};

function iconClassName(className?: string): string {
  return ["h-4 w-4", className].filter(Boolean).join(" ");
}

export function PinAngleIcon({ className, filled = false, ...props }: ActionIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={iconClassName(className)}
      {...props}
    >
      <path
        d="M9.25 5.25h5.5v2.15l1.95 1.9H13v4.15l1.4 2.05H9.6l1.4-2.05V9.3H7.3l1.95-1.9V5.25Z"
        fill={filled ? "currentColor" : "none"}
        fillOpacity={filled ? 0.18 : undefined}
      />
      <path d="M12 15.5v5" />
    </svg>
  );
}

export function ArrowUpIcon({ className, ...props }: ActionIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={iconClassName(className)}
      {...props}
    >
      <path d="M12 18V6" />
      <path d="m7.5 10.5 4.5-4.5 4.5 4.5" />
    </svg>
  );
}

export function ArrowDownIcon({ className, ...props }: ActionIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={iconClassName(className)}
      {...props}
    >
      <path d="M12 6v12" />
      <path d="m7.5 13.5 4.5 4.5 4.5-4.5" />
    </svg>
  );
}
