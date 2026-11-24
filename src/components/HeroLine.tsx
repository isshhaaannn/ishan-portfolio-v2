"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUIStore } from "@/store/useUIStore";
import { HERO } from "@/lib/site";

/**
 * One line over the helix that says who this is for. It steps aside the moment
 * someone starts spinning, and comes back after a few quiet seconds.
 */
export function HeroLine() {
  const { hoveredProject, activeProjectId, isMenuOpen, openBrief } = useUIStore();
  const [quiet, setQuiet] = useState(true);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const busy = () => {
      setQuiet(false);
      clearTimeout(t);
      t = setTimeout(() => setQuiet(true), 7000);
    };
    window.addEventListener("wheel", busy, { passive: true });
    window.addEventListener("pointerdown", busy, { passive: true });
    window.addEventListener("keydown", busy);
    return () => {
      clearTimeout(t);
      window.removeEventListener("wheel", busy);
      window.removeEventListener("pointerdown", busy);
      window.removeEventListener("keydown", busy);
    };
  }, []);

  const show = quiet && !hoveredProject && !activeProjectId && !isMenuOpen;

  return (
    <AnimatePresence>
      {show && (
        <motion.section
          aria-label="Introduction"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed z-20 left-4 right-4 sm:left-6 bottom-16 md:bottom-20 max-w-xl pointer-events-none"
        >
          <h1 className="text-[2.35rem] leading-[0.95] sm:text-5xl md:text-6xl font-bold tracking-tighter text-white text-balance">
            {HERO.line}
          </h1>
          <p className="mt-3 text-sm md:text-base text-white/65 max-w-md text-pretty">{HERO.sub}</p>
          <button
            type="button"
            onClick={openBrief}
            className="mt-5 pointer-events-auto inline-flex items-center gap-2 bg-[#fcfcfc] text-[#100f0c] font-medium rounded-full px-5 py-2.5 text-sm hover:bg-white transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#100f0c]" aria-hidden="true" />
            book a call
          </button>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
