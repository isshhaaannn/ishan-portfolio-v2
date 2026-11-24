"use client";

import { useUIStore } from "@/store/useUIStore";
import { BUYERS } from "@/lib/curation";
import { sfx } from "@/lib/sfx";

/** Buyer-type filter for the helix. Sits under the helix/list switch. */
export function FilterChips() {
  const { filter, setFilter, activeProjectId, isMenuOpen } = useUIStore();
  if (activeProjectId || isMenuOpen) return null;

  const options: { label: string; value: string | null }[] = [
    { label: "all work", value: null },
    ...BUYERS.map((b) => ({ label: b.toLowerCase(), value: b })),
  ];

  return (
    <div
      role="toolbar"
      aria-label="Filter work by client type"
      className="fixed z-30 left-0 right-0 top-[7.25rem] md:top-[3.6rem] flex md:justify-center gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pointer-events-auto"
    >
      {options.map((o) => {
        const active = filter === o.value;
        return (
          <button
            key={o.label}
            type="button"
            aria-pressed={active}
            onClick={() => {
              if (active) return;
              sfx.snap();
              setFilter(o.value);
            }}
            className={`shrink-0 rounded-full px-3.5 py-2 md:py-1.5 text-xs font-medium tracking-tight transition-colors border ${
              active
                ? "bg-[#fcfcfc] text-[#100f0c] border-transparent"
                : "bg-black/40 backdrop-blur-md text-white/70 border-white/15 hover:text-white hover:border-white/35"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
