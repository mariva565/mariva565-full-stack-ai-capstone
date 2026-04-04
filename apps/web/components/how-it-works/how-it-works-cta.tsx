"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { useVisibleAnimation } from "../ui/use-visible-animation";

export function HowItWorksCta() {
  const { ref, isVisible, hasEntered, shouldAnimate } =
    useVisibleAnimation<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section className="bg-slate-50 px-4 pb-24 pt-4 dark:bg-[#0f172a]">
      <div ref={ref} className="container mx-auto max-w-4xl">
        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 32 } : false}
          animate={hasEntered ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: shouldAnimate ? 0.65 : 0, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 px-8 py-16 text-center shadow-[0_20px_60px_rgba(99,102,241,0.3)]"
        >
          {/* Decorative circles */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -right-24 -top-24 h-[300px] w-[300px] rounded-full bg-white/10" />
            <div className="absolute -bottom-12 -left-12 h-[200px] w-[200px] rounded-full bg-white/10" />
            <div className="absolute left-[20%] top-1/2 h-[100px] w-[100px] rounded-full bg-white/10" />
          </div>

          <div className="relative z-10">
            {/* Floating rocket icon */}
            <motion.div
              animate={
                isVisible && shouldAnimate
                  ? { y: [0, -10, 0] }
                  : { y: 0 }
              }
              transition={
                isVisible && shouldAnimate
                  ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.25 }
              }
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20"
            >
              <svg
                className="h-10 w-10 text-white"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M12.17 9.53c2.307-2.592 3.278-4.684 3.641-6.218.21-.887.214-1.58.16-2.065a3.578 3.578 0 0 0-.108-.563 2.22 2.22 0 0 0-.078-.23V.453c-.073-.164-.168-.234-.352-.295a2.35 2.35 0 0 0-.16-.045 3.797 3.797 0 0 0-.57-.093c-.49-.044-1.19-.03-2.08.188-1.536.374-3.618 1.343-6.161 3.677l-2.95 2.71H.99a.5.5 0 0 0-.353.853l1.347 1.346L.586 9.58a.756.756 0 0 0 .56 1.281l2.72-.101.182 1.634a.756.756 0 0 0 1.282.333l.58-.58 1.346 1.347a.5.5 0 0 0 .853-.354V11.5l2.71-2.95.001-.001zm.11-3.7c-.091.566-.392 1.306-.987 2.228a3.592 3.592 0 0 0-.103-.18c-.61-.954-1.373-1.717-2.327-2.327a4.046 4.046 0 0 0-.18-.103c.921-.595 1.662-.896 2.228-.987.39-.063.67-.05.835-.02.166.032.258.08.282.104.024.024.072.116.104.282.03.166.043.446-.02.835zM8 11.032v1.925l-3.957-3.956 1.093-1.093 1.666 1.53c.462.444.916.796 1.198 1.228v.366zM4.956 8L3.043 4.957l1.093-1.093 1.228 1.198c.444.462.796.916 1.228 1.198L4.956 8z" />
                <path d="M10.5 1.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V2a.5.5 0 0 1 .5-.5zM12 4.5a.5.5 0 0 0 .5-.5V3a.5.5 0 0 0-1 0v1a.5.5 0 0 0 .5.5z" />
              </svg>
            </motion.div>

            <h2 className="font-shantell text-4xl font-extrabold text-white sm:text-5xl">
              Готов ли си да започнеш?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-white/85">
              Събери всички учебни материали на едно място. Спести време и учи организирано.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-indigo-600 shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)]"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                </svg>
                Създай безплатен акаунт
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/50 px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:border-white hover:bg-white/15"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z" />
                </svg>
                Имаш въпроси?
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
