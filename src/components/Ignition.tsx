"use client";

import { motion } from "framer-motion";

/** First-visit loader: a tachometer needle sweeps up and settles, like a bike starting. */
export function Ignition() {
  const ticks = Array.from({ length: 11 }, (_, i) => i);
  return (
    <div className="flex flex-col items-center gap-3" role="status" aria-label="Loading">
      <svg width="120" height="76" viewBox="0 0 120 76" aria-hidden="true">
        {ticks.map((i) => {
          const a = Math.PI * (1 - i / 10);
          const r1 = 50, r2 = i % 5 === 0 ? 40 : 44;
          return (
            <line key={i}
              x1={60 + Math.cos(a) * r1} y1={66 - Math.sin(a) * r1}
              x2={60 + Math.cos(a) * r2} y2={66 - Math.sin(a) * r2}
              stroke={i >= 8 ? "#ff3b2f" : "rgba(242,238,229,0.55)"} strokeWidth={i % 5 === 0 ? 2.2 : 1.4} strokeLinecap="round" />
          );
        })}
        <motion.line
          x1="60" y1="66" x2="60" y2="22"
          stroke="#F2EEE5" strokeWidth="2.4" strokeLinecap="round"
          style={{ originX: "60px", originY: "66px" }}
          initial={{ rotate: -90 }}
          animate={{ rotate: [-90, 72, -38] }}
          transition={{ duration: 0.85, times: [0, 0.55, 1], ease: ["easeIn", "easeOut"] }}
        />
        <circle cx="60" cy="66" r="4" fill="#F2EEE5" />
      </svg>
      <span className="text-[10px] tracking-[0.3em] uppercase text-white/45">ignition</span>
    </div>
  );
}
