'use client';
export default function Card({ children, className="" }) {
  return (
    <div className={[
      "rounded-xl2 border border-black/10 bg-white/70 p-8 backdrop-blur-xl shadow-card",
      className
    ].join(' ')}>
      {children}
    </div>
  );
}
