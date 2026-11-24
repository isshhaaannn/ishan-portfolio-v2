"use client";

import { useUIStore } from "@/store/useUIStore";
import { PROOF } from "@/lib/site";

/** Thin marquee of real numbers and names along the bottom of the home page. */
export function ProofTicker() {
  const { activeProjectId, isMenuOpen } = useUIStore();
  if (activeProjectId || isMenuOpen) return null;

  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center gap-8 pr-8" aria-hidden={hidden || undefined}>
      {PROOF.map((p) => (
        <li key={p} className="flex items-center gap-8 whitespace-nowrap">
          <span>{p}</span>
          <span className="w-1 h-1 rounded-full bg-white/35" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );

  return (
    <div
      aria-label="Clients and results"
      className="proof-ticker group fixed z-20 bottom-0 left-0 right-0 h-10 flex items-center overflow-hidden border-t border-white/10 bg-black/55 backdrop-blur-md text-[11px] md:text-xs font-medium tracking-wide text-white/75 uppercase"
    >
      <div className="proof-ticker__track flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
