import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="bg-qx-black min-h-[70vh] flex items-center justify-center px-4 text-center select-none">
      <div className="max-w-md mx-auto">
        <span className="font-mono text-xs uppercase tracking-[0.28em] text-[#2ABD00]">
          404 ERROR
        </span>
        <h1 className="qx-display text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mt-3 mb-4">
          Page Not Found<span className="text-[#2ABD00]">.</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#919A94] leading-relaxed mb-6 font-sans">
          The page or article you are looking for doesn&apos;t exist, has been removed, or is temporarily unavailable.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[4px] border border-[#2ABD00]/70 bg-[#06180a] text-[#2ABD00] font-mono text-xs uppercase tracking-[0.25em] font-semibold hover:bg-[#2ABD00]/15 hover:shadow-[0_0_16px_rgba(42,189,0,0.35)] transition-all"
        >
          <span>Return Home</span>
        </Link>
      </div>
    </main>
  );
}

