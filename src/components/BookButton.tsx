"use client";

import { useUIStore } from "@/store/useUIStore";

/** Opens the brief builder (which leads to Cal.com). */
export function BookButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const openBrief = useUIStore((s) => s.openBrief);
  return (
    <button type="button" onClick={openBrief} className={className}>
      {children}
    </button>
  );
}
