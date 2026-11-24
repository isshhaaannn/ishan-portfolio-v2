"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled runtime error:", error);
  }, [error]);

  return (
    <div className="relative min-h-dvh bg-[#000000] text-[#F2EEE5] flex flex-col items-center justify-center px-6 text-center select-none overflow-hidden">
      <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/40 mb-4 block">
        System Notice // Recovery
      </span>

      <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter leading-tight mb-4 font-sans">
        Something went wrong
      </h1>

      <p className="max-w-md text-sm sm:text-base text-white/60 mb-8 leading-relaxed font-sans">
        An unexpected error occurred while rendering this scene. You can try refreshing the canvas or return to the main gallery.
      </p>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => reset()}
          className="bg-[#fcfcfc] text-[#100f0c] font-medium rounded-full px-6 py-2.5 text-sm hover:bg-white transition-all cursor-pointer shadow-md"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="text-white/70 hover:text-white font-medium text-sm transition-colors px-4 py-2.5"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
