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
    const busy = (e: Event) => {
      // Using the hero itself (its book button) is not "spinning".
      if ((e.target as Element | null)?.closest?.("[data-hero]")) return;
      setQuiet(false); // shown once on arrival; gone after the first interaction
    };
    window.addEventListener("wheel", busy, { passive: true });
    window.addEventListener("pointerdown", busy, { passive: true });
    window.addEventListener("keydown", busy);
    return () => {
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
          data-hero
          aria-label="Introduction"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed z-20 left-4 right-4 sm:left-6 bottom-8 md:bottom-12 max-w-xl pointer-events-none"
        >
          {/* Soft scrim so the line stays readable over light tiles drifting behind it. */}
          <div
            aria-hidden="true"
            className="absolute -inset-x-10 -inset-y-12 -z-10 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 30% 60%, rgba(0,0,0,0.78), rgba(0,0,0,0.45) 55%, transparent 78%)" }}
          />
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
