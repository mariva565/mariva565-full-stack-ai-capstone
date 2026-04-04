"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";

import { useVisibleAnimation } from "../ui/use-visible-animation";
import { GALLERY_ITEMS } from "./content";

/* ── Lightbox overlay ────────────────────────────────── */

function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal
    >
      <button
        className="absolute right-6 top-5 text-5xl leading-none text-white/70 transition-opacity hover:text-white"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        &times;
      </button>
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={750}
        className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-[0_0_50px_rgba(99,102,241,0.3)]"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

/* ── Single gallery card (3D tilt on hover) ──────────── */

function GalleryCard({
  src,
  alt,
  label,
  index,
  onOpen,
  shouldAnimate,
  hasEntered,
}: {
  src: string | null;
  alt: string;
  label: string;
  index: number;
  onOpen: (src: string, alt: string) => void;
  shouldAnimate: boolean;
  hasEntered: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1000px)");

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const rotateY = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
      const rotateX = -((e.clientY - rect.top) / rect.height - 0.5) * 20;
      setTransform(
        `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateZ(10px)`
      );
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setTransform("perspective(1000px)");
  }, []);

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, scale: 0.9 } : false}
      animate={hasEntered ? { opacity: 1, scale: 1 } : undefined}
      transition={{
        duration: shouldAnimate ? 0.5 : 0,
        delay: shouldAnimate ? index * 0.1 : 0,
        ease: "easeOut",
      }}
    >
      <div
        ref={cardRef}
        className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-shadow duration-500 hover:shadow-[0_25px_60px_rgba(99,102,241,0.2)] dark:bg-slate-800 dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)]"
        style={{ transform, transition: "transform 0.12s ease-out" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => src && onOpen(src, alt)}
      >
        <div className="aspect-[16/10] overflow-hidden">
          {src ? (
            <Image
              src={src}
              alt={alt}
              width={600}
              height={375}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40">
              <svg
                className="h-12 w-12 text-indigo-400/70 dark:text-indigo-300/50"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z" />
              </svg>
              <span className="text-sm font-semibold uppercase tracking-widest text-indigo-400/80 dark:text-indigo-300/50">
                Очаквайте скоро
              </span>
            </div>
          )}
        </div>

        {/* Hover overlay label */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 to-transparent p-5 transition-transform duration-400 group-hover:translate-y-0">
          <span className="text-base font-semibold text-white">{label}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Gallery section ─────────────────────────────────── */

export function HowItWorksGallery() {
  const { ref, hasEntered, shouldAnimate } =
    useVisibleAnimation<HTMLDivElement>({ mode: "once", threshold: 0.1 });

  const [lightbox, setLightbox] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  const openLightbox = useCallback((src: string, alt: string) => {
    setLightbox({ src, alt });
  }, []);

  const closeLightbox = useCallback(() => {
    setLightbox(null);
  }, []);

  return (
    <section className="bg-slate-50 py-24 dark:bg-[#0f172a]">
      <div ref={ref} className="container mx-auto max-w-4xl px-4">
        {/* Heading */}
        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 24 } : false}
          animate={hasEntered ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: shouldAnimate ? 0.6 : 0, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-5 py-2 text-sm font-semibold text-indigo-600 shadow-sm backdrop-blur-sm dark:text-indigo-300">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
              <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
              <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
            </svg>
            Преглед
          </span>
          <h2 className="font-shantell text-4xl font-extrabold text-slate-800 dark:text-white">
            Виж платформата в действие
          </h2>
          <p className="mx-auto mt-3 max-w-md text-lg text-slate-500 dark:text-white/60">
            Кратък поглед върху интерфейса на Study Hub
          </p>
        </motion.div>

        {/* 2x2 grid */}
        <div className="grid gap-8 sm:grid-cols-2">
          {GALLERY_ITEMS.map((item, index) => (
            <GalleryCard
              key={item.label}
              src={item.src}
              alt={item.alt}
              label={item.label}
              index={index}
              onOpen={openLightbox}
              shouldAnimate={shouldAnimate}
              hasEntered={hasEntered}
            />
          ))}
        </div>
      </div>

      {lightbox && (
        <Lightbox
          src={lightbox.src}
          alt={lightbox.alt}
          onClose={closeLightbox}
        />
      )}
    </section>
  );
}
