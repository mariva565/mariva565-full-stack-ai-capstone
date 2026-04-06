"use client";

import { motion } from "framer-motion";

export function AdminHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-white shadow-2xl"
    >
      {/* Decorative blobs */}
      <div className="absolute -right-8 -top-8 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-8 -left-8 h-48 w-48 rounded-full bg-primary-400/20 blur-2xl" />

      <div className="relative z-10 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl font-black tracking-tight font-shantell">
            Welcome back, Chief! 🚀
          </h2>
          <p className="mt-4 text-lg text-primary-100/90 leading-relaxed">
            The system is running smoothly. You have full control over courses, 
            users, and materials. Check the latest activity trends below.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex gap-4"
        >
          <div className="rounded-2xl bg-white/15 px-5 py-3 backdrop-blur-md border border-white/10">
            <p className="text-xs font-bold uppercase tracking-widest text-primary-200">System Status</p>
            <p className="text-sm font-bold flex items-center gap-2 mt-1">
              <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)] animate-pulse" />
              All Systems Operational
            </p>
          </div>
          <div className="rounded-2xl bg-white/15 px-5 py-3 backdrop-blur-md border border-white/10">
            <p className="text-xs font-bold uppercase tracking-widest text-primary-200">Active Sessions</p>
            <p className="text-sm font-bold mt-1">1,240 Users Live</p>
          </div>
        </motion.div>
      </div>

      <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden lg:block opacity-20">
        <svg className="h-48 w-48 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
          <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
          <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" />
        </svg>
      </div>
    </motion.div>
  );
}
