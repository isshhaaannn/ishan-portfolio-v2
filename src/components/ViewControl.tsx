"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUIStore } from "@/store/useUIStore";
import { BUYERS } from "@/lib/curation";
import { sfx } from "@/lib/sfx";

/** One control for view (helix/list) and filter, replacing the switch + five chips. */
export function ViewControl() {
  const { viewMode, setViewMode, filter, setFilter } = useUIStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", esc);
    return () => { window.removeEventListener("pointerdown", close); window.removeEventListener("keydown", esc); };
  }, [open]);

  const label = (filter ?? "all work").toLowerCase();
  const item = (active: boolean) =>
    `w-full text-left rounded-full px-3.5 py-2 text-sm transition-colors ${active ? "bg-[#100f0c] text-white" : "hover:bg-[#100f0c]/5"}`;

  return (
    <div ref={ref} className="fixed top-18 md:top-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-white px-4 py-2 text-xs md:text-sm font-medium tracking-tight hover:border-white/35 min-h-10 md:min-h-0"
      >
        <span className="text-white/60">{viewMode === "spiral" ? "helix" : "list"}</span>
        <span className="w-1 h-1 rounded-full bg-white/40" aria-hidden="true" />
        <span>{label}</span>
        <span aria-hidden="true" className={`transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 rounded-2xl bg-[#fcfcfc] text-[#100f0c] p-2 shadow-2xl"
          >
            <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-[#100f0c]/5" role="group" aria-label="View">
              {(["spiral", "list"] as const).map((v) => (
                <button key={v} type="button" aria-pressed={viewMode === v} onClick={() => { sfx.snap(); setViewMode(v); }}
                  className={`rounded-full py-1.5 text-sm ${viewMode === v ? "bg-white shadow-sm font-medium" : "text-[#100f0c]/60"}`}>
                  {v === "spiral" ? "helix" : "list"}
                </button>
              ))}
            </div>
            <div className="mt-2 grid gap-0.5" role="group" aria-label="Filter by client type">
              {[null, ...BUYERS].map((b) => (
                <button key={b ?? "all"} type="button" aria-pressed={filter === b}
                  onClick={() => { if (filter !== b) { sfx.snap(); setFilter(b); } setOpen(false); }}
                  className={item(filter === b)}>
                  {(b ?? "all work").toLowerCase()}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
