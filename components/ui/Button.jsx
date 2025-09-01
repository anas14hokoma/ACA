'use client';
export default function Button({ children, className="", ...props }) {
  return (
    <button
      {...props}
      className={[
        "group relative inline-flex w-full items-center justify-center rounded-lg",
        "bg-ink-900 py-2.5 px-4 text-sm font-semibold text-white",
        "shadow-lg transition duration-200 ease-smooth hover:opacity-95 focus:outline-none focus:shadow-ring disabled:opacity-60 disabled:cursor-not-allowed",
        className
      ].join(' ')}
    >
      <span className="relative z-10">{children}</span>
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.28),transparent)] opacity-0 transition-all duration-700 group-hover:translate-x-0 group-hover:opacity-100" />
      <span className="pointer-events-none absolute inset-x-0 -bottom-[2px] mx-auto block h-[2px] w-2/3 bg-gradient-to-r from-aca-green via-aca-gold to-aca-red opacity-80" />
    </button>
  );
}
