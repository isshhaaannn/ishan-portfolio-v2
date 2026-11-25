"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUIStore } from "@/store/useUIStore";
import { SECRET_WORD } from "@/lib/site";
import { sfx } from "@/lib/sfx";

/**
 * Hidden freebie: typing the secret word anywhere (outside a text field)
 * unlocks the "Think. Design. Win." wallpaper pack.
 */
export function Freebie({ images }: { images: string[] }) {
  const { isFreebieOpen, setFreebieOpen } = useUIStore();
  const typed = useRef("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "Escape") { setFreebieOpen(false); return; }
      if (e.key.length !== 1) return;
      typed.current = (typed.current + e.key.toLowerCase()).slice(-SECRET_WORD.length);
      if (typed.current === SECRET_WORD) {
        typed.current = "";
        sfx.sparkle();
        setFreebieOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setFreebieOpen]);

  if (!images.length) return null;

  return (
    <AnimatePresence>
      {isFreebieOpen && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button type="button" aria-label="Close" onClick={() => setFreebieOpen(false)} className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="freebie-title"
            initial={{ y: 24, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 12, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-3xl max-h-[88dvh] overflow-y-auto rounded-[18px] bg-[#0c0c0b] border border-white/10 p-6 sm:p-9 text-[#F2EEE5]"
          >
            <h2 id="freebie-title" className="text-4xl sm:text-5xl font-bold tracking-tighter">You found it. Respect.</h2>
            <p className="mt-3 text-sm text-white/60 max-w-md">My “Think. Design. Win.” wallpaper pack, free. Tap any one to download it.</p>
            <ul className="mt-7 grid grid-cols-2 sm:grid-cols-5 gap-3">
              {images.map((src) => (
                <li key={src}>
                  <a
                    href={encodeURI(src)}
                    download
                    className="group block overflow-hidden rounded-xl border border-white/10 bg-white/5 focus-visible:outline-2 focus-visible:outline-white"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={encodeURI(src)} alt="Think. Design. Win. wallpaper" loading="lazy" className="w-full aspect-[9/16] sm:aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-105" />
                  </a>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setFreebieOpen(false)}
              className="mt-7 rounded-full bg-[#fcfcfc] text-[#100f0c] px-5 py-2.5 text-sm font-medium"
            >
              close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
