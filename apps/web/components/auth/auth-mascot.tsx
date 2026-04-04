import Image from "next/image";
import { motion } from "framer-motion";

type AuthVariant = "login" | "register";
type AuthMascotPlacement = "desktop" | "inline";

const CARD_MASCOT_SRC: Record<AuthVariant, string> = {
  login: "/assets/v1/icons/robot-logo.png",
  register: "/assets/v1/icons/robot-happy.png",
};

const CARD_GLOW_CLASS: Record<AuthVariant, string> = {
  login:
    "shadow-[0_15px_35px_rgba(99,102,241,0.15)] hover:shadow-[0_20px_40px_rgba(99,102,241,0.25)]",
  register:
    "shadow-[0_15px_35px_rgba(236,72,153,0.15)] hover:shadow-[0_20px_40px_rgba(236,72,153,0.25)]",
};

const FLOAT_GLOW_CLASS: Record<AuthVariant, string> = {
  login:
    "shadow-[0_0_30px_rgba(99,102,241,0.18),0_10px_30px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.4)]",
  register:
    "shadow-[0_0_30px_rgba(236,72,153,0.18),0_10px_30px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.4)]",
};

const SPEECH_BUBBLE_LINES = [
  "\u0417\u0434\u0440\u0430\u0432\u0435\u0439!",
  "\u041f\u0440\u0438\u044f\u0442\u043d\u043e \u0443\u0447\u0435\u043d\u0435!",
] as const;

const SPEECH_SPARKLES = [
  "-top-3 left-4 h-5 w-5 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.42)] [animation:authSparkle_1.6s_ease-in-out_infinite] dark:text-amber-300 motion-reduce:animate-none",
  "-top-1 right-6 h-3.5 w-3.5 text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.4)] [animation:authSparkle_2s_ease-in-out_0.45s_infinite] dark:text-orange-300 motion-reduce:animate-none",
] as const;

export function AuthCardMascot({ variant }: { variant: AuthVariant }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
      className="relative z-10 mx-auto mb-4 flex justify-center sm:mb-5"
    >
      <div
        className={`group h-[96px] w-[96px] overflow-hidden rounded-[1.5rem] border-4 border-white/80 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.05] sm:h-[110px] sm:w-[110px] ${CARD_GLOW_CLASS[variant]}`}
      >
        <Image
          src={CARD_MASCOT_SRC[variant]}
          alt="StudyHub mascot"
          width={110}
          height={110}
          className="h-full w-full object-cover"
          priority
        />
      </div>
    </motion.div>
  );
}

export function AuthFloatingMascot({
  variant,
  placement,
}: {
  variant: AuthVariant;
  placement: AuthMascotPlacement;
}) {
  const isDesktop = placement === "desktop";
  const wrapperClass = isDesktop
    ? "pointer-events-none fixed bottom-5 right-5 z-50"
    : "pointer-events-none relative mx-auto mt-6 w-fit";
  const frameSizeClass = isDesktop
    ? "h-[118px] w-[118px]"
    : "h-[88px] w-[88px] sm:h-[96px] sm:w-[96px]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.8 }}
      className={wrapperClass}
    >
      {isDesktop ? <AuthSpeechBubble /> : null}

      <div className="absolute -left-6 top-2 h-14 w-14 rounded-full bg-brand-300/25 blur-2xl" />
      <div className="absolute -right-4 top-8 h-12 w-12 rounded-full bg-pink-300/20 blur-2xl" />

      <div
        className={`relative overflow-hidden rounded-[1.75rem] border border-white/30 bg-white/10 backdrop-blur-xl [animation:authFloat_3s_ease-in-out_infinite] ${frameSizeClass} ${FLOAT_GLOW_CLASS[variant]}`}
      >
        <Image
          src="/assets/v1/mascot-robot.png"
          alt="StudyHub study buddy"
          width={118}
          height={118}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="absolute -bottom-3 left-1/2 h-8 w-24 -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(6,182,212,0.6),transparent_70%)] [animation:authPulse_2s_ease-in-out_infinite]" />
    </motion.div>
  );
}

function AuthSpeechBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: -15 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.7, delay: 1.2, type: "spring", stiffness: 150 }}
      className="absolute -top-[68px] right-[92px] z-10 min-w-[148px] max-w-[210px] rounded-[44px_44px_44px_10px] border-[3px] border-brand-500 bg-[linear-gradient(135deg,#fef3c7,#fce7f3,#e0e7ff)] px-6 py-3.5 text-center shadow-[5px_5px_0px_#ec4899,inset_0_2px_4px_rgba(255,255,255,0.6)] [animation:wiggle_3s_ease-in-out_infinite] dark:border-brand-300 dark:bg-[linear-gradient(135deg,#1f2542,#25223a,#16203b)]"
    >
      <p className="bg-[linear-gradient(135deg,#6366f1,#ec4899)] bg-clip-text font-shantell text-lg font-extrabold leading-snug text-transparent dark:bg-[linear-gradient(135deg,#c4b5fd,#f9a8d4)]">
        {SPEECH_BUBBLE_LINES[0]}
        <br />
        {SPEECH_BUBBLE_LINES[1]}
      </p>

      <AuthSpeechBubbleSparkles />
    </motion.div>
  );
}

function AuthSpeechBubbleSparkles() {
  return (
    <>
      {SPEECH_SPARKLES.map((className) => (
        <span key={className} className={`absolute ${className}`}>
          <AuthSparkleIcon />
        </span>
      ))}
    </>
  );
}

function AuthSparkleIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="h-full w-full"
    >
      <path
        d="M10 1.5L12.2 7.8L18.5 10L12.2 12.2L10 18.5L7.8 12.2L1.5 10L7.8 7.8L10 1.5Z"
        fill="currentColor"
      />
      <circle cx="10" cy="10" r="1.3" fill="rgba(255,255,255,0.85)" />
    </svg>
  );
}
