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

export function CollectionIcon({ className, ...props }: ActionIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={iconClassName(className)}
      {...props}
    >
      <rect x="4.5" y="6.5" width="15" height="11" rx="2.2" />
      <path d="M8 4.5h8" />
      <path d="M8 19.5h8" />
    </svg>
  );
}

export function PencilIcon({ className, ...props }: ActionIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={iconClassName(className)}
      {...props}
    >
      <path d="M4.75 19.25h3.4l9.3-9.3a2.15 2.15 0 1 0-3.05-3.05l-9.3 9.3v3.05Z" />
      <path d="m13.1 8.2 2.7 2.7" />
    </svg>
  );
}

export function TrashIcon({ className, ...props }: ActionIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={iconClassName(className)}
      {...props}
    >
      <path d="M4.75 7.25h14.5" />
      <path d="M9.25 4.75h5.5" />
      <path d="M7.75 7.25v10a2 2 0 0 0 2 2h4.5a2 2 0 0 0 2-2v-10" />
      <path d="M10 10.25v5.5" />
      <path d="M14 10.25v5.5" />
    </svg>
  );
}

export function EyeIcon({ className, ...props }: ActionIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={iconClassName(className)}
      {...props}
    >
      <path d="M2.75 12s3.2-5.25 9.25-5.25S21.25 12 21.25 12 18.05 17.25 12 17.25 2.75 12 2.75 12Z" />
      <circle cx="12" cy="12" r="2.65" />
    </svg>
  );
}

export function ExternalLinkIcon({ className, ...props }: ActionIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={iconClassName(className)}
      {...props}
    >
      <path d="M13 5.75h5.25V11" />
      <path d="m18.25 5.75-8.5 8.5" />
      <path d="M10 7.75H7.75a2 2 0 0 0-2 2v6.5a2 2 0 0 0 2 2h6.5a2 2 0 0 0 2-2V14" />
    </svg>
  );
}
