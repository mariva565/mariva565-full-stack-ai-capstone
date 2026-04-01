import type { ComponentPropsWithoutRef } from "react";

type ProfileIconProps = ComponentPropsWithoutRef<"svg">;

function iconClassName(className?: string): string {
  return ["h-5 w-5", className].filter(Boolean).join(" ");
}

export function CameraIcon({ className, ...props }: ProfileIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={iconClassName(className)}
      {...props}
    >
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H8l1.2-1.7A1.8 1.8 0 0 1 10.7 3.5h2.6a1.8 1.8 0 0 1 1.5.8L16 6h1.5A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5Z" />
      <circle cx="12" cy="12" r="3.6" />
    </svg>
  );
}

export function CalendarIcon({ className, ...props }: ProfileIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={iconClassName(className)}
      {...props}
    >
      <rect x="3.5" y="5.5" width="17" height="15" rx="3" />
      <path d="M8 3.5v4" />
      <path d="M16 3.5v4" />
      <path d="M3.5 9.5h17" />
    </svg>
  );
}

export function LinkIcon({ className, ...props }: ProfileIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={iconClassName(className)}
      {...props}
    >
      <path d="M10.5 13.5 13.5 10.5" />
      <path d="M8.1 15.9 6.4 17.6a3 3 0 1 1-4.2-4.2L6 9.6a3 3 0 0 1 4.2 0" />
      <path d="m15.9 8.1 1.7-1.7a3 3 0 0 1 4.2 4.2L18 14.4a3 3 0 0 1-4.2 0" />
    </svg>
  );
}

export function ShieldIcon({ className, ...props }: ProfileIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={iconClassName(className)}
      {...props}
    >
      <path d="M12 3.8c2.5 2 5.3 2.6 7 2.8v4.8c0 4.1-2.2 7.8-7 9.8-4.8-2-7-5.7-7-9.8V6.6c1.7-.2 4.5-.8 7-2.8Z" />
      <path d="m9.6 12.3 1.7 1.7 3.2-3.4" />
    </svg>
  );
}

export function SparklesIcon({ className, ...props }: ProfileIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={iconClassName(className)}
      {...props}
    >
      <path d="M12 3.5 13.7 8l4.8 1.8L13.7 11.5 12 16l-1.7-4.5L5.5 9.8 10.3 8Z" />
      <path d="m18.5 15.5.8 2.1 2.2.9-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.9Z" />
      <path d="m5.5 14 .7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7Z" />
    </svg>
  );
}
