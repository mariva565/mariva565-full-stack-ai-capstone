"use client";

/**
 * SmartLinkCard — detects known service URLs (NotebookLM, YouTube, etc.)
 * and renders a branded preview card instead of a plain link button.
 */

type SmartLinkCardProps = {
  url: string;
};

type ServiceInfo = {
  name: string;
  label: string;
  description: string;
  iconSvg: React.ReactNode;
  gradient: string;
  hoverGradient: string;
  badgeText: string;
  badgeClass: string;
};

function detectService(url: string): ServiceInfo | null {
  if (url.includes("notebooklm.google.com")) {
    return {
      name: "notebooklm",
      label: "Open in NotebookLM",
      description: "AI-powered deep dive — interactive audio overview, source analysis, and Q&A",
      iconSvg: <NotebookLmIcon />,
      gradient:
        "bg-[linear-gradient(135deg,rgba(66,133,244,0.08)_0%,rgba(154,100,233,0.10)_50%,rgba(234,67,53,0.06)_100%)] dark:bg-[linear-gradient(135deg,rgba(66,133,244,0.16)_0%,rgba(154,100,233,0.14)_50%,rgba(234,67,53,0.10)_100%)]",
      hoverGradient:
        "hover:bg-[linear-gradient(135deg,rgba(66,133,244,0.14)_0%,rgba(154,100,233,0.16)_50%,rgba(234,67,53,0.10)_100%)] dark:hover:bg-[linear-gradient(135deg,rgba(66,133,244,0.22)_0%,rgba(154,100,233,0.20)_50%,rgba(234,67,53,0.14)_100%)]",
      badgeText: "AI Deep Dive",
      badgeClass:
        "bg-[linear-gradient(135deg,#4285F4,#9A64E9)] text-white",
    };
  }

  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return {
      name: "youtube",
      label: "Watch on YouTube",
      description: "Video content hosted on YouTube",
      iconSvg: <YouTubeIcon />,
      gradient:
        "bg-[linear-gradient(135deg,rgba(255,0,0,0.06)_0%,rgba(255,80,80,0.08)_100%)] dark:bg-[linear-gradient(135deg,rgba(255,0,0,0.12)_0%,rgba(255,80,80,0.14)_100%)]",
      hoverGradient:
        "hover:bg-[linear-gradient(135deg,rgba(255,0,0,0.10)_0%,rgba(255,80,80,0.14)_100%)] dark:hover:bg-[linear-gradient(135deg,rgba(255,0,0,0.18)_0%,rgba(255,80,80,0.20)_100%)]",
      badgeText: "Video",
      badgeClass: "bg-red-600 text-white",
    };
  }

  if (url.includes("softuni.bg") || url.includes("judge.softuni.bg")) {
    return {
      name: "softuni",
      label: "Open in SoftUni",
      description: "Course material from the Software University learning platform",
      iconSvg: <LearningPlatformIcon />,
      gradient:
        "bg-[linear-gradient(135deg,rgba(0,175,170,0.07)_0%,rgba(38,70,83,0.08)_100%)] dark:bg-[linear-gradient(135deg,rgba(0,175,170,0.14)_0%,rgba(38,70,83,0.16)_100%)]",
      hoverGradient:
        "hover:bg-[linear-gradient(135deg,rgba(0,175,170,0.12)_0%,rgba(38,70,83,0.14)_100%)] dark:hover:bg-[linear-gradient(135deg,rgba(0,175,170,0.20)_0%,rgba(38,70,83,0.22)_100%)]",
      badgeText: "Learning Platform",
      badgeClass: "bg-[linear-gradient(135deg,#00AFAA,#264653)] text-white",
    };
  }

  return null;
}

function NotebookLmIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none">
      <path
        d="M12 2L3 7v10l9 5 9-5V7l-9-5z"
        fill="url(#nlm-grad)"
        opacity="0.9"
      />
      <path
        d="M12 2L3 7l9 5 9-5-9-5z"
        fill="url(#nlm-grad-top)"
        opacity="0.95"
      />
      <path d="M3 7v10l9 5V12L3 7z" fill="#4285F4" opacity="0.85" />
      <path d="M21 7v10l-9 5V12l9-5z" fill="#9A64E9" opacity="0.85" />
      <defs>
        <linearGradient id="nlm-grad" x1="3" y1="2" x2="21" y2="22">
          <stop stopColor="#4285F4" />
          <stop offset="0.5" stopColor="#9A64E9" />
          <stop offset="1" stopColor="#EA4335" />
        </linearGradient>
        <linearGradient id="nlm-grad-top" x1="3" y1="2" x2="21" y2="12">
          <stop stopColor="#4285F4" />
          <stop offset="1" stopColor="#9A64E9" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function LearningPlatformIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none">
      <rect x="5" y="4" width="12" height="14" rx="3" fill="#DFF7F5" />
      <rect x="7" y="6" width="12" height="14" rx="3" fill="url(#lp-grad)" />
      <path
        d="M10 10.2h6"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.95"
      />
      <path
        d="M10 13.5h6"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.92"
      />
      <path
        d="M10 16.8h3.6"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.88"
      />
      <path
        d="M8.4 10.1l0.9 0.9 1.7-1.9"
        stroke="#0F766E"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.4 13.4l0.9 0.9 1.7-1.9"
        stroke="#0F766E"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="18.3" cy="17.7" r="3.2" fill="#264653" opacity="0.14" />
      <path
        d="M17.3 17.8l0.9 0.9 1.8-2"
        stroke="#264653"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="lp-grad" x1="7" y1="6" x2="19" y2="20">
          <stop stopColor="#00AFAA" />
          <stop offset="1" stopColor="#1F7A7A" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none">
      <rect x="2" y="4" width="20" height="16" rx="4" fill="#FF0000" />
      <path d="M10 8.5v7l6-3.5-6-3.5z" fill="white" />
    </svg>
  );
}

function ExternalArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 3h7v7M13 3L5 11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SmartLinkCard({ url }: SmartLinkCardProps) {
  const service = detectService(url);

  if (!service) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group mt-6 flex items-center gap-4 rounded-2xl border border-slate-200/80 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/60 ${service.gradient} ${service.hoverGradient}`}
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm dark:bg-slate-800/80">
        {service.iconSvg}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${service.badgeClass}`}
          >
            {service.badgeText}
          </span>
        </div>
        <p className="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
          {service.label}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {service.description}
        </p>
      </div>

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-400 transition-colors group-hover:border-slate-300 group-hover:text-slate-600 dark:border-slate-600 dark:bg-slate-800/80 dark:group-hover:border-slate-500 dark:group-hover:text-slate-300">
        <ExternalArrowIcon />
      </div>
    </a>
  );
}
