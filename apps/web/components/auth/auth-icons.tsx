import type { ComponentPropsWithoutRef } from "react";

type AuthIconProps = ComponentPropsWithoutRef<"svg">;

function buildIconClassName(className?: string): string {
  return ["h-5 w-5", className].filter(Boolean).join(" ");
}

export function ArrowLeftIcon({ className, ...props }: AuthIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={buildIconClassName(className)}
      {...props}
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

export function EmailIcon({ className, ...props }: AuthIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={buildIconClassName(className)}
      {...props}
    >
      <rect x="3.5" y="5" width="17" height="14" rx="3" />
      <path d="m4.5 7.5 6.8 5a1.2 1.2 0 0 0 1.4 0l6.8-5" />
    </svg>
  );
}

export function UserIcon({ className, ...props }: AuthIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={buildIconClassName(className)}
      {...props}
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19a7 7 0 0 1 14 0" />
    </svg>
  );
}

export function LockIcon({ className, ...props }: AuthIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={buildIconClassName(className)}
      {...props}
    >
      <rect x="4.5" y="10" width="15" height="10" rx="3" />
      <path d="M8 10V7.8a4 4 0 1 1 8 0V10" />
      <path d="M12 13.2v3.6" />
    </svg>
  );
}

export function MoonIcon({ className, ...props }: AuthIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={buildIconClassName(className)}
      {...props}
    >
      <path d="M20 14.2A7.8 7.8 0 1 1 9.8 4 6.3 6.3 0 0 0 20 14.2Z" />
    </svg>
  );
}

export function SunIcon({ className, ...props }: AuthIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={buildIconClassName(className)}
      {...props}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2" />
      <path d="M12 19.3v2.2" />
      <path d="m4.9 4.9 1.6 1.6" />
      <path d="m17.5 17.5 1.6 1.6" />
      <path d="M2.5 12h2.2" />
      <path d="M19.3 12h2.2" />
      <path d="m4.9 19.1 1.6-1.6" />
      <path d="m17.5 6.5 1.6-1.6" />
    </svg>
  );
}

export function GoogleIcon({ className, ...props }: AuthIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={buildIconClassName(className)}
      aria-hidden="true"
      {...props}
    >
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.22-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.62v3h3.86c2.26-2.08 3.58-5.16 3.58-8.65Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.86-3c-1.07.72-2.43 1.15-4.08 1.15-3.13 0-5.79-2.11-6.74-4.95H1.27v3.09A11.98 11.98 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC04"
        d="M5.26 14.3A7.2 7.2 0 0 1 4.88 12c0-.8.14-1.57.38-2.3V6.61H1.27A12 12 0 0 0 0 12c0 1.93.46 3.76 1.27 5.39l3.99-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.58 1.79l3.43-3.43C17.94 1.17 15.23 0 12 0A11.98 11.98 0 0 0 1.27 6.61L5.26 9.7c.95-2.84 3.61-4.93 6.74-4.93Z"
      />
    </svg>
  );
}
