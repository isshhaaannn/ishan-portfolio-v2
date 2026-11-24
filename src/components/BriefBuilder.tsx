"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUIStore } from "@/store/useUIStore";
import { BOOKING_URL } from "@/lib/booking";
import { BRIEF_OPTIONS } from "@/lib/site";
import { sfx } from "@/lib/sfx";

/** Cal.com booking link with the founder's picks prefilled into the notes field. */
export function bookingUrlWithNotes(picks: string[], extra: string) {
  const parts: string[] = [];
  if (picks.length) parts.push(`Interested in: ${picks.join(", ")}.`);
  if (extra.trim()) parts.push(extra.trim());
  if (!parts.length) return BOOKING_URL;
  return `${BOOKING_URL}?notes=${encodeURIComponent(parts.join("\n\n"))}`;
}

/**
 * "Build your brief": founders tick what they need, then go to Cal.com with it
 * prefilled, so the intro call starts already knowing the scope.
 */
export function BriefBuilder() {
  const { isBriefOpen, closeBrief } = useUIStore();
  const [picks, setPicks] = useState<string[]>([]);
  const [extra, setExtra] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isBriefOpen) return;
    sfx.swish(true);
    returnFocus.current = document.activeElement as HTMLElement | null;
    const first = panelRef.current?.querySelector<HTMLElement>("button, textarea, a");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeBrief();
      if (e.key === "Tab" && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>("button, textarea, a[href]");
        if (!f.length) return;
        const a = f[0]!, z = f[f.length - 1]!;
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      returnFocus.current?.focus?.();
    };
  }, [isBriefOpen, closeBrief]);

  const toggle = (o: string) => setPicks((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]));
  const href = bookingUrlWithNotes(picks, extra);

  return (
    <AnimatePresence>
      {isBriefOpen && (
        <motion.div className="fixed inset-0 z-[110]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button
            type="button"
            aria-label="Close"
            onClick={closeBrief}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm cursor-pointer"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="brief-title"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-3 right-3 bottom-3 left-3 sm:left-auto sm:top-4 sm:right-4 sm:bottom-4 sm:w-[440px] rounded-[18px] bg-[#fcfcfc] text-[#100f0c] p-6 sm:p-9 flex flex-col overflow-y-auto shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="brief-title" className="text-4xl sm:text-5xl font-bold tracking-tighter leading-[0.95]">
                  what do you need?
                </h2>
                <p className="mt-3 text-sm text-[#100f0c]/65 max-w-xs">
                  Tick everything that applies. It goes into your booking, so our 30-minute call starts on the right foot.
                </p>
              </div>
              <button
                type="button"
                onClick={closeBrief}
                className="shrink-0 flex items-center gap-1.5 rounded-full border border-[#100f0c]/15 px-4 py-2 text-sm font-medium hover:bg-[#100f0c]/5"
              >
                close <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="mt-7 flex flex-wrap gap-2" role="group" aria-label="Services">
              {BRIEF_OPTIONS.map((o) => {
                const on = picks.includes(o);
                return (
                  <button
                    key={o}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(o)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium border transition-colors ${
                      on ? "bg-[#100f0c] text-white border-[#100f0c]" : "bg-transparent border-[#100f0c]/15 hover:border-[#100f0c]/40"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${on ? "bg-white" : "bg-[#100f0c]/30"}`}
                    />
                    {o}
                  </button>
                );
              })}
            </div>

            <label htmlFor="brief-extra" className="mt-7 text-sm font-medium">
              Anything else? <span className="text-[#100f0c]/50 font-normal">(optional)</span>
            </label>
            <textarea
              id="brief-extra"
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              rows={3}
              placeholder="Your company, a link, or what you're launching"
              className="mt-2 w-full rounded-xl border border-[#100f0c]/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#100f0c]/50 resize-none"
            />

            <div className="mt-auto pt-8 flex flex-col gap-3">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setTimeout(closeBrief, 50)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#100f0c] text-white px-6 py-3.5 text-base font-medium hover:bg-[#2a2924] transition-colors"
              >
                {picks.length ? `continue with ${picks.length} picked` : "continue to booking"} <span aria-hidden="true">→</span>
              </a>
              <p className="text-center text-xs text-[#100f0c]/55">Opens Cal.com in a new tab. 30 minutes, free.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
