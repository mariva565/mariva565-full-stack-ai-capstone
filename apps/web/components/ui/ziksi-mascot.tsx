type ZiksiMascotSize = "sm" | "md" | "lg";

type ZiksiMascotProps = {
  src: string;
  size?: ZiksiMascotSize;
  className?: string;
};

const FRAME_SIZES: Record<ZiksiMascotSize, string> = {
  sm: "h-16 w-16 p-1",
  md: "h-[5.5rem] w-[5.5rem] p-1.5",
  lg: "h-32 w-32 p-2",
};

const IMAGE_SCALE: Record<ZiksiMascotSize, string> = {
  sm: "scale-[1.16]",
  md: "scale-[1.14]",
  lg: "scale-[1.1]",
};

const IMAGE_HOVER_SCALE: Record<ZiksiMascotSize, string> = {
  sm: "group-hover:scale-[1.22]",
  md: "group-hover:scale-[1.2]",
  lg: "group-hover:scale-[1.16]",
};

export function ZiksiMascot({ src, size = "md", className = "" }: ZiksiMascotProps) {
  return (
    <div className={`group relative inline-flex items-center justify-center ${className}`}>
      <div className="pointer-events-none absolute inset-[-16%] rounded-[2rem] bg-[radial-gradient(circle,rgba(99,102,241,0.16)_0%,rgba(6,182,212,0.07)_48%,transparent_72%)] opacity-70 blur-lg transition duration-500 group-hover:opacity-90 dark:bg-[radial-gradient(circle,rgba(6,182,212,0.16)_0%,rgba(99,102,241,0.08)_48%,transparent_72%)]" />

      <div
        className={`relative isolate overflow-hidden rounded-[1.6rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.94)_54%,rgba(238,242,255,0.9)_100%)] shadow-[0_16px_38px_rgba(99,102,241,0.16),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur animate-mascot-float dark:border-cyan-300/18 dark:bg-[linear-gradient(145deg,rgba(248,250,252,0.96)_0%,rgba(226,232,240,0.92)_58%,rgba(207,250,254,0.86)_100%)] dark:shadow-[0_18px_42px_rgba(6,182,212,0.16),inset_0_1px_0_rgba(255,255,255,0.55)] ${FRAME_SIZES[size]}`}
      >
        <div className="pointer-events-none absolute inset-0 z-10 rounded-[1.45rem] bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0)_36%),linear-gradient(135deg,rgba(99,102,241,0.1)_0%,rgba(6,182,212,0.08)_100%)] mix-blend-screen" />
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className={`relative h-full w-full rounded-[1.25rem] object-cover transition-transform duration-500 ease-out ${IMAGE_SCALE[size]} ${IMAGE_HOVER_SCALE[size]} group-hover:rotate-[-3deg]`}
        />
      </div>
    </div>
  );
}
