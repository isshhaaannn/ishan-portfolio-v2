"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUIStore } from "@/store/useUIStore";
import { Project } from "./3d/HelixCanvas";
import { sfx } from "@/lib/sfx";

/**
 * Inspect: a project lifted out of the helix into a flat view, every slide in
 * its true colours and real shape, swipeable like the post it was made for.
 */
export function InspectView({ projects }: { projects: Project[] }) {
  const { inspectId, setInspect, setActiveProject } = useUIStore();
  const project = inspectId ? projects.find((p) => p.id === inspectId) : null;
  const stripRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const slides = project?.asset_locations ?? [];

  const go = (dir: number) => {
    const strip = stripRef.current;
    if (!strip) return;
    const items = [...strip.children] as HTMLElement[];
    const next = Math.max(0, Math.min(items.length - 1, index + dir));
    items[next]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  useEffect(() => {
    if (!project) return;
    document.body.dataset.inspect = "1";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setInspect(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "Enter") { setActiveProject(project.id); setInspect(null); }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      delete document.body.dataset.inspect;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, index]);

  // Track which slide is centred.
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || !project) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) setIndex(Number((e.target as HTMLElement).dataset.i)); }),
      { root: strip, threshold: 0.6 },
    );
    [...strip.children].forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [project]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="inspect"
          role="dialog"
          aria-modal="true"
          aria-label={`${project.website_project_name}, inspect`}
          className="fixed inset-0 z-[95] flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button type="button" aria-label="Back to the helix" onClick={() => setInspect(null)} className="absolute inset-0 bg-black/85 backdrop-blur-xl cursor-pointer" />

          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 10, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex-1 min-h-0 flex items-center pointer-events-none"
          >
            <div
              ref={stripRef}
              className="pointer-events-auto flex items-center gap-4 overflow-x-auto snap-x snap-mandatory w-full h-full px-[10vw] py-20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {slides.map((src, i) =>
                /\.(mp4|webm|mov)$/i.test(src) ? (
                  <video key={src} data-i={i} src={encodeURI(src)} controls playsInline preload="metadata" className="snap-center shrink-0 max-h-full max-w-[80vw] rounded-lg" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    data-i={i}
                    src={encodeURI(src)}
                    alt={`${project.website_project_name}, ${i + 1} of ${slides.length}`}
                    loading={i < 3 ? "eager" : "lazy"}
                    className="snap-center shrink-0 max-h-full max-w-[80vw] w-auto h-auto object-contain rounded-lg shadow-2xl"
                  />
                ),
              )}
            </div>
          </motion.div>

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 pb-6 pt-2 text-white">
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold tracking-tight truncate">{project.website_project_name}</p>
              <p className="text-xs text-white/55 tabular-nums">{index + 1} / {slides.length}</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => go(-1)} aria-label="Previous slide" className="hidden sm:grid w-10 h-10 place-items-center rounded-full border border-white/20 hover:bg-white/10">←</button>
              <button type="button" onClick={() => go(1)} aria-label="Next slide" className="hidden sm:grid w-10 h-10 place-items-center rounded-full border border-white/20 hover:bg-white/10">→</button>
              <button
                type="button"
                onClick={() => { sfx.open(); setActiveProject(project.id); setInspect(null); }}
                className="rounded-full bg-[#fcfcfc] text-[#100f0c] px-5 py-2.5 text-sm font-medium hover:bg-white"
              >
                full project
              </button>
              <button type="button" onClick={() => setInspect(null)} className="rounded-full border border-white/20 px-4 py-2.5 text-sm hover:bg-white/10">
                back
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
