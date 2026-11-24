import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative min-h-dvh bg-[#000000] text-[#F2EEE5] flex flex-col items-center justify-center px-6 text-center select-none overflow-hidden">
      {/* Subtle ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/[0.03] rounded-full blur-[140px] pointer-events-none" />

      <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/40 mb-4 block">
        Error 404 // Page Not Found
      </span>

      <h1 className="text-7xl sm:text-9xl font-bold tracking-tighter leading-none mb-6 font-sans">
        404
      </h1>

      <p className="max-w-md text-base sm:text-lg text-white/60 mb-10 leading-relaxed font-sans">
        The page you are looking for doesn&apos;t exist or has moved. Explore the curated archive of works below.
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-[#fcfcfc] text-[#100f0c] font-medium rounded-full px-6 py-3 text-sm hover:bg-white shadow-lg hover:shadow-xl transition-all cursor-pointer border border-[#100f0c]/10 group"
      >
        <span>Return to Works</span>
        <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
      </Link>
    </div>
  );
}
