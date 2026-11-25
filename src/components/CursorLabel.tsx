"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useUIStore } from "@/store/useUIStore";

/**
 * A small label that follows the pointer over the helix: "drag" over empty
 * space, "open" over a tile. Desktop pointers only.
 */
export function CursorLabel() {
  const { isOverStage, hoveredProject, activeProjectId, isMenuOpen, isBriefOpen, viewMode } = useUIStore();
  // Hidden until the pointer is over the stage, so server/client first render match.
  const [fine] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches,
  );
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { damping: 30, stiffness: 420, mass: 0.4 });
  const sy = useSpring(y, { damping: 30, stiffness: 420, mass: 0.4 });

  useEffect(() => {
    const move = (e: PointerEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);

  const show = fine && isOverStage && viewMode === "spiral" && !activeProjectId && !isMenuOpen && !isBriefOpen;
  const text = hoveredProject ? "tap in" : "drag";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.18 }}
          style={{ x: sx, y: sy }}
          className="fixed left-0 top-0 z-90 pointer-events-none"
        >
          <motion.span
            key={text}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`block translate-x-4 translate-y-4 rounded-full px-3 py-1 text-[11px] font-medium tracking-wide lowercase ${
              hoveredProject ? "bg-[#fcfcfc] text-[#100f0c]" : "bg-black/55 text-white/80 border border-white/20 backdrop-blur-md"
            }`}
          >
            {text}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
